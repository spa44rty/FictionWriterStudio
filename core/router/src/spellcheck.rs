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

fn levenshtein_distance(s1: &str, s2: &str) -> usize {
    let len1 = s1.len();
    let len2 = s2.len();
    let mut matrix = vec![vec![0; len2 + 1]; len1 + 1];

    for i in 0..=len1 {
        matrix[i][0] = i;
    }
    for j in 0..=len2 {
        matrix[0][j] = j;
    }

    for (i, c1) in s1.chars().enumerate() {
        for (j, c2) in s2.chars().enumerate() {
            let cost = if c1 == c2 { 0 } else { 1 };
            matrix[i + 1][j + 1] = (matrix[i][j + 1] + 1)
                .min(matrix[i + 1][j] + 1)
                .min(matrix[i][j] + cost);
        }
    }

    matrix[len1][len2]
}

pub fn suggest_corrections(word: &str, max_suggestions: usize) -> Vec<String> {
    let word_lower = word.to_lowercase();
    let mut candidates: Vec<(&str, usize)> = Vec::new();
    
    for &dict_word in COMMON_WORDS.iter() {
        if dict_word.len() > 1 && (dict_word.len() as i32 - word_lower.len() as i32).abs() <= 2 {
            let distance = levenshtein_distance(&word_lower, dict_word);
            if distance <= 2 {
                candidates.push((dict_word, distance));
            }
        }
    }
    
    candidates.sort_by_key(|&(_, dist)| dist);
    candidates.truncate(max_suggestions);
    candidates.into_iter().map(|(w, _)| w.to_string()).collect()
}

pub fn check_spelling(text: &str) -> Vec<(usize, usize, String, Vec<String>)> {
    let mut errors = Vec::new();
    let mut current_pos = 0;
    
    for word_match in text.split(|c: char| !c.is_alphabetic() && c != '\'' && c != '-') {
        if !word_match.is_empty() {
            let word = word_match.trim_matches(|c: char| !c.is_alphabetic());
            
            if !word.is_empty() && word.len() >= 3 && !is_word_correct(word) {
                let pos = text[current_pos..].find(word).map(|p| current_pos + p);
                if let Some(start) = pos {
                    let suggestions = suggest_corrections(word, 3);
                    errors.push((start, start + word.len(), word.to_string(), suggestions));
                }
            }
        }
        current_pos += word_match.len() + 1;
    }
    
    errors
}
