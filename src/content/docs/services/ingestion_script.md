---
title: Ingestion Script
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-06-14
---

The Ingestion Script is responsible for all source data ingestion for the NBA ELT Project

---

## Architecture

``` mermaid
graph LR
    subgraph DS[Data Sources]
        A[Basketball-Reference]
        B[DraftKings]
        C[Reddit]
    end

    subgraph DD[Data Destinations]
        DB[Postgres Database]
        S3[S3]
    end

    A --> INGEST[Ingestion Script]
    B --> INGEST
    C --> INGEST
    INGEST --> DB
    INGEST --> S3


```

### ELT Pipeline Orchestration
``` mermaid
graph LR
    A[Ingestion Script] --> B[dbt]
    B --> C[ML Pipeline]
```

## How It Works

The Ingestion Script performs the following tasks:

1. Retrieves feature flags from the database to determine which endpoints to scrape.
2. Scrapes data from the identified endpoints.
3. Stores source data to Postgres
4. Stores source data to S3 for backup purposes
5. Sends any errors or missing data to Slack

A feature flag table in the database is managed to support all different kinds of functionality within the project. Specifically for the Ingestion Script, some of these flags are used to determine which endpoints should be scraped. For example:

- During the offseason, the `is_season` flag should be disabled as there's no more games being played. This disables the boxscore & play-by-play data from being scraped in the script.
- This functionality enables a simple management process for disabling the extraction of this data, or having to do code deploys to comment out various functions during the offseason

## Libraries

1. Pandas is the primary package driving the Ingestion Script development
2. beautifulsoup4 enables web scraping to be performed on various basketball-reference and DraftKings pages
3. praw is used to authenticate to & pull data from the Reddit API
4. nltk provides Sentiment Analysis Functions to be applied on various social media text data
5. jyablonski_common_modules provides various functions to read & write data to Postgres

## Production

The Ingestion Script runs as an ECS Task which is kicked off by an AWS Step Functions Pipeline triggered at 12pm UTC everyday.

- The Ingestion Script typically takes about ~2 minutes to complete

As soon as the script is finished & all ingestion data has been loaded, the dbt job is kicked off to begin the transformation process.

## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request.

- It installs UV & the project dependencies on the GitHub Actions runner
- It uses Docker to spin up a Postgres database w/ bootstrap data
- It then runs the test suite, using the Postgres database to run integration tests
- The UV environment used by the GitHub Actions runners also gets cached for up to 7 days, enabling faster test suite executions

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the Docker Image for the service which has the updated source code & dependencies
2. Pushes the Docker Image to ECR

On the next subsequent NBA ELT Pipeline run, this new Docker Image will be used when the Ingestion Script is scheduled to be ran in ECS
