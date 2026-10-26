use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};
use std::time::Duration;

use serde_json::Value;

const UA: &str = "mashiro/1.0 (Yandex Music desktop client)";
const HOST: &str = "translate.googleapis.com";
const PATH: &str = "/translate_a/single";

fn http() -> Result<&'static reqwest::Client, String> {
    static CLIENT: OnceLock<Option<reqwest::Client>> = OnceLock::new();
    CLIENT
        .get_or_init(|| {
            reqwest::Client::builder()
                .timeout(Duration::from_secs(12))
                .user_agent(UA)
                .build()
                .ok()
        })
        .as_ref()
        .ok_or_else(|| "не удалось создать http-клиент".to_string())
}

fn cache() -> &'static Mutex<HashMap<String, Vec<String>>> {
    static CACHE: OnceLock<Mutex<HashMap<String, Vec<String>>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

fn encode(value: &str) -> String {
    let mut out = String::with_capacity(value.len() * 3);
    for byte in value.as_bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(*byte as char)
            }
            other => out.push_str(&format!("%{other:02X}")),
        }
    }
    out
}

async fn gtx(target: &str, text: &str) -> Result<String, String> {
    let scheme = "https";
    let url = format!(
        "{scheme}://{HOST}{PATH}?client=gtx&sl=auto&tl={}&dt=t&q={}",
        encode(target),
        encode(text)
    );

    let resp = http()?
        .get(&url)
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|e| format!("перевод недоступен: {e}"))?;

    let status = resp.status();
    if !status.is_success() {
        return Err(format!("сервис перевода ответил {}", status.as_u16()));
    }

    let body = resp
        .text()
        .await
        .map_err(|e| format!("перевод: не удалось прочитать ответ ({e})"))?;

    let value: Value = serde_json::from_str(&body)
        .map_err(|e| format!("перевод: непонятный ответ ({e})"))?;

    let mut out = String::new();
    if let Some(chunks) = value.get(0).and_then(Value::as_array) {
        for chunk in chunks {
            if let Some(seg) = chunk.get(0).and_then(Value::as_str) {
                out.push_str(seg);
            }
        }
    }
    Ok(out)
}

#[tauri::command]
pub async fn translate_lines(
    target: String,
    lines: Vec<String>,
) -> Result<Vec<String>, String> {
    let target = {
        let t = target.trim().to_lowercase();
        if t.is_empty() {
            "ru".to_string()
        } else {
            t
        }
    };
    if lines.is_empty() {
        return Ok(vec![]);
    }

    let key = format!("{target}\u{1}{}", lines.join("\u{2}"));
    if let Some(hit) = cache().lock().ok().and_then(|c| c.get(&key).cloned()) {
        return Ok(hit);
    }

    let indices: Vec<usize> = lines
        .iter()
        .enumerate()
        .filter(|(_, line)| !line.trim().is_empty())
        .map(|(i, _)| i)
        .collect();

    let mut result = lines.clone();

    if indices.is_empty() {
        return Ok(result);
    }

    let joined = indices
        .iter()
        .map(|&i| lines[i].as_str())
        .collect::<Vec<_>>()
        .join("\n");

    let translated = gtx(&target, &joined).await?;
    let parts: Vec<String> = translated
        .split('\n')
        .map(|s| s.trim().to_string())
        .collect();

    if parts.len() == indices.len() {
        for (slot, part) in indices.iter().zip(parts.into_iter()) {
            result[*slot] = part;
        }
    } else if indices.len() <= 80 {
        for &i in &indices {
            let one = gtx(&target, lines[i].trim()).await.unwrap_or_default();
            if !one.trim().is_empty() {
                result[i] = one.trim().to_string();
            }
        }
    }

    if let Ok(mut cache) = cache().lock() {
        cache.insert(key, result.clone());
    }

    Ok(result)
}

#[tauri::command]
pub fn translate_clear_cache() {
    if let Ok(mut cache) = cache().lock() {
        cache.clear();
    }
}
