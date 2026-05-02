#!/usr/bin/env bash
# Create private GitHub repos for new microservices (if missing) and push each submodule.
# Prerequisites: PATH includes brew gh, and: gh auth login -h github.com
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

cd "$ROOT"
gh auth status -h github.com || {
  echo "Run: gh auth login -h github.com"
  exit 1
}

desc_for() {
  case "$1" in
    deck) echo "Mindlet deck & flashcards microservice" ;;
    ai) echo "Mindlet AI / LLM microservice" ;;
    study) echo "Mindlet study / SRS microservice" ;;
    collaboration) echo "Mindlet collaboration / sharing microservice" ;;
    analytics) echo "Mindlet analytics / events microservice" ;;
    *) echo "Mindlet microservice" ;;
  esac
}

for name in deck ai study collaboration analytics; do
  repo="ross2p/mindlet-${name}"
  if ! gh repo view "$repo" &>/dev/null; then
    gh repo create "$repo" --private -d "$(desc_for "$name")"
  fi
  (cd "apps/${name}"
    git remote set-url origin "git@github.com:ross2p/mindlet-${name}.git"
    git push -u origin main
  )
done

echo "All five service repos pushed. Commit submodule SHAs from the parent repo when ready."
