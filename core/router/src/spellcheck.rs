use std::collections::HashSet;
use once_cell::sync::Lazy;

static COMMON_WORDS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    let words = include_str!("common_words.txt");
    words.lines().map(|w| w.trim()).collect()
});

pub fn is_word_correct(word: &str) -> bool {
    let word_lower = word.to_lowercase();
    
    if word_lower.is_empty() || word_lower.len() < 2 {
        return true;
    }
    
    if COMMON_WORDS.contains(word_lower.as_str()) {
        return true;
    }
    
    if word_lower.chars().all(|c| c.is_uppercase() || !c.is_alphabetic()) {
        return true;
    }
    
    if word_lower.chars().next().unwrap().is_uppercase() && word.len() > 1 {
        return true;
    }
    
    false
}

pub fn check_spelling(text: &str) -> Vec<(usize, usize, String)> {
    let mut errors = Vec::new();
    let mut current_pos = 0;
    
    for word_match in text.split(|c: char| !c.is_alphabetic() && c != '\'' && c != '-') {
        if !word_match.is_empty() {
            let word = word_match.trim_matches(|c: char| !c.is_alphabetic());
            
            if !word.is_empty() && word.len() >= 3 && !is_word_correct(word) {
                let pos = text[current_pos..].find(word).map(|p| current_pos + p);
                if let Some(start) = pos {
                    errors.push((start, start + word.len(), word.to_string()));
                }
            }
        }
        current_pos += word_match.len() + 1;
    }
    
    errors
}
