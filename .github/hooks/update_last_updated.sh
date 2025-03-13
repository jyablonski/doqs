#!/bin/bash

# Get the current UTC timestamp
timestamp=$(date -u +"%Y-%m-%d %H:%M:%SZ")

# Update the lastUpdated field in Markdown files
sed -i "s/^lastUpdated: .*/lastUpdated: $timestamp/" *.md
