use serde::Serialize;
use std::fs;
use std::path::Path;
use tauri::{AppHandle, Emitter};
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
pub struct FileResult {
    path: String,
    content: String,
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_file_dialog(app: AppHandle) -> Result<Option<FileResult>, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    app.dialog().file().add_filter("Markdown", &["md", "mdx", "markdown"]).pick_file(move |file_path| {
        tx.send(file_path).unwrap();
    });

    if let Ok(Some(file_path)) = rx.recv() {
        let path_str = file_path.into_path().unwrap().to_string_lossy().to_string();
        let content = fs::read_to_string(&path_str).unwrap_or_default();
        Ok(Some(FileResult {
            path: path_str,
            content,
        }))
    } else {
        Ok(None)
    }
}

use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use std::sync::Mutex;
use tauri::State;

pub struct WatcherState {
    pub watcher: Mutex<Option<RecommendedWatcher>>,
}

#[tauri::command]
pub async fn watch_file(path: String, app: AppHandle, state: State<'_, WatcherState>) -> Result<(), String> {
    let mut watcher_guard = state.watcher.lock().unwrap();

    // Stop previous watcher if exists
    *watcher_guard = None;

    let app_handle = app.clone();
    let path_clone = path.clone();
    let mut watcher = notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| {
        match res {
            Ok(event) => {
                if event.kind.is_modify() || event.kind.is_create() {
                    let _ = app_handle.emit("file-changed", &path_clone);
                }
            }
            Err(_) => {}
        }
    }).map_err(|e| e.to_string())?;

    watcher.watch(Path::new(&path), RecursiveMode::NonRecursive).map_err(|e| e.to_string())?;
    *watcher_guard = Some(watcher);

    Ok(())
}

#[tauri::command]
pub async fn unwatch_file(state: State<'_, WatcherState>) -> Result<(), String> {
    let mut watcher_guard = state.watcher.lock().unwrap();
    *watcher_guard = None;
    Ok(())
}

pub struct InitialFileState {
    pub path: Mutex<Option<String>>,
}

#[tauri::command]
pub async fn get_initial_file(state: State<'_, InitialFileState>) -> Result<Option<String>, String> {
    let mut guard = state.path.lock().unwrap();
    Ok(guard.take()) // take() returns the value and leaves None — one-shot
}

#[tauri::command]
pub fn open_default_apps_settings() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        return set_default_windows();
    }
    #[cfg(target_os = "linux")]
    {
        ensure_linux_desktop_entry()?;
        let mime_types = ["text/markdown", "text/x-markdown"];
        for mime in mime_types {
            let output = std::process::Command::new("xdg-mime")
                .args(["default", "markview.desktop", mime])
                .output()
                .map_err(|e| format!("xdg-mime spawn failed: {e}"))?;
            if !output.status.success() {
                return Err(format!(
                    "xdg-mime failed for {mime}: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }
        }
        return Ok(());
    }
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    Err("Setting default app is not supported on this platform yet".into())
}

/// Register MarkView as the default handler for .md/.mdx/.markdown on Windows.
///
/// Writes to HKCU (no admin required):
/// 1. ProgID with shell\open\command pointing to current exe
/// 2. OpenWithProgids entries so MarkView appears in "Open With"
/// 3. RegisteredApplications + Capabilities for Windows Settings integration
/// 4. Notifies the shell so Explorer picks up the change immediately
#[cfg(target_os = "windows")]
fn set_default_windows() -> Result<(), String> {
    use winreg::enums::*;
    use winreg::RegKey;

    let exe = std::env::current_exe()
        .map_err(|e| format!("current_exe: {e}"))?;
    let exe_str = exe.to_string_lossy().to_string();
    let open_cmd = format!("\"{}\" \"%1\"", exe_str);
    let prog_id = "MarkView.Markdown";
    let extensions = [".md", ".mdx", ".markdown"];

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);

    // 1. Create ProgID: HKCU\Software\Classes\MarkView.Markdown
    let (prog_key, _) = hkcu
        .create_subkey(format!("Software\\Classes\\{}", prog_id))
        .map_err(|e| format!("create ProgID: {e}"))?;
    prog_key.set_value("", &"Markdown Document").map_err(|e| format!("set ProgID default: {e}"))?;

    // FriendlyTypeName
    prog_key
        .set_value("FriendlyTypeName", &"Markdown Document")
        .map_err(|e| format!("set FriendlyTypeName: {e}"))?;

    // DefaultIcon
    let (icon_key, _) = prog_key
        .create_subkey("DefaultIcon")
        .map_err(|e| format!("create DefaultIcon: {e}"))?;
    icon_key
        .set_value("", &format!("{},0", exe_str))
        .map_err(|e| format!("set icon: {e}"))?;

    // shell\open\command
    let (cmd_key, _) = prog_key
        .create_subkey("shell\\open\\command")
        .map_err(|e| format!("create command key: {e}"))?;
    cmd_key
        .set_value("", &open_cmd)
        .map_err(|e| format!("set command: {e}"))?;

    // 2. Register for each extension
    for ext in extensions {
        // Set OpenWithProgids so MarkView appears in "Open with" menu
        let (owp_key, _) = hkcu
            .create_subkey(format!("Software\\Classes\\{}\\OpenWithProgids", ext))
            .map_err(|e| format!("create OpenWithProgids for {ext}: {e}"))?;
        // Empty binary value to register
        owp_key
            .set_raw_value(prog_id, &winreg::RegValue {
                vtype: REG_NONE,
                bytes: vec![],
            })
            .map_err(|e| format!("set OpenWithProgids for {ext}: {e}"))?;

        // Set the extension default to our ProgID
        let (ext_key, _) = hkcu
            .create_subkey(format!("Software\\Classes\\{}", ext))
            .map_err(|e| format!("create ext key for {ext}: {e}"))?;
        ext_key
            .set_value("", &prog_id)
            .map_err(|e| format!("set ext default for {ext}: {e}"))?;

        // Clear UserChoice so Windows re-evaluates (best effort — may be protected)
        let uc_path = format!(
            "Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\{}\\UserChoice",
            ext
        );
        let _ = hkcu.delete_subkey_all(&uc_path); // ignore errors — often protected
    }

    // 3. Register as a "Registered Application" for Windows Settings integration
    let (cap_key, _) = hkcu
        .create_subkey("Software\\MarkView\\Capabilities")
        .map_err(|e| format!("create Capabilities: {e}"))?;
    cap_key
        .set_value("ApplicationName", &"MarkView - Markdown Reader")
        .map_err(|e| format!("set ApplicationName: {e}"))?;
    cap_key
        .set_value("ApplicationDescription", &"A clean, fast Markdown reader for Windows")
        .map_err(|e| format!("set ApplicationDescription: {e}"))?;

    let (fa_key, _) = cap_key
        .create_subkey("FileAssociations")
        .map_err(|e| format!("create FileAssociations: {e}"))?;
    for ext in extensions {
        fa_key
            .set_value(ext, &prog_id)
            .map_err(|e| format!("set FileAssociation for {ext}: {e}"))?;
    }

    let (reg_apps, _) = hkcu
        .create_subkey("Software\\RegisteredApplications")
        .map_err(|e| format!("create RegisteredApplications: {e}"))?;
    reg_apps
        .set_value("MarkView", &"Software\\MarkView\\Capabilities")
        .map_err(|e| format!("set RegisteredApplications: {e}"))?;

    // 4. Notify the shell that associations have changed
    notify_shell_assoc_changed();

    Ok(())
}

/// Call SHChangeNotify(SHCNE_ASSOCCHANGED) to tell Explorer to refresh file associations.
#[cfg(target_os = "windows")]
fn notify_shell_assoc_changed() {
    // Load shell32.dll and call SHChangeNotify dynamically to avoid linking issues.
    // SHCNE_ASSOCCHANGED = 0x08000000, SHCNF_IDLIST = 0x0000
    use std::ffi::CString;
    let lib_name = CString::new("shell32.dll").unwrap();
    let fn_name = CString::new("SHChangeNotify").unwrap();
    unsafe {
        let lib = winapi_load_library(lib_name.as_ptr());
        if !lib.is_null() {
            let func = winapi_get_proc(lib, fn_name.as_ptr());
            if !func.is_null() {
                let sh_change_notify: unsafe extern "system" fn(i32, u32, *const (), *const ()) =
                    std::mem::transmute(func);
                sh_change_notify(0x08000000, 0x0000, std::ptr::null(), std::ptr::null());
            }
        }
    }
}

#[cfg(target_os = "windows")]
unsafe fn winapi_load_library(name: *const i8) -> *mut std::ffi::c_void {
    extern "system" {
        fn LoadLibraryA(lpLibFileName: *const i8) -> *mut std::ffi::c_void;
    }
    unsafe { LoadLibraryA(name) }
}

#[cfg(target_os = "windows")]
unsafe fn winapi_get_proc(module: *mut std::ffi::c_void, name: *const i8) -> *mut std::ffi::c_void {
    extern "system" {
        fn GetProcAddress(hModule: *mut std::ffi::c_void, lpProcName: *const i8) -> *mut std::ffi::c_void;
    }
    unsafe { GetProcAddress(module, name) }
}

/// On Linux, ensure a user-local markview.desktop exists at
/// ~/.local/share/applications/markview.desktop so that xdg-mime can reference
/// it. Packaged installs (deb/appimage/snap) already ship one system-wide —
/// this is a safety net mainly for dev builds.
#[cfg(target_os = "linux")]
fn ensure_linux_desktop_entry() -> Result<(), String> {
    let home = std::env::var("HOME").map_err(|_| "HOME not set".to_string())?;
    let apps_dir = std::path::PathBuf::from(&home).join(".local/share/applications");
    fs::create_dir_all(&apps_dir).map_err(|e| format!("create apps dir: {e}"))?;
    let desktop_path = apps_dir.join("markview.desktop");

    // Prefer system-installed entry if present — don't overwrite it.
    if Path::new("/usr/share/applications/markview.desktop").exists() {
        return Ok(());
    }

    let exe = std::env::current_exe().map_err(|e| format!("current_exe: {e}"))?;
    let exe_str = exe.to_string_lossy();
    // Desktop Entry spec: quote exe path if it contains spaces or special chars,
    // and escape inner double-quotes + backslashes.
    let exe_escaped = exe_str.replace('\\', r"\\").replace('"', r#"\""#);
    let exec_field = if exe_str.contains(|c: char| c.is_whitespace() || "\"`$".contains(c)) {
        format!("\"{exe_escaped}\" %f")
    } else {
        format!("{exe_str} %f")
    };
    let content = format!(
        "[Desktop Entry]\nType=Application\nName=MarkView\nGenericName=Markdown Reader\n\
         Comment=Read Markdown files with Mermaid, KaTeX, and Vega-Lite support\n\
         Exec={exec_field}\nIcon=markview\nTerminal=false\n\
         Categories=Office;TextEditor;Viewer;\n\
         MimeType=text/markdown;text/x-markdown;\n\
         StartupWMClass=markview\n"
    );
    fs::write(&desktop_path, content).map_err(|e| format!("write desktop: {e}"))?;

    // Refresh desktop database so xdg-mime picks up the new entry.
    let _ = std::process::Command::new("update-desktop-database")
        .arg(&apps_dir)
        .output();
    Ok(())
}
