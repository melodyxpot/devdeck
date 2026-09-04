pub mod ports;

use serde::Serialize;
use sysinfo::{Pid, Process, ProcessStatus, ProcessesToUpdate, System};

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProcessRow {
    pub pid: u32,
    pub name: String,
    pub command: String,
    pub cpu: f32,
    pub memory_mb: u64,
    pub status: String,
}

const INTERESTING: &[&str] = &[
    "node", "npm", "pnpm", "yarn", "bun", "python", "python3", "cargo", "rustc", "go",
    "docker", "com.docker", "postgres", "mongod", "redis-server", "vite", "next", "php",
];

fn map_status(status: ProcessStatus) -> String {
    match status {
        ProcessStatus::Run => "running",
        ProcessStatus::Sleep | ProcessStatus::Idle => "sleeping",
        ProcessStatus::Stop => "stopped",
        _ => "idle",
    }
    .into()
}

fn to_row(pid: Pid, process: &Process) -> ProcessRow {
    let command = process
        .cmd()
        .iter()
        .map(|part| part.to_string_lossy().into_owned())
        .collect::<Vec<_>>()
        .join(" ");
    ProcessRow {
        pid: pid.as_u32(),
        name: process.name().to_string_lossy().into_owned(),
        command,
        cpu: process.cpu_usage(),
        memory_mb: process.memory() / (1024 * 1024),
        status: map_status(process.status()),
    }
}

pub fn list_dev_processes() -> Vec<ProcessRow> {
    let mut system = System::new_all();
    system.refresh_processes(ProcessesToUpdate::All, true);
    let mut rows = Vec::new();
    for (pid, process) in system.processes() {
        let name = process.name().to_string_lossy().to_lowercase();
        if !INTERESTING.iter().any(|needle| name.contains(needle)) {
            continue;
        }
        rows.push(to_row(*pid, process));
    }
    rows
}

pub fn list_system_processes(limit: usize) -> Vec<ProcessRow> {
    let mut system = System::new_all();
    system.refresh_processes(ProcessesToUpdate::All, true);
    let mut rows: Vec<ProcessRow> = system
        .processes()
        .iter()
        .map(|(pid, process)| to_row(*pid, process))
        .collect();
    rows.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap_or(std::cmp::Ordering::Equal));
    rows.truncate(limit.max(1).min(32));
    rows
}

pub fn terminate(pid: u32, confirmed: bool) -> Result<(), String> {
    if !confirmed {
        return Err("Confirmation required before terminating a process.".into());
    }
    let mut system = System::new_all();
    system.refresh_processes(ProcessesToUpdate::All, true);
    if let Some(process) = system.process(Pid::from_u32(pid)) {
        if process.kill() {
            return Ok(());
        }
    }
    Err("The process is no longer running.".into())
}

#[cfg(test)]
mod tests {
    use super::list_system_processes;

    #[test]
    fn system_process_list_is_capped() {
        let rows = list_system_processes(5);
        assert!(rows.len() <= 5);
    }
}
