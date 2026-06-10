#!/bin/bash
#
# create-agent-worktrees.sh
#
# Creates Git worktrees for parallel agent development.
# Each agent gets its own branch/worktree to work in isolation.
#
# Usage:
#   ./scripts/create-agent-worktrees.sh [branch-prefix]
#
# Example:
#   ./scripts/create-agent-worktrees.sh feature
#

set -e

BRANCH_PREFIX="${1:-agent}"
BASE_BRANCH="${BASE_BRANCH:-main}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$REPO_ROOT"

echo "=========================================="
echo "Creating agent worktrees from $BASE_BRANCH"
echo "=========================================="
echo ""

# Define agent worktrees (can be customized)
declare -a AGENTS=(
  "auth-feature"
  "car-management"
  "chat-improvements"
  "paywall-work"
  "web-dashboard"
)

# Check if git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: Not a git repository"
  exit 1
fi

# Make sure base branch exists
if ! git show-ref --quiet "refs/heads/$BASE_BRANCH"; then
  echo "Error: Base branch '$BASE_BRANCH' does not exist"
  exit 1
fi

# Create worktrees
for AGENT in "${AGENTS[@]}"; do
  BRANCH_NAME="${BRANCH_PREFIX}/${AGENT}"
  WORKTREE_PATH="$REPO_ROOT/worktrees/$AGENT"
  
  echo "Creating worktree: $BRANCH_NAME -> $WORKTREE_PATH"
  
  # Create directory for worktree
  mkdir -p "$WORKTREE_PATH"
  
  # Create worktree with new branch
  if git worktree list | grep -q "$WORKTREE_PATH"; then
    echo "  Worktree already exists at $WORKTREE_PATH"
  else
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" "$BASE_BRANCH"
    echo "  Created new branch: $BRANCH_NAME"
  fi
  
  echo ""
done

echo "=========================================="
echo "Worktree Summary"
echo "=========================================="
git worktree list

echo ""
echo "To work in a worktree:"
echo "  cd worktrees/<agent-name>"
echo ""
echo "To clean up (remove a worktree):"
echo "  git worktree remove worktrees/<agent-name>"
echo ""