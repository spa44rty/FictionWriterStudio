#!/usr/bin/env bash
set -euo pipefail
export OLLAMA_MODELS="${OLLAMA_MODELS:-$HOME/.ollama}"
models=("llama3.1:8b" "nomic-embed-text")
for m in "${models[@]}"; do
  echo "Pulling $m"; ollama pull "$m"; done
ollama list
