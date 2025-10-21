use reqwest::Client;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum OllamaErr {
    #[error("http: {0}")]
    Http(#[from] reqwest::Error),
    #[error("ollama returned empty response")] 
    Empty,
}

#[derive(Serialize)]
struct GenerateReq<'a> {
    model: &'a str,
    prompt: &'a str,
    stream: bool,
    options: serde_json::Value,
}

#[derive(Deserialize)]
struct GenerateResp {
    response: Option<String>,
    done: Option<bool>,
}

pub async fn generate(model: &str, prompt: &str) -> Result<String, OllamaErr> {
    let url = "http://127.0.0.1:11434/api/generate";
    let client = Client::new();
    let body = GenerateReq { model, prompt, stream: false, options: serde_json::json!({"temperature": 0.3, "num_ctx": 4096}) };
    let resp: GenerateResp = client.post(url).json(&body).send().await?.json().await?;
    Ok(resp.response.unwrap_or_default())
}
