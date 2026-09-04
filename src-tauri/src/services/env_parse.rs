use serde::Serialize;
use std::collections::BTreeMap;

const SECRET_HINTS: &[&str] = &[
    "secret",
    "password",
    "passwd",
    "token",
    "api_key",
    "apikey",
    "private",
    "credential",
    "access_key",
    "client_secret",
];

#[derive(Debug, Serialize, PartialEq, Eq)]
pub struct EnvCompare {
    pub missing: Vec<String>,
    pub unused: Vec<String>,
    pub shared: Vec<String>,
}

pub fn is_secret_key(key: &str) -> bool {
    let lower = key.to_ascii_lowercase();
    SECRET_HINTS.iter().any(|hint| lower.contains(hint))
}

pub fn parse_env(contents: &str) -> BTreeMap<String, String> {
    let mut map = BTreeMap::new();
    for raw in contents.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let Some((key, value)) = line.split_once('=') else {
            continue;
        };
        let key = key.trim();
        if !key.chars().next().is_some_and(|c| c.is_ascii_alphabetic() || c == '_') {
            continue;
        }
        if !key.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
            continue;
        }
        let mut value = value.trim().to_string();
        if (value.starts_with('"') && value.ends_with('"'))
            || (value.starts_with('\'') && value.ends_with('\''))
        {
            value = value[1..value.len() - 1].to_string();
        }
        map.insert(key.to_string(), value);
    }
    map
}

pub fn compare_env(example: &BTreeMap<String, String>, actual: &BTreeMap<String, String>) -> EnvCompare {
    let missing = example
        .keys()
        .filter(|key| !actual.contains_key(*key))
        .cloned()
        .collect();
    let unused = actual
        .keys()
        .filter(|key| !example.contains_key(*key))
        .cloned()
        .collect();
    let shared = example
        .keys()
        .filter(|key| actual.contains_key(*key))
        .cloned()
        .collect();
    EnvCompare {
        missing,
        unused,
        shared,
    }
}

pub fn should_exclude_from_ai(filename: &str) -> bool {
    let name = filename.to_ascii_lowercase();
    name.contains(".env")
        || name.ends_with(".pem")
        || name.ends_with(".key")
        || name.contains("id_rsa")
        || name.contains("credentials")
        || name.contains("secret")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_and_compares() {
        let example = parse_env("DATABASE_URL=\nSENTRY_DSN=\n");
        let actual = parse_env("DATABASE_URL=postgres://x\nSTRIPE_SECRET=shh\n");
        let cmp = compare_env(&example, &actual);
        assert_eq!(cmp.missing, vec!["SENTRY_DSN"]);
        assert_eq!(cmp.unused, vec!["STRIPE_SECRET"]);
        assert!(is_secret_key("STRIPE_SECRET"));
        assert!(should_exclude_from_ai(".env.local"));
    }
}
