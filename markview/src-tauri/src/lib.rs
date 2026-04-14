mod commands;

use std::sync::Mutex;
use tauri::Emitter;
use tauri::Manager;

fn is_markdown(path: &str) -> bool {
    let lower = path.to_lowercase();
    lower.ends_with(".md") || lower.ends_with(".mdx") || lower.ends_with(".markdown")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(commands::WatcherState {
            watcher: Mutex::new(None),
        })
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // Second instance launched — find the .md path and send it to the existing window
            if let Some(path) = argv.iter().skip(1).find(|a| is_markdown(a)) {
                let _ = app.emit("file-association-open", path.clone());
            }
            // Focus the existing window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(commands::InitialFileState {
            path: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_file,
            commands::open_file_dialog,
            commands::watch_file,
            commands::unwatch_file,
            commands::open_default_apps_settings,
            commands::get_initial_file
        ])
        .setup(|app| {
            // Check if launched with a file path argument (file association) — first instance only
            // Store in state for frontend to query (no timing dependency)
            let args: Vec<String> = std::env::args().collect();
            if args.len() > 1 {
                let path = &args[1];
                if is_markdown(path) {
                    let state = app.state::<commands::InitialFileState>();
                    *state.path.lock().unwrap() = Some(path.clone());
                }
            }
            #[cfg(feature = "devtools")]
            if std::env::var("MARKVIEW_DEVTOOLS").is_ok() {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
