---
title: arc
description: CLI tool for system maintenance and NBA project workflows
lastUpdated: 2026-01-12
author: jyablonski
tags: ["service", "cli", "go"]
---

arc is a developer experience CLI tool written in Go for system maintenance and workflow automation related to the NBA project. It provides a unified interface for interacting with various services and simplifies common development tasks so users can focus on building features.

> **Note:** This tool is under active development. Documentation may lag behind the latest features.

## Why Go?

Go was chosen for its performance, simplicity, and statically compiled nature. It builds into a single binary with no external dependencies, making distribution easy while being lightweight and fast.

## Usage

```bash
arc [command] [flags]
```

### Global Flags

| Flag            | Description           |
| --------------- | --------------------- |
| `-h, --help`    | Help for arc          |
| `-j, --json`    | Output in JSON format |
| `-v, --version` | Show version          |

### Commands

| Command     | Description                                          |
| ----------- | ---------------------------------------------------- |
| `aws`       | AWS-related commands                                 |
| `clean`     | Clean package cache and remove orphaned packages     |
| `docker`    | Clean Docker resources (images, containers, volumes) |
| `gh`        | GitHub workflow management                           |
| `git`       | Clean up Git repositories                            |
| `info`      | Show system information                              |
| `installed` | List explicitly installed packages                   |
| `packages`  | Show package statistics                              |
| `parts`     | Show hardware information                            |
| `setup`     | Install required packages and tools                  |
| `sleep`     | Suspend the system                                   |
| `update`    | Run system updates (pacman, yay, cache cleanup)      |
| `validate`  | Validate that all required tools are available       |

Use `arc [command] --help` for detailed information about any command.

## Examples

### Rotate AWS Keys

```bash
arc aws rotate-keys
```

This command rotates your AWS IAM access keys by:

1. Backing up your existing credentials file
2. Creating a new access key pair in AWS
3. Updating your local credentials with the new keys
4. Deactivating and deleting the old access key
5. Removing the backup file

If any step fails, the command restores your original credentials from the backup.

### Restart Dashboard

```bash
arc gh restart-dashboard
```

Triggers the GitHub Actions workflow to restart the dashboard service, typically used after backfills or manual data updates.

### System Update

```bash
arc update
```

Updates system packages using pacman and yay, cleans the package cache, removes orphaned packages, and provides a summary of changes.

## CI/CD

The CI pipeline runs on every push and pull request:

- Runs unit tests
- Builds the Go binary for Linux

The CD pipeline triggers on new tags and publishes releases to GitHub.

### Creating a Release

```bash
make release version=v0.3.1
```

This creates and pushes the tag, which triggers the CD pipeline to build and upload the binary to GitHub Releases.

## Future Ideas

- Integrate with additional services
- Add more commands for common workflows
