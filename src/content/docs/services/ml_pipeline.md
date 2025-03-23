---
title: ML Pipeline
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-23
---

The ML Pipeline generates win predictions for upcoming games

---
## Architecture

### Database Usage
``` mermaid
graph TD
    A[Postgres Database] -->|Reads data| B[ML Pipeline]
    B -->|Writes predictions| A
    A --> C[REST API Service]
    A --> D[Dash Frontend Service]

```

### ELT Pipeline Orchestration
``` mermaid
graph LR
    A[Ingestion Script] --> B[dbt]
    B --> C[ML Pipeline]
```
---

## How It Works

The ML model is a Logistic Regression classifier trained on data from the 2023-24 season.

- In production, the model achieves around 70-75% accuracy on win predictions.
- The trained model is serialized using `joblib` and stored directly into the container image that runs in production.

> _Note:_  
For more dynamic use cases, the model could be stored in S3 and pulled at runtime. This would allow the pipeline to load updated versions without requiring a container rebuild.

### Features Used:

The following features are pulled for each home & away team in the upcoming games:

1. **Days of Rest** - Measures how many days of rest the team has had before the game.
   
2. **Top Players** - Ordinal ranking (0, 1, 2) which represents whether the team's top players are active or unavailable for the game

3. **Moneyline Odds** - Moneyline odds for the team for the upcoming game

3. **Recent Team Performance** - Team Win % for the last 10 games

4. **Overall Team Performance** - Team Win % for the entire season thus far



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