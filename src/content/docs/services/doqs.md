---
title: Doqs
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-17 23:32:49Z
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

Hover event triggers a prefetch:

Astro/Starlight starts fetching the page data or HTML.
That's why you see the first server log (e.g., /services/dbt/ 13ms) just by hovering.
Click event triggers a full navigation:

After you click, the router proceeds with navigation (or hydration), but since part of the page is preloaded, it’s faster.
The second log you see is the actual page load completing after the click.

## Code Layout

The project follows a structured directory layout to maintain a clean and organized codebase. Below is a breakdown of each directory and its purpose:

### `.github/`
- Contains CI/CD configuration files for continuous integration and deployment processes (e.g., GitHub Actions workflows).

### `docker/`
- Stores all Docker-related files such as `Dockerfile` and `docker-compose.yml` used for testing and local development environments.

### `tests/`
- Contains all the test cases for the project. The tests are organized into the following categories:
  - unit/: Contains unit tests for individual functions (e.g., `generate_salt`).
  - integration/: Contains integration tests that involve interactions with external systems (e.g., PostgreSQL, Redis, API endpoints).

### `src/`
- Contains the application code that implements the core functionality of the project. Key files and subdirectories include:
  - dao/: Contains all SQL-related code such as queries, database interactions, and data access objects (DAOs). This is where most of the database logic should reside.
  - server.py: The main server file that initializes and runs the application. It typically contains the application setup and the entry point for the API server.
  - models.py: Defines the SQLAlchemy ORM models for the application, where all the database tables and relationships are specified.
  - security.py: Contains code related to security and JWT (JSON Web Token) authentication. This file handles user authentication, authorization, and token generation/validation.
  - routers/: Contains individual files for each API endpoint. Each file should handle a specific route or set of related routes and the logic for processing requests related to that route.
  - middleware/: Includes any middleware components used to process requests before reaching the endpoint logic (e.g., authentication checks, logging, etc.).
  - schemas.py: Defines the schemas for endpoint input and output data (typically using Pydantic or Marshmallow). This is where the structure of request/response payloads is specified.


## Libraries

1. FastAPI is the primary package driving the REST API development
2. Pydantic enables type validation for request and response information in the endpoints

## Production



## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. The project is built into a set of static HTML, CSS, and JS files in the `dist/` folder
2. The files are then uploaded to an S3 bucket
3. CloudFront reads from that S3 bucket & automatically serves the updated files as soon as the cache expires
