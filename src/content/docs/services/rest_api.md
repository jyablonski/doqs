---
title: REST API
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-08-01
---

The REST API is a Python Service used to publicly serve the enriched & transformed data over various endpoints. It also functions as a minimal web application that hosts Admin pages for managing various different features of the project.

---
## Architecture

``` mermaid
graph LR
    User[User Traffic] -->|Request| CF[CloudFront Distribution]
    CF --> API[REST API Service]
    API --> CF
    CF -->|Response| User

    subgraph AWS_VPC[AWS VPC]
        DB[Postgres]
        Redis[Redis]
        API
    end

    DB --> API
    Redis --> API

    style AWS_VPC fill:#89888f,stroke:#444444,stroke-width:2px
    style API fill:#d6d6d6,stroke:#444444,stroke-width:1.5px
    style DB fill:#d6d6d6,stroke:#444444,stroke-width:1.5px
    style Redis fill:#d6d6d6,stroke:#444444,stroke-width:1.5px

```
---

## How It Works

### 1. REST API
- Serves NBA ELT pipeline data via multiple RESTful endpoints.
- Exposes data related to teams, players, games, betting odds, and user predictions.
- Endpoints are available to anyone, even without authentication.

### 2. Web Application
- Provides a simple frontend where users can:
  - Create an Account and log in via username and password.
  - Place simulated (fake) bets on upcoming NBA games based on moneyline odds.
  - View historical performance and track betting accuracy over time, updated after game results are processed.

### 3. Admin Dashboard
- An extension of the Web Application frontend to provide a separate admin UI used to manage project-wide settings and features.
- Restricted to users with the Admin role.


## Auth

The REST API uses JWT (JSON Web Token) for authentication and authorization.

- The `/token` endpoint is used when users attempt to log in.
- After validating the user's credentials, the API returns a JWT that is used for subsequent requests.

User information, including the password, is stored in the database. The password is securely hashed and combined with a random salt for enhanced security.

- This approach eliminates the need for third-party user data management

### User Roles
- A role is associated with each user in the database.
- There are two types of roles:
  - Admin: Users with the Admin role have access to the Admin UI and various management pages.
  - Consumer: Users are given this role by default and gain access to login, access the betting Pages, and view their historical betting accuracy

---
## Libraries

1. FastAPI is the primary package driving the REST API development
2. Pydantic enables type validation for request and response information in the endpoints
3. Mangum turns the REST API into something that can be served on AWS Lambda
4. python-jose is used for handling JWT for user authentication
5. SQLAlchemy is used to provide ORM functionality for Postgres

## Production

In production, the REST API is hosted on an AWS Lambda function, with a Lambda Function URL configured for access. It's then hooked up to a CloudFront Distribution routed via Route 53 to a custom domain to serve the application over https://api.jyablonski.dev.

- This setup is highly cost-effective, as Lambda allows for thousands of invocations with minimal cost, unlike ECS or EKS, which require payment for EC2 instances.
- But, it introduces a few limitations:
    - The app becomes stateless, which can lead to cold starts
    - Monitoring metrics with Prometheus is not possible in the same way as with traditional server setups.
    - Features like OpenID Connect-based authentication (e.g., “Sign-in with Google”) are much more difficult to implement and maintain context

All request logs are stored in AWS Cloudwatch, and traces are tracked via opentelemetry and sent over to Honeycomb where they can be monitored & alerted on.

## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds a `.ZIP` bundle containing the server's source code and dependencies.
2. Stores the `.ZIP` bundle in S3.
3. Updates the Lambda function with the new bundle.
