use axum::Json;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::spellcheck;

#[derive(Deserialize)]
pub struct HeurReq {
    pub text: String,
    pub rules: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct Issue { 
    pub kind: String, 
    pub start: usize, 
    pub end: usize, 
    pub message: String,
    pub severity: String,
}

#[derive(Serialize)]
pub struct HeurResp { pub issues: Vec<Issue> }

pub async fn analyze(Json(req): Json<HeurReq>) -> Json<HeurResp> {
    let mut issues = Vec::new();
    let text = &req.text;

    issues.extend(check_spelling(text));
    issues.extend(check_adverbs(text));
    issues.extend(check_fillers(text));
    issues.extend(check_weak_starters(text));
    issues.extend(check_em_dashes(text));
    issues.extend(check_weak_verbs(text));
    issues.extend(check_cliches(text));
    issues.extend(check_prepositional_phrases(text));
    issues.extend(check_punctuation(text));
    issues.extend(check_repetitive_words(text));
    issues.extend(check_sentence_pacing(text));
    issues.extend(check_passive_voice(text));
    issues.extend(check_hedging_words(text));
    issues.extend(check_telling_words(text));
    issues.extend(check_overused_conjunctions(text));
    issues.extend(check_double_spaces(text));

    Json(HeurResp { issues })
}

fn check_adverbs(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let adverb_re = Regex::new(r"\b\w+ly\b").unwrap();
    
    for m in adverb_re.find_iter(text) {
        let word = m.as_str().to_lowercase();
        if !is_acceptable_ly_word(&word) {
            issues.push(Issue {
                kind: "adverb".into(),
                start: m.start(),
                end: m.end(),
                message: format!("Adverb '{}' - consider stronger verb", m.as_str()),
                severity: "warning".into(),
            });
        }
    }
    issues
}

fn is_acceptable_ly_word(word: &str) -> bool {
    let acceptable = ["early", "only", "likely", "lovely", "friendly", 
                      "lonely", "deadly", "holy", "daily", "family"];
    acceptable.contains(&word)
}

fn check_fillers(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let filler_re = Regex::new(r"\b(really|very|just|quite|actually|basically|literally|simply|totally|absolutely|completely|entirely|extremely|highly|utterly|perfectly|rather|somewhat|fairly|pretty)\b").unwrap();
    
    for m in filler_re.find_iter(text) {
        issues.push(Issue {
            kind: "filler".into(),
            start: m.start(),
            end: m.end(),
            message: format!("Filler word '{}' weakens prose", m.as_str()),
            severity: "warning".into(),
        });
    }
    issues
}

fn check_weak_starters(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let weak_start_re = Regex::new(r"(?m)^(Then|And|But|So|Well|Now|Also|Still|Yet)\b").unwrap();
    
    for m in weak_start_re.find_iter(text) {
        issues.push(Issue {
            kind: "weak_starter".into(),
            start: m.start(),
            end: m.end(),
            message: format!("Weak sentence starter '{}'", m.as_str()),
            severity: "info".into(),
        });
    }
    issues
}

fn check_em_dashes(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let emdash_re = Regex::new("—").unwrap();
    
    for m in emdash_re.find_iter(text) {
        issues.push(Issue {
            kind: "emdash".into(),
            start: m.start(),
            end: m.end(),
            message: "Em dash banned in narration per style guide".into(),
            severity: "error".into(),
        });
    }
    issues
}

fn check_weak_verbs(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let weak_verb_re = Regex::new(r"\b(was|were|is|are|am|been|being|be|had|has|have|do|does|did|get|gets|got|getting)\b").unwrap();
    
    for m in weak_verb_re.find_iter(text) {
        issues.push(Issue {
            kind: "weak_verb".into(),
            start: m.start(),
            end: m.end(),
            message: format!("Weak verb '{}' - consider stronger alternative", m.as_str()),
            severity: "info".into(),
        });
    }
    issues
}

fn check_cliches(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let cliches = [
        "in the nick of time", "at the end of the day", "tried and true",
        "only time will tell", "when all is said and done", "last but not least",
        "a matter of time", "easier said than done", "crystal clear",
        "needle in a haystack", "tip of the iceberg", "piece of cake",
        "beat around the bush", "break the ice", "hit the nail on the head",
        "think outside the box", "the whole nine yards", "time will tell",
        "actions speak louder than words", "at the drop of a hat",
        "breath of fresh air", "caught red-handed", "clean slate",
        "cut to the chase", "diamond in the rough", "face the music",
        "fish out of water", "for all intents and purposes", "getting cold feet",
    ];
    
    let text_lower = text.to_lowercase();
    for cliche in cliches {
        let mut search_start = 0;
        while let Some(relative_pos) = text_lower[search_start..].find(cliche) {
            let pos = search_start + relative_pos;
            issues.push(Issue {
                kind: "cliche".into(),
                start: pos,
                end: pos + cliche.len(),
                message: format!("Cliché phrase '{}'", cliche),
                severity: "warning".into(),
            });
            search_start = pos + cliche.len();
        }
    }
    issues
}

fn check_prepositional_phrases(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let prepositions = ["of", "in", "on", "at", "to", "for", "with", "by", "from", "about"];
    let prep_chain_re = Regex::new(
        r"\b(of|in|on|at|to|for|with|by|from|about)\s+\w+\s+(of|in|on|at|to|for|with|by|from|about)\s+\w+\s+(of|in|on|at|to|for|with|by|from|about)"
    ).unwrap();
    
    for m in prep_chain_re.find_iter(text) {
        issues.push(Issue {
            kind: "prepositional_chain".into(),
            start: m.start(),
            end: m.end(),
            message: "Too many prepositional phrases in sequence".into(),
            severity: "warning".into(),
        });
    }
    issues
}

fn check_punctuation(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    
    let missing_comma_re = Regex::new(r"(?i)\b(however|therefore|moreover|furthermore|nevertheless|consequently|meanwhile|thus)\s+[a-z]").unwrap();
    for m in missing_comma_re.find_iter(text) {
        issues.push(Issue {
            kind: "punctuation".into(),
            start: m.start(),
            end: m.end(),
            message: "Transition word likely needs comma after it".into(),
            severity: "info".into(),
        });
    }
    
    let double_punct_re = Regex::new(r"[.!?,;:]{2,}").unwrap();
    for m in double_punct_re.find_iter(text) {
        issues.push(Issue {
            kind: "punctuation".into(),
            start: m.start(),
            end: m.end(),
            message: "Multiple punctuation marks".into(),
            severity: "error".into(),
        });
    }
    
    issues
}

fn check_repetitive_words(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let sentences: Vec<&str> = text.split(|c| c == '.' || c == '!' || c == '?').collect();
    
    for (idx, sentence) in sentences.iter().enumerate() {
        if sentence.trim().is_empty() { continue; }
        
        let words: Vec<&str> = sentence
            .split_whitespace()
            .map(|w| w.trim_matches(|c: char| !c.is_alphabetic()))
            .filter(|w| w.len() > 4)
            .collect();
        
        let mut word_positions: HashMap<String, Vec<usize>> = HashMap::new();
        for (pos, word) in words.iter().enumerate() {
            let word_lower = word.to_lowercase();
            word_positions.entry(word_lower).or_insert_with(Vec::new).push(pos);
        }
        
        for (word, positions) in word_positions {
            if positions.len() >= 2 {
                let sentence_start = text.split(|c| c == '.' || c == '!' || c == '?')
                    .take(idx)
                    .map(|s| s.len() + 1)
                    .sum::<usize>();
                
                issues.push(Issue {
                    kind: "repetition".into(),
                    start: sentence_start,
                    end: sentence_start + sentence.len(),
                    message: format!("Word '{}' repeated {} times in same sentence", word, positions.len()),
                    severity: "warning".into(),
                });
            }
        }
    }
    
    issues
}

fn check_sentence_pacing(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let sentences: Vec<&str> = text.split(|c| c == '.' || c == '!' || c == '?')
        .filter(|s| !s.trim().is_empty())
        .collect();
    
    for (idx, sentence) in sentences.iter().enumerate() {
        let word_count = sentence.split_whitespace().count();
        
        if word_count > 35 {
            let sentence_start = text.split(|c| c == '.' || c == '!' || c == '?')
                .take(idx)
                .map(|s| s.len() + 1)
                .sum::<usize>();
            
            issues.push(Issue {
                kind: "pacing".into(),
                start: sentence_start,
                end: sentence_start + sentence.len(),
                message: format!("Long sentence ({} words) - consider breaking up", word_count),
                severity: "info".into(),
            });
        }
        
        if word_count < 3 && !sentence.contains("!") {
            let sentence_start = text.split(|c| c == '.' || c == '!' || c == '?')
                .take(idx)
                .map(|s| s.len() + 1)
                .sum::<usize>();
            
            issues.push(Issue {
                kind: "pacing".into(),
                start: sentence_start,
                end: sentence_start + sentence.len(),
                message: "Very short sentence - ensure intentional for pacing".into(),
                severity: "info".into(),
            });
        }
    }
    
    if sentences.len() >= 4 {
        let word_counts: Vec<usize> = sentences.iter()
            .map(|s| s.split_whitespace().count())
            .collect();
        
        let avg_length: f64 = word_counts.iter().sum::<usize>() as f64 / word_counts.len() as f64;
        let variance: f64 = word_counts.iter()
            .map(|&count| {
                let diff = count as f64 - avg_length;
                diff * diff
            })
            .sum::<f64>() / word_counts.len() as f64;
        
        if variance < 5.0 {
            issues.push(Issue {
                kind: "pacing".into(),
                start: 0,
                end: 0,
                message: "Monotonous sentence rhythm - vary sentence lengths for better pacing".into(),
                severity: "info".into(),
            });
        }
    }
    
    issues
}

fn check_passive_voice(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    
    let passive_re = Regex::new(r"\b(was|were|is|are|been|be|being)\s+(\w+ed|\w+en|given|taken|written|broken|spoken|chosen|frozen|driven|risen|eaten|beaten|hidden|ridden|seen|done|gone|known|shown|thrown|grown|blown|flown|drawn|withdrawn|overdrawn|mistaken|shaken|woken|stolen|gotten|forgotten|born|worn|torn|sworn|shorn)\b").unwrap();
    
    for m in passive_re.find_iter(text) {
        issues.push(Issue {
            kind: "passive_voice".into(),
            start: m.start(),
            end: m.end(),
            message: "Possible passive voice - consider active construction".into(),
            severity: "warning".into(),
        });
    }
    issues
}

fn check_hedging_words(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let hedging_re = Regex::new(r"\b(seems?|seemed|appears?|appeared|probably|possibly|maybe|perhaps|might|could|would|somewhat|kind of|sort of|tends? to)\b").unwrap();
    
    for m in hedging_re.find_iter(text) {
        issues.push(Issue {
            kind: "hedging".into(),
            start: m.start(),
            end: m.end(),
            message: format!("Hedging word '{}' weakens assertiveness", m.as_str()),
            severity: "info".into(),
        });
    }
    issues
}

fn check_telling_words(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let telling_re = Regex::new(r"\b(felt|thought|realized|noticed|saw|heard|knew|wondered|decided|wanted|needed)\s+(that|how)\b").unwrap();
    
    for m in telling_re.find_iter(text) {
        issues.push(Issue {
            kind: "telling".into(),
            start: m.start(),
            end: m.end(),
            message: "Possible 'telling' - consider showing through action/dialogue".into(),
            severity: "info".into(),
        });
    }
    issues
}

fn check_overused_conjunctions(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let conjunction_re = Regex::new(r"\b(and|but|or)\s+\w+\s+(and|but|or)\s+\w+\s+(and|but|or)").unwrap();
    
    for m in conjunction_re.find_iter(text) {
        issues.push(Issue {
            kind: "conjunction_chain".into(),
            start: m.start(),
            end: m.end(),
            message: "Too many conjunctions - consider breaking into separate sentences".into(),
            severity: "warning".into(),
        });
    }
    issues
}

fn check_double_spaces(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let double_space_re = Regex::new(r"  +").unwrap();
    
    for m in double_space_re.find_iter(text) {
        issues.push(Issue {
            kind: "formatting".into(),
            start: m.start(),
            end: m.end(),
            message: "Multiple spaces - clean up formatting".into(),
            severity: "info".into(),
        });
    }
    issues
}

fn check_spelling(text: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let spelling_errors = spellcheck::check_spelling(text);
    
    for (start, end, word) in spelling_errors {
        issues.push(Issue {
            kind: "spelling".into(),
            start,
            end,
            message: format!("Possible spelling error: '{}'", word),
            severity: "error".into(),
        });
    }
    issues
}
