#!/usr/bin/env bash
# Create GitHub repos (gh), add as git submodules, copy scaffold from .scaffold-cache, commit and push.
# Prerequisites: SSH access to github.com (git@github.com), and: gh auth login -h github.com
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
  echo "=== ${repo} ==="
  if ! gh repo view "$repo" &>/dev/null; then
    gh repo create "$repo" --private -d "$(desc_for "$name")"
  else
    echo "Repo already exists: $repo"
  fi

  if [[ -d "apps/${name}/.git" ]]; then
    echo "apps/${name} already a git checkout; syncing scaffold..."
  else
    git submodule add "git@github.com:ross2p/mindlet-${name}.git" "apps/${name}"
  fi

  rsync -a --exclude .git "${ROOT}/.scaffold-cache/${name}/" "${ROOT}/apps/${name}/"

  (cd "apps/${name}"
    npm install
    git checkout -b main 2>/dev/null || git checkout main 2>/dev/null || true
    git add -A
    git status
    if ! git diff --cached --quiet; then
      git commit -m "feat: initial NestJS microservice scaffold"
    fi
    git push -u origin HEAD
  )
done

echo "Done. Commit submodule pointers in parent repo: cd $ROOT && git add apps/deck apps/ai apps/study apps/collaboration apps/analytics .gitmodules"
