use crate::error::AppResult;
use rusqlite::Connection;
use std::path::Path;

pub fn open(path: &Path) -> AppResult<Connection> {
    let connection = Connection::open(path)?;
    connection.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS clipboard (
            id TEXT PRIMARY KEY,
            kind TEXT NOT NULL,
            content TEXT NOT NULL,
            favorite INTEGER NOT NULL DEFAULT 0,
            pinned INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS snippets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT NOT NULL,
            favorite INTEGER NOT NULL DEFAULT 0,
            shortcut TEXT
        );
        CREATE TABLE IF NOT EXISTS activity (
            id TEXT PRIMARY KEY,
            kind TEXT NOT NULL,
            title TEXT NOT NULL,
            detail TEXT,
            at TEXT NOT NULL
        );
        ",
    )?;
    Ok(connection)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn creates_schema() {
        let dir = tempdir().unwrap();
        let db = open(&dir.path().join("devdeck.db")).unwrap();
        let count: i64 = db
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='settings'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }
}
