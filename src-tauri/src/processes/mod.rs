pub mod ports;

use serde::Serialize;
use sysinfo::{Pid, ProcessesToUpdate, System};

#[derive(Debug, Serialize, Clone)]
pub struct ProcessRow {
    pub pid: u32,
    pub name: String,
    pub command: String,
    pub cpu: f32,
    pub memory_mb: u64,
}

const INTERESTING: &[&str] = &[
    "node", "npm", "pnpm", "yarn", "bun", "python", "python3", "cargo", "rustc", "go",
    "docker", "com.docker", "postgres", "mongod", "redis-server", "vite", "next", "php",
];

pub fn list_dev_processes() -> Vec<ProcessRow> {
    let mut system = System::new_all();
    system.refresh_processes(ProcessesToUpdate::All, true);
    let mut rows = Vec::new();
    for (pid, process) in system.processes() {
        let name = process.name().to_string_lossy().to_lowercase();
        if !INTERESTING.iter().any(|needle| name.contains(needle)) {
            continue;
        }
        let command = process
            .cmd()
            .iter()
            .map(|part| part.to_string_lossy().into_owned())
            .collect::<Vec<_>>()
            .join(" ");
        rows.push(ProcessRow {
            pid: pid.as_u32(),
            name: process.name().to_string_lossy().into_owned(),
            command,
            cpu: process.cpu_usage(),
            memory_mb: process.memory() / (1024 * 1024),
        });
    }
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
