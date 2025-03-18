---
title: REST API
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-17 23:32:49Z
---

The REST API Service is used to publicly serve the enriched & transformed data over various Endpoints. It also functions as a minimal web application that hosts Admin pages for managing various different features of the project.

## Architecture

``` mermaid
graph LR
    UserFacing[User-Facing Traffic] --> CF[CloudFront Distribution] --> API[REST API Service]

    subgraph VPC[AWS VPC]
        DB[Postgres Database]
        Redis[Redis Database]
        API
    end

    DB --> API
    Redis --> API

```

## Auth / Security

The REST API uses JWT (JSON Web Tokens) for authentication and authorization.

### `/token` Endpoint
- The `/token` endpoint is used when users attempt to log in.
- Upon successful authentication, the API returns a JWT that is used for subsequent requests.

### User Authentication Flow
- User Info Storage: User information, including the password, is stored in the database. The password is securely hashed and combined with a random salt for enhanced security.
  
### User Roles
- A role is associated with each user and is stored in the `rest_api_users` table in the database.
- There are two types of roles:
  - Admin: Users with the Admin role have access to the Admin UI and various management pages.
  - Consumer: Regular users with the Consumer role have access to general user-facing content and functionality.

---
## Libraries

1. FastAPI is the primary package driving the REST API development
2. Pydantic enables type validation for request and response information in the endpoints
3. Mangum turns the REST API into something that can be served on AWS Lambda
4. python-jose is used for handling JWT for user authentication
5. SQLAlchemy is used to provide ORM functionality for Postgres

## Production

In production, the REST API is hosted on an AWS Lambda function, with a Lambda Function URL configured for access.

- Cost Efficiency: This setup is highly cost-effective, as Lambda allows for thousands of invocations with minimal cost, unlike ECS or EKS, which require payment for EC2 instances.
  
- Limitations: 
  - The app becomes stateless, which can lead to cold starts.
  - Monitoring metrics with Prometheus is not possible in the same way as with traditional server setups.

All request logs are stored in AWS Cloudwatch, and traces are tracked via opentelemetry and sent over to Honeycomb where they can be monitored & alerted on.

## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds a `.ZIP` bundle containing the server's source code and dependencies.
2. Stores the `.ZIP` bundle in S3.
3. Updates the Lambda function with the new bundle.

## Code Layout

The project follows a structured directory layout to maintain a clean and organized codebase. Below is a breakdown of each directory and its purpose:

### `.github/`
- Contains CI/CD configuration files for continuous integration and deployment processes (e.g., GitHub Actions workflows).

### `docker/`
- Stores all Docker-related files such as `Dockerfile` and `docker-compose.yml` used for testing and local development environments.

### `static/`
- Holds static assets like CSS, images, JavaScript files, and other resources that do not change dynamically. These files are served directly to the client.

### `tests/`
- Contains all the test cases for the project. The tests are organized into the following categories:
  - `unit/`: Contains unit tests for individual functions (e.g., `generate_salt`).
  - `integration/`: Contains integration tests that involve interactions with external systems (e.g., PostgreSQL, Redis, API endpoints).

### `templates/`
- Stores HTML page templates. These templates are used for rendering dynamic HTML content on the server-side before sending it to the client.

### `src/`
- Contains the application code that implements the core functionality of the project. Key files and subdirectories include:
  - `server.py`: The main server file that initializes and runs the application. It typically contains the application setup and the entry point for the API server.
  - `models.py`: Defines the SQLAlchemy ORM models for the application, where all the database tables and relationships are specified.
  - `security.py`: Contains code related to security and JWT (JSON Web Token) authentication. This file handles user authentication, authorization, and token generation/validation.
  - `schemas.py`: Defines the schemas for endpoint input and output data (typically using Pydantic or Marshmallow). This is where the structure of request/response payloads is specified.
  - `middleware.py`: Includes any middleware components used to process requests before reaching the endpoint logic (e.g., authentication checks, logging, etc.).
  - `routers/`: Folder which contains individual files for each API endpoint. Each file should handle a specific route or set of related routes and the logic for processing requests related to that route.
  - `dao/`: Folder which contains individual files for all SQL-related code such as queries, database interactions, and data access objects (DAOs). This is where most of the database logic should reside.

