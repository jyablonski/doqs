---
title: Ingestion Script
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-17 23:32:49Z
---

The Ingestion Script is responsible for all source data ingestion for the NBA ELT Project

## Architecture

``` mermaid
graph LR
    A[Basketball-Reference] --> INGEST[Ingestion Script]
    B[DraftKings] --> INGEST
    C[Reddit] --> INGEST
    INGEST --> DB[Postgres Database]

```

### ELT Pipeline Orchestration
``` mermaid
graph LR
    A[Ingestion Script] --> B[dbt]
    B --> C[ML Pipeline]
```

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

1. Pandas is the primary package driving the REST API development
2. beautifulsoup4 enables web-scraping to be performed on various basketball-reference and draftkings pages
3. praw is used to authenticate to & pull data from the Reddit API
4. nltk provides Sentiment Analysis Functions to be applied on various social media text data
5. jyablonski_common_modules provides various functions to read & write data to Postgres

## Production



## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the Docker Image for the service which has the updated source code & dependencies
2. Pushes the Docker Image to ECR

On the next subsequent NBA ELT Pipeline run, this new Docker Image will be used when the Ingestion Script is scheduled to be ran in ECS
