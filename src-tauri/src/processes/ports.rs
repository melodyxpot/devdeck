use serde::Serialize;
use std::process::Command;

#[derive(Debug, Serialize, Clone)]
pub struct PortRow {
    pub port: u16,
    pub process: String,
    pub pid: u32,
}

pub fn parse_netstat_line(line: &str) -> Option<PortRow> {
    if !line.contains("LISTEN") && !line.contains("LISTENING") {
        return None;
    }
    let port = line
        .split_whitespace()
        .find_map(|token| {
            token
                .rsplit_once(':')
                .and_then(|(_, port)| port.parse::<u16>().ok())
        })?;
    let pid = line
        .split_whitespace()
        .rev()
        .find_map(|token| token.split('/').next()?.parse::<u32>().ok())
        .unwrap_or(0);
    let process = line
        .split('/')
        .nth(1)
        .unwrap_or("unknown")
        .split_whitespace()
        .next()
        .unwrap_or("unknown")
        .to_string();
    Some(PortRow { port, process, pid })
}

pub fn listen() -> Vec<PortRow> {
    let output = Command::new("netstat")
        .args(["-ano"])
        .output()
        .ok()
        .or_else(|| Command::new("ss").args(["-lptn"]).output().ok());
    let Some(output) = output else {
        return Vec::new();
    };
    String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter_map(parse_netstat_line)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_ss_listen_line() {
        let row = parse_netstat_line("LISTEN 0 4096 127.0.0.1:3000 0.0.0.0:* users:((\"node\",pid=8214,fd=23))").unwrap();
        assert_eq!(row.port, 3000);
    }
}
