use axum::{routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tracing_subscriber::{EnvFilter, fmt};
use tower_http::cors::{CorsLayer, Any};

mod ollama_client;
mod scheduler;
mod guards;
mod canon_check;
mod heuristics;
mod spellcheck;

#[tokio::main]
async fn main() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));
    fmt().with_env_filter(filter).init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/heuristics", post(heuristics::analyze))
        .route("/api/minor_edit", post(minor_edit))
        .route("/api/chat", post(chat))
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    tracing::info!("router listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Debug, Deserialize)]
struct MinorEditReq {
    model: String,
    #[allow(dead_code)]
    citations: Option<Vec<String>>,
    style: serde_json::Value,
    text: String,
}

#[derive(Debug, Serialize)]
struct EditItem {
    line: usize,
    old: String,
    new: String,
    citations: Vec<String>,
    rationale: String,
}

#[derive(Debug, Serialize)]
struct MinorEditResp {
    edits: Vec<EditItem>,
}

async fn minor_edit(Json(req): Json<MinorEditReq>) -> Json<MinorEditResp> {
    let prompt = format!(
        "SYSTEM: Perform minimal edits that improve clarity and rhythm without changing meaning. \nRespect rules: no em dashes, no narration contractions, dialogue may contract. \nReturn the revised text only.\n\nTEXT:\n{}",
        req.text
    );

    let revised = match ollama_client::generate(&req.model, &prompt).await {
        Ok(s) => s,
        Err(e) => format!("[router error: {}]\n{}", e, req.text),
    };

    let old_lines: Vec<String> = req.text.lines().map(|s| s.to_string()).collect();
    let new_lines: Vec<String> = revised.lines().map(|s| s.to_string()).collect();
    let count = old_lines.len().max(new_lines.len());

    let mut edits = Vec::new();
    for i in 0..count {
        let old = old_lines.get(i).cloned().unwrap_or_default();
        let new = new_lines.get(i).cloned().unwrap_or_default();
        if old != new {
            edits.push(EditItem { line: i + 1, old, new, citations: vec![], rationale: "minor polish".into() });
        }
    }

    Json(MinorEditResp { edits })
}

#[derive(Debug, Deserialize)]
struct ChatReq {
    model: String,
    prompt: String,
    context: Option<String>,
}

#[derive(Debug, Serialize)]
struct ChatResp {
    response: String,
}

async fn chat(Json(req): Json<ChatReq>) -> Json<ChatResp> {
    let full_prompt = if let Some(ctx) = req.context {
        format!("SYSTEM: You are a helpful writing assistant for fiction authors. Provide specific, actionable advice.\n\nCONTEXT (user's current text):\n---\n{}\n---\n\nUSER: {}\n\nASSISTANT:", ctx, req.prompt)
    } else {
        format!("SYSTEM: You are a helpful writing assistant for fiction authors. Provide specific, actionable advice.\n\nUSER: {}\n\nASSISTANT:", req.prompt)
    };

    let response = match ollama_client::generate(&req.model, &full_prompt).await {
        Ok(s) => s,
        Err(e) => format!("Sorry, I encountered an error: {}", e),
    };

    Json(ChatResp { response })
}
