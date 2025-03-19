---
title: REST API
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-19
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
