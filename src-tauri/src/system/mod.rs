use serde::Serialize;
use sysinfo::{Disks, Networks, System};

#[derive(Debug, Serialize)]
pub struct Metrics {
    pub cpu: f32,
    pub memory_used_gb: f64,
    pub memory_total_gb: f64,
    pub disk_used_gb: f64,
    pub disk_total_gb: f64,
    pub network_down_kbps: f64,
    pub network_up_kbps: f64,
    pub battery: Option<f32>,
}

pub fn metrics() -> Metrics {
    let mut system = System::new_all();
    system.refresh_all();
    let disks = Disks::new_with_refreshed_list();
    let (disk_total, disk_available) = disks.list().iter().fold((0u64, 0u64), |acc, disk| {
        (acc.0 + disk.total_space(), acc.1 + disk.available_space())
    });
    let networks = Networks::new_with_refreshed_list();
    let (down, up) = networks.iter().fold((0u64, 0u64), |acc, (_, data)| {
        (acc.0 + data.received(), acc.1 + data.transmitted())
    });

    Metrics {
        cpu: system.global_cpu_usage(),
        memory_used_gb: system.used_memory() as f64 / 1024.0 / 1024.0 / 1024.0,
        memory_total_gb: system.total_memory() as f64 / 1024.0 / 1024.0 / 1024.0,
        disk_used_gb: disk_total.saturating_sub(disk_available) as f64 / 1024.0 / 1024.0 / 1024.0,
        disk_total_gb: disk_total as f64 / 1024.0 / 1024.0 / 1024.0,
        network_down_kbps: down as f64 / 1024.0,
        network_up_kbps: up as f64 / 1024.0,
        battery: None,
    }
}
