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
        let mut summary = String::from("\n\nDETECTED ISSUES FOR REVIEW:\n");
        let issue_types: std::collections::HashMap<String, usize> = issues.iter()
            .filter_map(|i| i.get("kind").and_then(|k| k.as_str()))
            .fold(std::collections::HashMap::new(), |mut acc, kind| {
                *acc.entry(kind.to_string()).or_insert(0) += 1;
                acc
            });
        
        for (kind, count) in issue_types.iter() {
            summary.push_str(&format!("- {} instances of {}\n", count, kind));
        }
        summary
    } else {
        String::new()
    };

    let prompt = format!(
        "SYSTEM: You are a senior copy editor at a prestigious publishing house reviewing a manuscript chapter. Provide a professional editorial critique with line-by-line markup.{}

EDITORIAL STANDARDS:
- No em dashes in narration (house style)
- No contractions in narration; dialogue may contract naturally
- Maintain consistent past tense and close-third person POV
- Strengthen weak verbs (was/were/is/had/has/get/got) → active, specific verbs
- Eliminate adverbs where stronger verbs suffice
- Remove filler words (really, very, just, quite, actually)
- Fix spelling errors and word concatenations
- Replace clichés and overused phrases with fresh language
- Convert passive constructions to active voice
- Ensure clarity, precision, and readability

INSTRUCTIONS:
Perform a thorough copy edit as you would for publication. Make each line stronger, clearer, and more engaging while preserving the author's voice and intent. Return ONLY the fully edited text with all improvements applied—no comments, no explanations, just the polished prose ready for the next editorial stage.

MANUSCRIPT TEXT:
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
            edits.push(EditItem { line: i + 1, old, new, citations: vec![], rationale: "Copy edit: improved clarity, precision, and readability per publishing standards".into() });
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
