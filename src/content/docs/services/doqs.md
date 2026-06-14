---
title: Doqs
description: Reference for the Doqs documentation site, Starlight setup, metadata, and deployment.
lastUpdated: 2026-06-14
author: jyablonski
tags: ["service", "documentation", "frontend"]
---

Doqs is an internal site written in Starlight to store documentation on the NBA ELT Project

---

## Architecture

```mermaid
graph LR
    User[User Traffic] -->|Request| CF[Amazon CloudFront]
    CF --> S3[S3 Bucket]
    S3 --> CF
    CF -->|Response| User

    subgraph Infra[AWS]
        CF
        S3
    end

    style Infra fill:#89888f,stroke:#444444,stroke-width:2px


```

## How It Works

Starlight is a theme and framework built on top of Astro, designed specifically for creating modern, fast, and customizable documentation websites. It leverages Astro’s component-based architecture and static site generation capabilities to deliver highly performant docs. It ships with a default template and a handful of prebuilt components to allow various customization.

During build time, Astro compiles all .md files into static HTML, CSS, and JS.

- It leverages partial hydration, so only interactive components ship JavaScript to the browser, keeping most pages fast and lightweight.
- These static files can then be used to host a static web app on something like Netlify, GitHub Pages, or S3

Starlight enables a very fast initial setup process and offers an elegant solution to hosting an internal documentation site.

To enable the use of [Mermaid Diagrams](https://mermaid.js.org/) throughout the site, a custom remark plugin in the codebase transforms mermaid-labeled code blocks into HTML `<div>` elements.

- To turn those `<div>` elements into diagrams, the Mermaid JavaScript library is loaded on every page via a `<script>` tag attached to the `<head>` of every page. This external script detects these elements and renders them as diagrams in the browser.

### Tags

All documentation pages support frontmatter metadata including `author`, `lastUpdated`, and `tags`. Tags are used to categorize content and power the "Related Pages" feature at the bottom of each page.

**Tag Taxonomy:**

| Category         | Tags                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Document Type    | `guide`, `runbook`, `reference`, `architecture`                                                   |
| Technical Domain | `data-source`, `service`, `elt`, `ml`, `database`, `api`, `frontend`, `backend`, `infrastructure` |
| Technologies     | `python`, `aws`, `terraform`, `github-actions`, `web-scraping`, `ci-cd`                           |

Pages with shared tags are automatically linked together, helping users discover related content.

### .md vs .mdx

Starlight supports both `.md` and `.mdx` files for writing documentation pages. The main difference is that `.mdx` files allow you to embed React components directly within Markdown content, while `.md` files are strictly Markdown.

Some useful components such as `<Tabs>`, `<Steps>`, and `<FileTree>` are available only in `.mdx` files, allowing for more interactive and dynamic documentation experiences.

- For pages where you want to include these interactive components, you can use `.mdx` files.
- For all other pages that only require Markdown content, you should use `.md` files.

## Libraries

1. [Starlight](https://starlight.astro.build/)

## Production

Doqs is deployed to an S3 bucket with static website hosting enabled. A CloudFront distribution pulls from the S3 website endpoint and is routed via Route 53 to a custom domain to enable the content to be served at https://doqs.jyablonski.dev.

## CI / CD

### Continuous Integration

Two checks run on every pull request:

- **Test suite** - Vitest verifies the documentation content, metadata, links, and custom rendering behavior.
- **Build & test** - The site is built with `npm run build` to catch Astro or Starlight issues before the PR can be merged.

### Deployment

Once a PR is merged, the deploy pipeline runs:

1. **Re-run CI** to confirm the merged code is valid on the main branch.
2. **Static site build** - Builds the project into static HTML, CSS, and JS files in the `dist/` folder.
3. **S3 sync** - Syncs the `dist/` folder to the S3 bucket.
4. **CloudFront** - Serves the updated content from the S3 bucket.

The updated documentation site is available through the CloudFront distribution at https://doqs.jyablonski.dev.
