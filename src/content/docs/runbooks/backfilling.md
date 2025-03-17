---
title: Backfilling
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-17 23:32:49Z
---

This doc goes in detail about performing backfills for the NBA ELT Project

## Data Sources

There are 3 separate entities that involve varying degrees of backfilling

### Ingestion Script

The Boxscore + Play-by-Play data is sometimes not refreshed in time when the Ingestion Script is triggered at 12 pm UTC every day. When this happens, the script will complete successfully and send an alert to Slack that the data was not available

- ![Image](https://github.com/user-attachments/assets/f91a4a91-6325-47e0-b87c-b0cf27cf43ba)

Later in the day, you must manually run the following functions to pull the data and then store the records to SQL afterwards

- `get_boxscores_data`
- `get_pbp_data`
- By default, the boxscores data pulls data from yesterday. Pass in the appropriate parameters to the function if you need to backfill a different date

<details>
<summary>Python Code Example</summary>

``` py
boxscores = get_boxscores_data(feature_flags_df=feature_flags)
pbp_data = get_pbp_data(feature_flags_df=feature_flags, df=boxscores)

with engine.begin() as connection:
    write_to_sql_upsert(
        conn=connection,
        table="aws_boxscores_source",
        schema=source_schema,
        df=boxscores,
        primary_keys=["player", "date"],
    )
    write_to_sql_upsert(
        conn=connection,
        table="aws_pbp_data_source",
        schema=source_schema,
        df=pbp_data,
        primary_keys=[
            "hometeam",
            "awayteam",
            "date",
            "timequarter",
            "numberperiod",
            "descriptionplayvisitor",
            "descriptionplayhome",
        ],
    )
```

</details>

After ingesting the data into the `nba_source` Schema, you'll probably want to go refresh the data in dbt so that the downstream services are serving updated data as well.

### dbt

For backfill purposes, to refresh specific models in the dbt project you can run commands like:

- `dbt build --select fact_boxscores+ fact_pbp_data+ --target prod`
- `dbt build --select fact_schedule_data+ --target prod --full-refresh`
- Adjust this depending on what you want to run based on what data sources were delayed that day

If needed, the entire dbt project can be refreshed with:

- `dbt build --target prod --full-refresh`
- As of March 2025, a full refresh on the entire project takes about ~4 minutes to run

### ML Pipeline

The ML Pipeline pulls data from `ml_models.ml_tonights_games` to generate predictions for upcoming games that night. If there was an issue upstream in the NBA ELT Pipeline that affects this table being refreshed properly, then the ML Pipeline will likely fail and not generate predictions for that day.

After addressing the upstream issue and refreshing this table via dbt, you can run the ML Pipeline with the following command: 

- `python -m src.app` runs the Pipeline as a module and will pull the data, generate the predictions, and upload it back to Postgres in the `ml_models.ml_tonights_games` table

Afterwards, you can verify the data by running the following query:

``` sql
select *
from ml_models.ml_tonights_games
order by game_date desc
limit 100;
```

## Rebooting Downstream Services

The REST API is a stateless service and does not need to be rebooted; it will always pull the latest data available in the `mart` Layer on every request.

However, if you've refreshed the data in the `mart` Layer and want those changes to be reflected in the Dashboard, then run the following script to reboot the ECS Service which will force it to re-pull the data.

``` sh
#!/bin/bash

ECS_CLUSTER="jacobs-ecs-ec2-cluster"
ECS_SERVICE="nba_elt_dashboard"
REGION="us-east-1"

# List tasks
task_list=$(aws ecs list-tasks --cluster $ECS_CLUSTER --service-name $ECS_SERVICE --region $REGION)

# Get first task
first_task=$(echo "$task_list" | jq -r '.taskArns[0]')

# Stop the first task
aws ecs stop-task --cluster $ECS_CLUSTER --task $first_task --region $REGION

```