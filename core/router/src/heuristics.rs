use axum::Json;
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct HeurReq {
    pub text: String,
    pub rules: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct Issue { pub kind: String, pub start: usize, pub end: usize, pub message: String }

#[derive(Serialize)]
pub struct HeurResp { pub issues: Vec<Issue> }

pub async fn analyze(Json(req): Json<HeurReq>) -> Json<HeurResp> {
    let mut issues = Vec::new();
    let adverb_re = Regex::new(r"\b\w+ly\b").unwrap();
    let filler_re = Regex::new(r"\b(really|very|just|quite)\b").unwrap();
    let weak_start_re = Regex::new(r"(?m)^(Then|And|But)\b").unwrap();
    let emdash_re = Regex::new("—").unwrap();

    for m in adverb_re.find_iter(&req.text) {
        issues.push(Issue{kind:"adverb".into(), start:m.start(), end:m.end(), message:"adverb flagged".into()});
    }
    for m in filler_re.find_iter(&req.text) {
        issues.push(Issue{kind:"filler".into(), start:m.start(), end:m.end(), message:"filler word".into()});
    }
    for m in weak_start_re.find_iter(&req.text) {
        issues.push(Issue{kind:"weak_starter".into(), start:m.start(), end:m.end(), message:"weak sentence starter".into()});
    }
    for m in emdash_re.find_iter(&req.text) {
        issues.push(Issue{kind:"emdash".into(), start:m.start(), end:m.end(), message:"em dash banned".into()});
    }

    Json(HeurResp{issues})
}
