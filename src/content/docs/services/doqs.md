---
title: Doqs
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-19
---


Doqs is an internal site written in Starlight to store documentation on the NBA ELT Project

## Architecture

``` mermaid
graph LR
    A[User Facing Traffic] --> B[Amazon CloudFront]
    B --> C[S3 Bucket ]
    C --> B
    B --> A

```

## How It Works

Astro Starlight is a theme and framework built on top of Astro, designed specifically for creating modern, fast, and customizable documentation websites. It leverages Astro’s component-based architecture and static site generation capabilities to deliver highly performant docs. It ships with a default template and a handful of prebuilt components to allow various customization.

During build time, Astro compiles all .md files into static HTML, CSS, and JS.

- It leverages partial hydration, so only interactive components ship JavaScript to the browser, keeping most pages fast and lightweight.
- These static files can then be used to host a static web app on something like Netlify, GitHub Pages, or S3

Starlight enables a very fast initial setup process and offers an elegant solution to hosting an internal documentation site.

## Libraries

1. [Starlight](https://starlight.astro.build/)

## Production

Doqs is deployed to an S3 bucket with static website hosting enabled. A CloudFront distribution pulls from the S3 website endpoint and is routed via Route 53 to a custom domain to enable the content to be served at https://doqs.jyablonski.dev.

## CI / CD

For continuous integration (CI), a minimal process is executed to simply build the project and make sure everything compiles & builds cleanly. This runs on every commit on a pull request.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. The project is built into a set of static HTML, CSS, and JS files in the `dist/` folder
2. The `dist/` folder is then synced to an S3 bucket
3. CloudFront automatically serves the updated content from the S3 bucket
