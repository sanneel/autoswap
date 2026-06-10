#!/bin/bash
#
# agent-status.sh
#
# Shows the status of all agent worktrees and their branches.
# Useful for tracking parallel development progress.
#
# Usage:
#   ./scripts/agent-status.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$REPO_ROOT"

echo "=========================================="
echo "SwapRide Agent Status"
echo "=========================================="
echo ""

# Check if git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: Not a git repository"
  exit 1
fi

# Show current branch
echo "Current branch:"
git branch --show-current
echo ""

# Show all worktrees
echo "Active worktrees:"
echo "----------------------------------------"
git worktree list | while read -r line; do
  if [[ -z "$line" ]]; then
    echo "(none)"
  else
    echo "$line"
  fi
done
echo ""

# Show agent branches (those starting with agent/)
echo "Agent branches:"
echo "----------------------------------------"
git branch --list "agent/*" 2>/dev/null || echo "(none)"
echo ""

# Show recent commits on agent branches
echo "Recent commits on agent branches:"
echo "----------------------------------------"
for branch in $(git branch --list "agent/*" 2>/dev/null); do
  echo ""
  echo "Branch: $branch"
  git log --oneline -3 "$branch" 2>/dev/null | sed 's/^/  /' || echo "  (no commits)"
done
echo ""

# Show uncommitted changes
echo "Uncommitted changes in current worktree:"
echo "----------------------------------------"
if git status --porcelain | grep -q .; then
  git status --short | sed 's/^/  /'
else
  echo "(none)"
fi
echo ""

# Show stash list
echo "Stashed changes:"
echo "----------------------------------------"
if git stash list | grep -q .; then
  git stash list | sed 's/^/  /'
else
  echo "(none)"
fi
echo ""

echo "=========================================="
echo "Quick Commands"
echo "=========================================="
echo ""
echo "  Create new agent worktree:"
echo "    ./scripts/create-agent-worktrees.sh feature"
echo ""
echo "  Switch to worktree:"
echo "    cd worktrees/<agent-name>"
echo ""
echo "  Commit and push agent work:"
echo "    git add . && git commit -m 'Description' && git push"
echo ""