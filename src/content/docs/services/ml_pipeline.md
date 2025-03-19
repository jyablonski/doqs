---
title: ML Pipeline
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-19
---

The ML Pipeline consists of a Script

## Architecture

### Database Usage
``` mermaid
graph TD
    A[Postgres Database] -->|Reads data| B[ML Pipeline]
    B -->|Writes predictions| A
    A -->|Data used by| C[REST API Service]
    A -->|Data used by| D[Frontend Dashboard]

```

### ELT Pipeline Orchestration
``` mermaid
graph LR
    A[Ingestion Script] --> B[dbt]
    B --> C[ML Pipeline]
```

## ML Model

The ML Model was trained on xyz 76% prediction accuracy. It is saved on a joblib file and stored directly in the Docker Container. Alternatively this could also be stored & pulled in S3 if it were being changed often, but that's not the case.


## Libraries

1. scikit-learn is the primary package behind building the ML Model & creating predictions
2. jyablonski_common_modules provides various functions to read & write data to Postgres

## Production

The ML Pipeline runs as an ECS Task following the completion of the dbt job.

- The ML Pipeline typically takes about ~10 seconds to complete

The NBA ELT Pipeline is fully complete after the ML Pipeline finishes, and there are no further tasks that get ran.

## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the Docker Image for the service which has the updated source code & dependencies
2. Pushes the Docker Image to ECR

On the next subsequent NBA ELT Pipeline run, this new Docker Image will be used when the ML Pipeline is scheduled to be ran in ECS