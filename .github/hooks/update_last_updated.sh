#!/bin/bash

timestamp=$(date -u +"%Y-%m-%d %H:%M:%SZ")
echo "Running lastUpdated update..."

# Find all Markdown files in the repository
md_files=$(git ls-files '*.md')

if [[ -z "$md_files" ]]; then
  echo "No Markdown files found."
  exit 0
fi

# Update lastUpdated field in each file and re-stage
for file in $md_files; do
  echo "Updating: $file"
  sed -i.bak "s/^lastUpdated: .*/lastUpdated: $timestamp/" "$file" && rm "$file.bak"
  git add "$file"
done

echo "lastUpdated sync complete."