mod commands;
mod database;
mod docker;
mod error;
mod filesystem;
mod git;
mod processes;
mod services;
mod system;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if let Some(dir) = app.path().app_data_dir().ok() {
                let _ = std::fs::create_dir_all(&dir);
                let _ = database::open(&dir.join("devdeck.db"));
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::scan_projects,
            commands::git_status,
            commands::list_processes,
            commands::list_system_processes,
            commands::list_ports,
            commands::terminate_process,
            commands::system_metrics,
            commands::docker_info,
            commands::docker_compose,
            commands::parse_env_file,
            commands::detect_tools,
            commands::validate_project_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running DevDeck");
}
