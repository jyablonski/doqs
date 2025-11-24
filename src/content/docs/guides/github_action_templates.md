---
title: GitHub Action Templates
description: Guide for Understanding & implementing GitHub Action Templates
lastUpdated: 2025-11-24
---

This page walks through GitHub Action Templates, how to use them, and how they are structured within this project.

---

## What are GitHub Action Templates?

GitHub Action Templates are modularized, reusable workflow components that encapsulate common CI/CD patterns into a single, callable action. Instead of copying and pasting the same workflow steps across multiple repositories, you create a centralized action that can be used across many workflows or repositories.

- All of the CI / CD Workflows used throughout this project use templates like this

**Key Benefits:**

- **Consistency:** Ensure all projects follow the same deployment, testing, or notification patterns
- **Maintainability:** Update logic in one place and have it propagate to all consumers
- **Simplicity:** Reduce boilerplate in individual repository workflows
- **Standardization:** Enforce organizational best practices across all projects

GitHub Action Templates live in their own repository and are organized as individual actions within subdirectories.

- These are maintained here: [https://github.com/jyablonski/actions](https://github.com/jyablonski/actions)

## Repository Structure

```
actions/
├── deploy/
│   └── action.yaml
├── alert/
│   └── action.yaml
├── scripts/
│   └── build-slack-message.sh
└── README.md
```

### Organization

- **Individual Action Folders:** Each action gets its own dedicated folder (e.g., `deploy/`, `alert/`) containing its `action.yaml` file
- **Special `scripts/` Folder:** This directory hosts reusable bash scripts that are used across multiple actions. Centralizing complex logic into scripts keeps the `action.yaml` files clean and simple, making them easier to read and maintain. Scripts can be referenced from any action using relative paths

### Creating a New Action

Each action requires an `action.yaml` file that defines its interface. Here's a basic structure:

```yaml
name: "Action Name"
description: "Description of what this action does"

inputs:
  role-to-assume:
    description: "AWS IAM Role ARN to assume"
    required: true
  aws-region:
    description: "AWS Region"
    required: true
    default: "us-east-1"

runs:
  using: "composite"
  steps:
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: ${{ inputs.role-to-assume }}
        aws-region: ${{ inputs.aws-region }}

    - name: Do Something
      shell: bash
      run: |
        echo "Executing action logic..."
```

**Important Notes:**

- Use `using: 'composite'` so GitHub knows this action is a composite of multiple steps and is meant to be called from other workflows
- All shell commands must specify `shell: bash`
- Reference inputs using `${{ inputs.input-name }}`
- Outputs can be defined using the `outputs:` section

## How to Use GitHub Action Templates

Once your action templates are created and pushed to the repository, any workflow can reference them using the standard GitHub Actions syntax.

### Basic Usage

```yaml
- name: Step Name
  uses: jyablonski/actions/<action-name>@<version>
  with:
    input-name: value
```

### Real-World Examples

#### Example 1: Deploy to ECR

```yaml
- name: Build and Push Docker Image to ECR
  uses: jyablonski/actions/deploy@v1
  with:
    role-to-assume: ${{ env.IAM_ROLE }}
    aws-region: ${{ env.AWS_REGION }}
    ecr-repo: ${{ env.ECR_REPO }}
    image-name: ${{ env.IMAGE_NAME }}
    dockerfile: docker/Dockerfile
    context: .
```

This single step replaces what would typically be 5-10 individual steps for AWS authentication, Docker building, tagging, and pushing to ECR.

#### Example 2: Slack Notifications

```yaml
notify:
  needs: [test, deploy]
  if: always()
  runs-on: ubuntu-latest
  steps:
    - name: Slack Alert
      uses: jyablonski/actions/alert@v1
      with:
        status: ${{ contains(needs.*.result, 'failure') && 'failure' || 'success' }}
        webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

This handles complex logic for determining job status and formatting Slack notifications in a single, reusable step.

### Versioning

When referencing actions, you can use different version strategies:

- `@v1` - Uses the `v1` branch (recommended for production, gets latest v1.x updates)
- `@v1.0.3` - Uses a specific tag (pinned version, no automatic updates)
- `@main` - Uses the main branch (not recommended, unstable)

**Best Practice:** Use `@v1` for production workflows to automatically receive bug fixes and improvements while maintaining major version compatibility.

## How Action Updates are Managed

Our action templates use a two-tier versioning system that balances stability with automatic updates.

### The v1 Branch Strategy

The `v1` branch is a **moving target** that always points to the latest stable v1.x release. This allows consumers to automatically receive:

- Bug fixes
- Security patches
- Minor improvements
- New optional features

Without requiring any changes to their workflow files.

### Release Process

When making changes to action templates:

1. Develop and test changes on a feature branch
2. Merge the feature branch to `main`
3. Create a semantic version tag (e.g., `v1.0.3`)
4. Sync the `v1` branch to point to the latest v1.x tag

### Automation Script

A simple Makefile command is used to automate the release and branch synchronization process:

```makefile
# execute a release after merging a PR to main
# example: `make release VERSION=v1.0.3`
.PHONY: release
release:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ VERSION required. Usage: make release VERSION=v1.0.3"; \
		exit 1; \
	fi; \
	echo "Creating release $(VERSION)..."; \
	git tag $(VERSION); \
	git push origin $(VERSION); \
	$(MAKE) sync-v1

.PHONY: sync-v1
sync-v1:
	@echo "Syncing v1 branch with latest v1.* tag..."
	@latest_tag=$$(git tag -l "v1.*" --sort=-creatordate | head -n 1); \
	if [ -z "$$latest_tag" ]; then \
		echo "❌ No v1.* tags found"; \
		exit 1; \
	fi; \
	echo "Latest tag: $$latest_tag"; \
	git fetch --all --tags; \
	git checkout tags/$$latest_tag -b tmp-v1; \
	git push origin tmp-v1:v1 --force; \
	git checkout main; \
	git branch -D tmp-v1; \
	echo "v1 branch updated to $$latest_tag"
```

### How to Cut a New Release

```bash
# After merging your changes to main
make release VERSION=v1.0.3
```

This command will:

1. Create a git tag for `v1.0.3`
2. Push the tag to the remote repository
3. Find the latest v1.x tag
4. Force update the `v1` branch to point to that tag
5. All workflows using `@v1` will automatically use the new version

### Breaking Changes

If you need to introduce breaking changes:

- Increment the major version (e.g., `v2.0.0`)
- Create a new `v2` branch
- Consumers must explicitly update their workflows from `@v1` to `@v2`
- Continue supporting `v1` branch for existing consumers

## Complete Workflow Example

Here's a full workflow that leverages multiple action templates:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  IAM_ROLE: arn:aws:iam::123456789012:role/github-actions
  ECR_REPO: my-app
  IMAGE_NAME: my-service

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Run Tests
        run: make est

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v5

      - name: Build and Push Docker Image to ECR
        uses: jyablonski/actions/deploy@v1
        with:
          role-to-assume: ${{ env.IAM_ROLE }}
          aws-region: ${{ env.AWS_REGION }}
          ecr-repo: ${{ env.ECR_REPO }}
          image-name: ${{ env.IMAGE_NAME }}
          dockerfile: docker/Dockerfile
          context: .

  notify:
    needs: [test, deploy]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Slack Alert
        uses: jyablonski/actions/alert@v1
        with:
          status: ${{ contains(needs.*.result, 'failure') && 'failure' || 'success' }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```
