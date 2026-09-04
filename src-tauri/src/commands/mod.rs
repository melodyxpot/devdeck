use crate::docker;
use crate::error::{AppError, AppResult};
use crate::filesystem;
use crate::git;
use crate::processes;
use crate::services::{env_parse, project_detect};
use crate::system;
use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use which::which;

#[derive(Serialize)]
pub struct ToolInfo {
    pub id: String,
    pub name: String,
    pub installed: bool,
    pub version: Option<String>,
}

#[tauri::command]
pub fn scan_projects(directories: Vec<String>) -> AppResult<Vec<project_detect::DetectedProject>> {
    let mut all = Vec::new();
    for directory in directories {
        let path = filesystem::normalize_user_path(&directory)?;
        all.extend(project_detect::scan_directory(&path, 2));
    }
    Ok(all)
}

#[tauri::command]
pub fn git_status(path: String) -> AppResult<git::GitStatus> {
    let path = filesystem::normalize_user_path(&path)?;
    git::status(&path).ok_or_else(|| {
        AppError::user(
            "GIT_UNAVAILABLE",
            "Unable to read Git status.",
            "Git is missing, or this folder is not a repository.",
            "Install Git and open a folder that contains a .git directory.",
        )
    })
}

#[tauri::command]
pub fn list_processes() -> Vec<processes::ProcessRow> {
    processes::list_dev_processes()
}

#[tauri::command]
pub fn list_system_processes(limit: Option<u32>) -> Vec<processes::ProcessRow> {
    processes::list_system_processes(limit.unwrap_or(12) as usize)
}

#[tauri::command]
pub fn list_ports() -> Vec<processes::ports::PortRow> {
    processes::ports::listen()
}

#[tauri::command]
pub fn terminate_process(pid: u32, confirmed: bool) -> AppResult<()> {
    processes::terminate(pid, confirmed).map_err(|reason| {
        AppError::user(
            "PROCESS_TERMINATE",
            "Unable to terminate the process.",
            &reason,
            "Confirm the action, or stop the project from the Projects view.",
        )
    })
}

#[tauri::command]
pub fn system_metrics() -> system::Metrics {
    system::metrics()
}

#[tauri::command]
pub fn docker_info() -> docker::DockerInfo {
    docker::info()
}

#[tauri::command]
pub fn docker_compose(path: String, action: String, confirmed: bool) -> AppResult<String> {
    let path = filesystem::normalize_user_path(&path)?;
    docker::compose(&path.to_string_lossy(), &action, confirmed).map_err(|reason| {
        AppError::user(
            "DOCKER",
            "Docker Compose did not complete.",
            &reason,
            "Confirm Docker is running, then retry the action.",
        )
    })
}

#[tauri::command]
pub fn parse_env_file(path: String) -> AppResult<Vec<(String, bool)>> {
    let path = filesystem::normalize_user_path(&path)?;
    let contents = fs::read_to_string(&path)?;
    Ok(env_parse::parse_env(&contents)
        .into_keys()
        .map(|key| {
            let secret = env_parse::is_secret_key(&key);
            (key, secret)
        })
        .collect())
}

#[tauri::command]
pub fn detect_tools() -> Vec<ToolInfo> {
    const TOOLS: &[(&str, &str)] = &[
        ("git", "Git"),
        ("node", "Node.js"),
        ("npm", "npm"),
        ("pnpm", "pnpm"),
        ("yarn", "Yarn"),
        ("bun", "Bun"),
        ("python", "Python"),
        ("docker", "Docker"),
        ("code", "VS Code"),
        ("cursor", "Cursor"),
        ("pwsh", "PowerShell"),
        ("wt", "Windows Terminal"),
    ];
    TOOLS
        .iter()
        .map(|(id, name)| ToolInfo {
            id: (*id).into(),
            name: (*name).into(),
            installed: which(id).is_ok(),
            version: None,
        })
        .collect()
}

#[tauri::command]
pub fn validate_project_path(path: String) -> AppResult<PathBuf> {
    filesystem::normalize_user_path(&path)
}
