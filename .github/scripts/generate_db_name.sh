#!/bin/bash

# Get the branch name from the first argument
RAW_BRANCH=$1

# 1. Lowercase
# 2. Replace any non-alphanumeric with -
# 3. Trim leading/trailing -
# 4. Collapse multiple -- to single -
SAFE_NAME=$(echo "$RAW_BRANCH" \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/[^a-z0-9]/-/g' \
  | sed 's/--*/-/g' \
  | sed 's/^-//;s/-$//')

# Ensure it starts with a letter (Turso requirement)
if [[ -z "$SAFE_NAME" || "$SAFE_NAME" =~ ^[0-9] ]]; then
  SAFE_NAME="br-$SAFE_NAME"
fi

# Output the result for GitHub Actions
echo "$SAFE_NAME"
