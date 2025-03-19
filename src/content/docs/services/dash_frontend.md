---
title: Dash Frontend
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-19
---


The Dash frontend service retrieves transformed data from the Postgres database to present charts, graphs, and reports, enabling users to generate insights.

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

## How It Works

Dash is a Python Library used to develop user-interactive web apps.

## Libraries

1. dash is the primary package driving the frontend application development
2. Pandas is used to store all data from database to serve throughout various graphs, plots, and tables
3. dash-bootstrap-components is used to provide template objects to build out the UI

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
