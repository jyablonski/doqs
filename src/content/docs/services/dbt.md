---
title: dbt
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-17 23:32:49Z
---


The dbt Project is responsible for pulling source data in the Database and transforming & enriching it where it can used by downstream Services + Applicatio

## Architecture

``` mermaid
graph LR
    subgraph DB[Postgres Database]
        NBA[Source]
        
        subgraph dbt
            FACT[Fact]
            DIM[Dimension]
            PREP[Prep]
            MART[Mart]
        end

        NBA --> FACT
        NBA --> DIM
        FACT & DIM --> PREP
        PREP --> MART
    end

    MART --> DASH[Dash Frontend]
    MART --> API[REST API Service]
```

### ELT Pipeline Orchestration
``` mermaid
graph LR
    A[Ingestion Script] --> B[dbt]
    B --> C[ML Pipeline]
```

## How It Works

## Libraries

1. dbt-core is the primary library supporting the data transformation & enrichment modeling process in SQL
2. dbt-postgres is an adapter package that offers support dbt to work w/ Postgres
3. sqlfluff is used for SQL Linting + Formatting and is automatically setup in a pre-commit hook

## Production



## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

- This test suite builds the entire dbt project in a Postgres container running in Docker that has been bootstrapped w/ dummy source data

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the Docker Image for the service which has the updated source code & dependencies
2. Pushes the Docker Image to ECR

On the next subsequent NBA ELT Pipeline run, this new Docker Image will be used when the dbt job is scheduled to be ran in ECS

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

### `models/`
- Contains the application code that implements the core functionality of the project. Key files and subdirectories include:
  - dao/: Contains all SQL-related code such as queries, database interactions, and data access objects (DAOs). This is where most of the database logic should reside.
  - server.py: The main server file that initializes and runs the application. It typically contains the application setup and the entry point for the API server.
  - models.py: Defines the SQLAlchemy ORM models for the application, where all the database tables and relationships are specified.
  - security.py: Contains code related to security and JWT (JSON Web Token) authentication. This file handles user authentication, authorization, and token generation/validation.
  - routers/: Contains individual files for each API endpoint. Each file should handle a specific route or set of related routes and the logic for processing requests related to that route.
  - middleware/: Includes any middleware components used to process requests before reaching the endpoint logic (e.g., authentication checks, logging, etc.).
  - schemas.py: Defines the schemas for endpoint input and output data (typically using Pydantic or Marshmallow). This is where the structure of request/response payloads is specified.
