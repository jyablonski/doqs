---
title: Dash Frontend
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-17 23:32:49Z
---


The xxx Service is yyy

## Architecture

``` mermaid
graph LR
    User[User-Facing Traffic] --> ALB[Application Load Balancer]
    ALB -->|Routes Traffic| DASH[Dash Frontend Service]
    DB[Postgres Database] --> DASH
    subgraph VPC[AWS VPC]
        ALB
        DB
        subgraph ECSBox[ECS]
            DASH
        end
    end

  style VPC fill:#89888f,stroke:#444444,stroke-width:2px
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

1. dash is the primary package driving the frontend application development
2. Pandas is used to store all data from database to serve throughout various graphs, plots, and tables
3. dash-bootstrap-components is used to provide template objects to help build out the UI

## Production

The Dash Frontend is hosted on ECS, which is connected to an EC2 instance managed by an Auto Scaling Group (ASG), ensuring at least one EC2 instance is always running to support the ECS service. 

- This utilizes the 1 free EC2 t3.micro instance that free-tier accounts are alotted per month

This is further connected to an Application Load Balancer (ALB), which is configured with Route 53 to route traffic to the ECS service at https://nbadashboard.jyablonski.dev.

- Since February 2024, ALBs have IPv4 charges even on free-tier accounts, so this costs about $12 / month to support


## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the Docker Image for the service which has the updated source code & dependencies
2. Pushes the Docker Image to ECR
3. Restarts the ECS Nodes that run the ECS Service so that they pull & serve the updated Docker Image

- **NOTE** For larger projects a more sophisticated deployment process would be ideal here like blue / green or a rolling deploy, but this process is simply enough to support the low traffic
