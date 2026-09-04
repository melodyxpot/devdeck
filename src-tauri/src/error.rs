use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("{title}")]
    User {
        code: String,
        title: String,
        reason: String,
        fix: String,
    },
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Sqlite(#[from] rusqlite::Error),
}

impl AppError {
    pub fn user(code: &str, title: &str, reason: &str, fix: &str) -> Self {
        Self::User {
            code: code.to_string(),
            title: title.to_string(),
            reason: reason.to_string(),
            fix: fix.to_string(),
        }
    }
}

#[derive(Serialize)]
pub struct ErrorPayload {
    pub code: String,
    pub title: String,
    pub reason: String,
    pub fix: String,
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let payload = match self {
            AppError::User {
                code,
                title,
                reason,
                fix,
            } => ErrorPayload {
                code: code.clone(),
                title: title.clone(),
                reason: reason.clone(),
                fix: fix.clone(),
            },
            AppError::Io(error) => ErrorPayload {
                code: "IO".into(),
                title: "A filesystem operation failed.".into(),
                reason: error.to_string(),
                fix: "Check that the path exists and DevDeck has permission to read it.".into(),
            },
            AppError::Sqlite(error) => ErrorPayload {
                code: "DB".into(),
                title: "Local storage is unavailable.".into(),
                reason: error.to_string(),
                fix: "Restart DevDeck. If this continues, reset the local database in Settings.".into(),
            },
        };
        payload.serialize(serializer)
    }
}

pub type AppResult<T> = Result<T, AppError>;
