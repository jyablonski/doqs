---
title: dbt
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-08-01
author: jyablonski
tags: ["nba", "etl", "internal"]
---


The dbt project transforms and enriches source data in the database, creating new tables for use by downstream services and applications for analytics, reporting, and insights.

---

## Architecture

``` mermaid
graph LR

    subgraph PostgresDB[Postgres]
        NBA[Source]
        
        subgraph DBT_Models[dbt]
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

    subgraph Downstream_Consumers[Downstream Consumers]
        MART --> DASH[Dash Frontend Service]
        MART --> API[REST API Service]
    end

    style PostgresDB fill:#89888f,stroke:#444,stroke-width:2px
    style DBT_Models fill:#d6d6d6,stroke:#444,stroke-width:1.5px
    style Downstream_Consumers fill:#f5f5f5,stroke:#444,stroke-width:1.5px

```

### ELT Pipeline Orchestration
``` mermaid
graph LR
    A[Ingestion Script] --> B[dbt]
    B --> C[ML Pipeline]
```

## How It Works

dbt is a tool that allows you to transform raw data into analytics-ready datasets inside a database using SQL, and incorporates best practices such as version control, modularity, testing, and documentation.

In this project dbt enables dozens of different tables to be built by transforming the raw source data provided by the ingestion script to build out enriched datasets that can be served over the REST API & Frontend Dashboard.

All of the data processing can be done in dbt so that the downstream applications just have to do a `select * from table` to grab what they need and display the data to end users.

- This significantly improves the user experience and makes for a snappy, responsive feel across the downstream applications

## Libraries

1. dbt-core is the primary library supporting the data transformation & enrichment modeling process in SQL
2. dbt-postgres is an adapter package that offers support for dbt to work w/ Postgres
3. sqlfluff is used for SQL Linting + Formatting and is automatically setup in a pre-commit hook

## Production

In production, dbt runs as an ECS Task following the completion of the Ingestion Script. It runs `dbt build --target prod` to refresh all datasets, and also produces the Model that's used by the ML Pipeline to generate win predictions.

- The dbt job typically takes about ~2 minutes to complete

As soon as the dbt job is completed, the ML Pipeline is kicked off to generate win predictions for upcoming games that day.

## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

- This test suite builds the entire dbt project in a Postgres container running in Docker that has been bootstrapped w/ dummy source data
- Although there's over 400+ dbt resources getting built, this processs takes < 90 seconds to complete because of the low volume of data

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the Docker Image for the service which has the updated source code & dependencies
2. Pushes the Docker Image to ECR

On the next subsequent NBA ELT Pipeline run, this new Docker Image will be used when the dbt job is scheduled to be ran in ECS
