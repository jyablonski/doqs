---
title: Dash Frontend
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-07-26
---


The Dash frontend service retrieves transformed data from the Postgres database to present charts, graphs, and reports, enabling users to generate insights.

---

## Architecture

``` mermaid
graph LR
    User[User] -->|DNS Lookup| R53[Route 53]
    R53 -->|Resolves To| GCPVM[GCP VM External IP]
    GCPVM -->|HTTP Request| DASH[Dashboard Service]
    DASH -->DB[Postgres Database]
    DB --> DASH
    DASH -->|HTTP Response| GCPVM
    GCPVM -->|Response| User

    subgraph Infra[Infrastructure]
        R53
        subgraph GoogleCloud[GCP]
            GCPVM
            DASH
        end
        DB
    end

    style Infra fill:#89888f,stroke:#444444,stroke-width:2px

```

## How It Works

This frontend service is built with Dash, a Python framework for creating dynamic, interactive web applications. It operates as a server running 24/7, hosting pages and displaying interactive charts, graphs, and tables.

Each page has its own dedicated file to manage its content and functionality.

User interactivity is enabled through Callbacks, which track user-selected options and uses them to update graphs or plots accordingly. For example:

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
3. dash-bootstrap-components is used to provide components to build out the UI

## Production

The Dash Frontend is hosted in GCP on a forever free-tier VM which runs the service 24/7

- This allows for a $0 / month hosting solution for the service
- This was previously hosted on AWS using an ECS service with an EC2 Auto Scaling Group behind an Application Load Balancer, but IPv4 changes have increased the cost to around $15 per month which is too expensive for long-term hosting

Route 53 maps the https://nbadashboard.jyablonski.dev subdomain to the GCP VM's external IP, allowing the dashboard to be accessed via a custom domain across cloud environments.

## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the Docker Image for the service which has the updated source code & dependencies
2. Pushes the Docker Image to ECR
3. SSHs into the GCP VM to pull the new changes and restart the service

> _Note:_  
For larger projects a more sophisticated deployment process would be ideal here like blue / green or a rolling deploy, but because this service only runs on a single VM this is simple enough to support the project