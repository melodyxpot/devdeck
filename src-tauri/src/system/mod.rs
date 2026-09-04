use serde::Serialize;
use std::sync::Mutex;
use std::time::Instant;
use sysinfo::{Disks, Networks, System};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
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

struct NetworkSample {
    at: Instant,
    down_bytes: u64,
    up_bytes: u64,
}

static LAST_NETWORK: Mutex<Option<NetworkSample>> = Mutex::new(None);

pub fn rate_kbps(prev_bytes: u64, next_bytes: u64, elapsed_secs: f64) -> f64 {
    if elapsed_secs <= 0.0 {
        return 0.0;
    }
    let delta = next_bytes.saturating_sub(prev_bytes) as f64;
    (delta * 8.0) / 1000.0 / elapsed_secs
}

pub fn metrics() -> Metrics {
    let mut system = System::new_all();
    system.refresh_all();
    let disks = Disks::new_with_refreshed_list();
    let (disk_total, disk_available) = disks.list().iter().fold((0u64, 0u64), |acc, disk| {
        (acc.0 + disk.total_space(), acc.1 + disk.available_space())
    });
    let networks = Networks::new_with_refreshed_list();
    let (down_bytes, up_bytes) = networks.iter().fold((0u64, 0u64), |acc, (_, data)| {
        (acc.0 + data.total_received(), acc.1 + data.total_transmitted())
    });
    let (network_down_kbps, network_up_kbps) = sample_network_rates(down_bytes, up_bytes);

    Metrics {
        cpu: system.global_cpu_usage(),
        memory_used_gb: system.used_memory() as f64 / 1024.0 / 1024.0 / 1024.0,
        memory_total_gb: system.total_memory() as f64 / 1024.0 / 1024.0 / 1024.0,
        disk_used_gb: disk_total.saturating_sub(disk_available) as f64 / 1024.0 / 1024.0 / 1024.0,
        disk_total_gb: disk_total as f64 / 1024.0 / 1024.0 / 1024.0,
        network_down_kbps,
        network_up_kbps,
        battery: None,
    }
}

fn sample_network_rates(down_bytes: u64, up_bytes: u64) -> (f64, f64) {
    let now = Instant::now();
    let mut last = LAST_NETWORK.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
    let rates = match last.as_ref() {
        Some(previous) => {
            let elapsed = now.duration_since(previous.at).as_secs_f64();
            (
                rate_kbps(previous.down_bytes, down_bytes, elapsed),
                rate_kbps(previous.up_bytes, up_bytes, elapsed),
            )
        }
        None => (0.0, 0.0),
    };
    *last = Some(NetworkSample {
        at: now,
        down_bytes,
        up_bytes,
    });
    rates
}

#[cfg(test)]
mod tests {
    use super::rate_kbps;

    #[test]
    fn converts_byte_deltas_to_kbps() {
        // 125_000 bytes over 1s = 1_000_000 bits/s = 1000 kbps
        assert!((rate_kbps(0, 125_000, 1.0) - 1000.0).abs() < 0.001);
        assert_eq!(rate_kbps(100, 90, 1.0), 0.0);
        assert_eq!(rate_kbps(0, 100, 0.0), 0.0);
    }
}
