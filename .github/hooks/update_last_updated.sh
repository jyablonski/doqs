#!/bin/bash

# Get the current UTC timestamp
timestamp=$(date -u +"%Y-%m-%d %H:%M:%SZ")

echo "Running lastUpdated update..."
echo "Timestamp: $timestamp"

# Get a list of staged Markdown files
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$')

# Check if any Markdown files are staged
if [[ -z "$staged_files" ]]; then
  echo "No staged Markdown files to update."
  exit 0
fi

# Update the lastUpdated field in staged files
for file in $staged_files; do
  echo "Updating: $file"
  sed -i "s/^lastUpdated: .*/lastUpdated: $timestamp/" "$file"
  git add "$file"  # Re-stage the modified file
done

echo "lastUpdated Sync complete."