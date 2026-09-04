use serde::Serialize;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Serialize, Clone, PartialEq, Eq)]
pub struct GitFile {
    pub path: String,
    pub status: String,
    pub staged: bool,
}

#[derive(Debug, Serialize, Clone, Default)]
pub struct GitStatus {
    pub branch: String,
    pub ahead: u32,
    pub behind: u32,
    pub files: Vec<GitFile>,
}

pub fn parse_porcelain(output: &str) -> GitStatus {
    let mut status = GitStatus::default();
    for line in output.lines() {
        if let Some(rest) = line.strip_prefix("## ") {
            status.branch = rest
                .split_whitespace()
                .next()
                .unwrap_or("HEAD")
                .split("...")
                .next()
                .unwrap_or("HEAD")
                .to_string();
            if let Some(cap) = rest.split("ahead ").nth(1) {
                status.ahead = cap
                    .chars()
                    .take_while(|c| c.is_ascii_digit())
                    .collect::<String>()
                    .parse()
                    .unwrap_or(0);
            }
            if let Some(cap) = rest.split("behind ").nth(1) {
                status.behind = cap
                    .chars()
                    .take_while(|c| c.is_ascii_digit())
                    .collect::<String>()
                    .parse()
                    .unwrap_or(0);
            }
            continue;
        }
        if line.len() < 4 {
            continue;
        }
        let xy = &line[..2];
        let path = line[3..].trim_matches('"').to_string();
        let code = if xy.as_bytes()[0] == b' ' {
            xy.as_bytes()[1] as char
        } else {
            xy.as_bytes()[0] as char
        };
        let staged = xy.as_bytes()[0] != b' ' && xy.as_bytes()[0] != b'?';
        let kind = match code {
            'A' => "added",
            'D' => "deleted",
            'R' => "renamed",
            'U' => "conflicted",
            '?' => "untracked",
            _ => "modified",
        };
        status.files.push(GitFile {
            path,
            status: kind.into(),
            staged,
        });
    }
    status
}

pub fn status(path: &Path) -> Option<GitStatus> {
    let output = Command::new("git")
        .args(["-C", &path.to_string_lossy(), "status", "--porcelain=v1", "-b"])
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    Some(parse_porcelain(&String::from_utf8_lossy(&output.stdout)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_branch_and_files() {
        let raw = "## feature/leaderboard...origin/feature [ahead 2]\n M src/lib/ranking.ts\nA  src/new.ts\n?? src/podium.tsx\n";
        let parsed = parse_porcelain(raw);
        assert_eq!(parsed.branch, "feature/leaderboard");
        assert_eq!(parsed.ahead, 2);
        assert_eq!(parsed.files.len(), 3);
        assert!(!parsed.files[0].staged);
        assert!(parsed.files[1].staged);
        assert_eq!(parsed.files[2].status, "untracked");
    }
}
