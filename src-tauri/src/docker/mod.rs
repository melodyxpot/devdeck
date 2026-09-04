use serde::Serialize;
use std::process::Command;

#[derive(Debug, Serialize)]
pub struct DockerInfo {
    pub available: bool,
    pub version: Option<String>,
}

pub fn info() -> DockerInfo {
    match Command::new("docker").args(["version", "--format", "{{.Server.Version}}"]).output() {
        Ok(output) if output.status.success() => DockerInfo {
            available: true,
            version: Some(String::from_utf8_lossy(&output.stdout).trim().to_string()),
        },
        _ => DockerInfo {
            available: false,
            version: None,
        },
    }
}

pub fn compose(path: &str, action: &str, confirmed: bool) -> Result<String, String> {
    if matches!(action, "down" | "rm") && !confirmed {
        return Err("Confirmation required for destructive Compose actions.".into());
    }
    let arg = match action {
        "up" => "up",
        "down" => "down",
        "restart" => "restart",
        _ => return Err("Unsupported Compose action.".into()),
    };
    let mut command = Command::new("docker");
    command.args(["compose", "-f", path, arg]);
    if arg == "up" {
        command.arg("-d");
    }
    command
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|error| error.to_string())
}
