use crate::error::{AppError, AppResult};
use std::path::{Component, Path, PathBuf};

pub fn normalize_user_path(input: &str) -> AppResult<PathBuf> {
    if input.is_empty() || input.len() > 4096 || input.contains('\0') {
        return Err(AppError::user(
            "PATH_INVALID",
            "That path is not allowed.",
            "The path is empty, too long, or contains invalid characters.",
            "Choose an absolute project directory you own.",
        ));
    }

    let path = PathBuf::from(input);
    if !path.is_absolute() {
        return Err(AppError::user(
            "PATH_INVALID",
            "That path is not allowed.",
            "Relative paths are rejected.",
            "Use a full path such as D:\\Projects.",
        ));
    }

    if has_parent_dir(&path) {
        return Err(AppError::user(
            "PATH_INVALID",
            "That path is not allowed.",
            "Parent directory traversal is blocked.",
            "Choose a project directory without '..' segments.",
        ));
    }

    Ok(path)
}

pub fn has_parent_dir(path: &Path) -> bool {
    path.components()
        .any(|component| matches!(component, Component::ParentDir))
}

#[allow(dead_code)]
pub fn ensure_within(base: &Path, candidate: &Path) -> AppResult<PathBuf> {
    let base = normalize_user_path(&base.to_string_lossy())?;
    let candidate = normalize_user_path(&candidate.to_string_lossy())?;
    if !candidate.starts_with(&base) {
        return Err(AppError::user(
            "PATH_INVALID",
            "That path is not allowed.",
            "The file is outside the configured project directory.",
            "Open a file that belongs to the selected project.",
        ));
    }
    Ok(candidate)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_relative_and_traversal() {
        assert!(normalize_user_path("Projects/app").is_err());
        #[cfg(windows)]
        assert!(normalize_user_path(r"D:\Projects\..\Windows").is_err());
        #[cfg(not(windows))]
        assert!(normalize_user_path("/tmp/../etc").is_err());
    }

    #[test]
    fn accepts_absolute_paths() {
        #[cfg(windows)]
        assert!(normalize_user_path(r"D:\Projects\momoreis").is_ok());
        #[cfg(not(windows))]
        assert!(normalize_user_path("/home/ada/Projects/momoreis").is_ok());
    }
}
