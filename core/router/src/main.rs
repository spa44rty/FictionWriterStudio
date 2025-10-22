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
    issues: Option<Vec<serde_json::Value>>,
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
    let issues_summary = if let Some(issues) = &req.issues {
        let mut summary = String::from("\n\nSPECIFIC ISSUES TO FIX:\n");
        let issue_types: std::collections::HashMap<String, usize> = issues.iter()
            .filter_map(|i| i.get("kind").and_then(|k| k.as_str()))
            .fold(std::collections::HashMap::new(), |mut acc, kind| {
                *acc.entry(kind.to_string()).or_insert(0) += 1;
                acc
            });
        
        for (kind, count) in issue_types.iter() {
            summary.push_str(&format!("- {} occurrences of {}\n", count, kind));
        }
        
        summary.push_str("\nFocus on:\n");
        summary.push_str("- Replace weak verbs (was, were, is, had, has, get, got) with stronger action verbs\n");
        summary.push_str("- Remove or replace adverbs with stronger verbs\n");
        summary.push_str("- Eliminate filler words (really, very, just, quite)\n");
        summary.push_str("- Fix spelling errors and concatenated words\n");
        summary.push_str("- Improve passive voice to active voice\n");
        summary.push_str("- Replace clichés with fresh phrasing\n");
        summary
    } else {
        String::new()
    };

    let prompt = format!(
        "SYSTEM: You are an expert prose editor. Perform targeted line-by-line edits that fix the specific issues listed below while preserving the author's voice and meaning.{}

STYLE RULES (must follow):
- No em dashes in narration
- No contractions in narration (dialogue may have contractions)
- Maintain past tense and close-third POV

Return ONLY the revised text with no explanations.

TEXT:
{}",
        issues_summary,
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
