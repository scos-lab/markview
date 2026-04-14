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
        std::process::Command::new("cmd")
            .args(["/c", "start", "ms-settings:defaultapps"])
            .spawn()
            .map_err(|e| e.to_string())?;
        return Ok(());
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
