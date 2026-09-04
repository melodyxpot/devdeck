use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Clone, PartialEq, Eq)]
pub struct DetectedProject {
    pub name: String,
    pub path: String,
    pub framework: String,
    pub runtime: String,
    pub package_manager: String,
}

pub fn detect_package_manager(files: &[String]) -> &'static str {
    if files.iter().any(|f| f == "pnpm-lock.yaml") {
        return "pnpm";
    }
    if files.iter().any(|f| f == "bun.lockb" || f == "bun.lock") {
        return "bun";
    }
    if files.iter().any(|f| f == "yarn.lock") {
        return "yarn";
    }
    if files
        .iter()
        .any(|f| f == "package-lock.json" || f == "package.json")
    {
        return "npm";
    }
    "unknown"
}

pub fn detect_framework(files: &[String]) -> (&'static str, &'static str) {
    if files.iter().any(|f| f.starts_with("next.config.")) {
        return ("nextjs", "node");
    }
    if files.iter().any(|f| f == "manage.py") {
        return ("django", "python");
    }
    if files.iter().any(|f| f == "artisan") {
        return ("laravel", "php");
    }
    if files.iter().any(|f| f == "Cargo.toml") {
        return ("rust", "rust");
    }
    if files.iter().any(|f| f == "go.mod") {
        return ("go", "go");
    }
    if files
        .iter()
        .any(|f| f == "docker-compose.yml" || f == "compose.yaml")
    {
        return ("docker", "docker");
    }
    if files.iter().any(|f| f == "package.json") {
        return ("node", "node");
    }
    if files
        .iter()
        .any(|f| f == "requirements.txt" || f == "pyproject.toml")
    {
        return ("python", "python");
    }
    if files.iter().any(|f| f == ".git") {
        return ("git", "unknown");
    }
    ("unknown", "unknown")
}

pub fn scan_directory(root: &Path, max_depth: usize) -> Vec<DetectedProject> {
    let mut found = Vec::new();
    if !root.is_dir() {
        return found;
    }
    collect(root, 0, max_depth, &mut found);
    found
}

fn collect(dir: &Path, depth: usize, max_depth: usize, out: &mut Vec<DetectedProject>) {
    if depth > max_depth {
        return;
    }
    let entries = match fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(_) => return,
    };
    let mut names = Vec::new();
    let mut children = Vec::new();
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name == "node_modules" || name == "target" || name == "dist" || name == ".git" {
            names.push(name);
            continue;
        }
        names.push(name.clone());
        if entry.file_type().map(|t| t.is_dir()).unwrap_or(false) {
            children.push(entry.path());
        }
    }

    let looks_like_project = names.iter().any(|n| {
        matches!(
            n.as_str(),
            "package.json" | "Cargo.toml" | "go.mod" | "pyproject.toml" | "manage.py" | "artisan"
        ) || n.starts_with("docker-compose")
    });

    if looks_like_project {
        let (framework, runtime) = detect_framework(&names);
        out.push(DetectedProject {
            name: dir
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| dir.to_string_lossy().to_string()),
            path: dir.to_string_lossy().to_string(),
            framework: framework.to_string(),
            runtime: runtime.to_string(),
            package_manager: detect_package_manager(&names).to_string(),
        });
        return;
    }

    for child in children {
        collect(&child, depth + 1, max_depth, out);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn detects_next_and_pnpm() {
        let files = vec!["next.config.ts".into(), "pnpm-lock.yaml".into(), "package.json".into()];
        assert_eq!(detect_framework(&files), ("nextjs", "node"));
        assert_eq!(detect_package_manager(&files), "pnpm");
    }

    #[test]
    fn scans_nested_projects_without_walking_forever() {
        let dir = tempdir().unwrap();
        let project = dir.path().join("momoreis");
        fs::create_dir_all(&project).unwrap();
        fs::write(project.join("package.json"), "{}").unwrap();
        fs::write(project.join("next.config.ts"), "").unwrap();
        let found = scan_directory(dir.path(), 2);
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].framework, "nextjs");
    }
}
