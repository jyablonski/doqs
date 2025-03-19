---
title: Dash Frontend
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-19
---


The Dash frontend service retrieves transformed data from the Postgres database to present charts, graphs, and reports, enabling users to generate insights.

## Architecture

``` mermaid
graph LR
    User[User-Facing Traffic] -->|Request| ALB[Application Load Balancer]
    ALB -->|Response| User
    ALB --> DASH[Dash Frontend Service]
    DASH --> ALB
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

This frontend service is built with Dash, a Python framework for creating dynamic, interactive web applications. It operates as a server running 24/7, hosting pages and displaying interactive charts, graphs, and tables.

Each page has its own dedicated file to manage its content and functionality.

User interactivity is enabled through Callbacks, which track user-selected options and use them to update graphs or plots accordingly. For example:

``` py
@callback(
    Output("schedule-plot", "figure"),
    Input("schedule-plot-selector", "value"),
)
```

Hover labels need to be manually configured for each plot. Here's an example of how to set them up:

``` py
        fig.update_traces(
            hoverlabel=dict(bgcolor="white", font_size=12, font_family="Rockwell"),
            hovertemplate="<b>%{customdata[0]}</b><br>"
            "<b>Wins Differential:</b> %{customdata[1]}<br>"
            "<b>Preseason Over / Under:</b> %{customdata[2]}<br>"
            "<b>Projected Stats:</b> %{customdata[3]}<br>"
            "<b>Status:</b> %{customdata[4]}<br>"
            "<b>Championship Odds:</b> %{customdata[5]}<br>",
        )
        return fig
```

## Libraries

1. dash is the primary package driving the frontend application development
2. Pandas is used to store all data from database to serve throughout various graphs, plots, and tables
3. dash-bootstrap-components is used to provide template objects to build out the UI

## Production

The Dash Frontend is hosted on ECS and runs 24/7. It's connected to an EC2 instance managed by an Auto Scaling Group (ASG), ensuring at least one EC2 instance is always running to support the ECS service. 

This is further connected to an Application Load Balancer (ALB), which is configured with Route 53 to route traffic to the ECS service at https://nbadashboard.jyablonski.dev.

## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the Docker Image for the service which has the updated source code & dependencies
2. Pushes the Docker Image to ECR
3. Restarts the ECS Nodes that run the ECS Service so that they pull & serve the updated Docker Image

- **NOTE** For larger projects a more sophisticated deployment process would be ideal here like blue / green or a rolling deploy, but this process is simply enough to support the low traffic
