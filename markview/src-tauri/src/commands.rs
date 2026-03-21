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
    std::process::Command::new("cmd")
        .args(["/c", "start", "ms-settings:defaultapps"])
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
