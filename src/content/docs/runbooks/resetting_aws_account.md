---
title: Resetting AWS Account
description: A guide in my new Starlight docs site.
lastUpdated: 2025-03-19
---

This doc walks through how to reset the AWS Account used for the NBA Project.

## AWS Reset Guide
NBA ELT Project must be reset once a year to swap to a new AWS Account to exploit free tier ;-)

1. Use the `sql/sql_extracts.py` Script to Save *all* source data from
   1. `nba_source` Schema Tables
   2. `ml_models` Schema Tables
   3. `public` Schema Tables
   4. Specific `nba_prod` Schema Tables
2. Run `terraform destroy` to delete Infra in Old Account
3. Run `aws-nuke -c aws_nuke.yml --no-dry-run` to delete all additional resources in old account
   1. Make sure all fkn s3 buckets are deleted that was a bitch last time
      1. Either run `aws s3 rm s3://aws-cloudtrail-logs-288364792694-bc528206 --recursive` or manually press `Empty` on each bucket.
4. Make new `jyablonski_aws_x@gmail.com` email
5. Make new AWS Account w/ new email
6. Add Root MFA onto new AWS Account
7. Go to `Account` and enable IAM Policy for Billing Acces
8. Create jacob sign-in IAM User and grant it `AdministratorAccess` and `Billing` IAM Policies
9. Add MFA onto jacob sign-in user
10. Create Access / Secret Keys for jacob user
11. Create `jacobs-terraform-user` and grant `AdministratorAccess` Policy
12. Create Access / Secret Keys for Terraform User
13. Update Keys in Terraform Repo & Terraform Cloud
14. Run `terraform apply` to build Infra in New Account
15. Update `jyablonski.dev` Route53 Record to point to provided Google Domain DNS Endpoints
16. Add `jyablonski9@gmail.com` Email Verified Identity in SES
17. Use the `sql/sql_refresh.py` Script to load all necessary source data
18. Update all of the tables to reset the id sequence otherwise all the REST API actions will fail
    1.  NEXT YEAR figure out proper liquibase shit for this part
19. Update GitHub Actions Secrets on the following Repos:
    1.  [nba_elt_ingestion](https://github.com/jyablonski/nba_elt_ingestion)
    2.  [aws_terraform](https://github.com/jyablonski/aws_terraform)
    3.  [nba_elt_dbt](https://github.com/jyablonski/nba_elt_dbt)
    4.  [nba_elt_rest_api](https://github.com/jyablonski/nba_elt_rest_api)
    5.  [nba_elt_mlflow](https://github.com/jyablonski/nba_elt_mlflow)
    6.  [jyablonski_liquibase](https://github.com/jyablonski/jyablonski_liquibase)
20. Re-run CD Pipelines on the 6 Repos to update shit on new infra.


Process took 5 hours in August 2023 - ran into the following issues:
- AWS changed default S3 Permissions between August 2022 and August 2023.  A lot of my buckets didnt work in August 2023 when i tried to create them, something related to ACLs.  This took probably 2 extra hours of bs to figure out and finally get it working.
- Various S3 Buckets in old account didnt get deleted before I deactivated the account; had to rename these buckets in the new account.
- Backfilling the `id` serial tables that the REST API uses was a bitch without liquibase
- Like half the Repos still had Access/Secret Key Auth for CI CD instead of the IAM Role so this took like an extra hour to build that on the fly so it's doing it the right way
- The SQL code needed is now in `project/runbook_code.sql`

## Export SQL Tables

``` sql
from datetime import datetime
import os

from jyablonski_common_modules.sql import sql_connection, write_to_sql
import pandas as pd

engine = sql_connection(
    database=os.environ.get("RDS_DB"),
    schema="nba_source",
    user=os.environ.get("RDS_USER"),
    pw=os.environ.get("RDS_PW"),
    host=os.environ.get("IP"),
)

ml_models_tables = [
    "tonights_games_ml",
]

nba_prod_tables = [
    "feature_flags",
    "feature_flags_audit",
    "incidents",
    "incidents_audit",
    "rest_api_users",
    "rest_api_users_audit",
    "shiny_feature_flags",
    "user_predictions",
    "user_predictions_audit",
]

nba_source_tables = [
    "aws_adv_stats_source",
    "aws_boxscores_source",
    "aws_contracts_source",
    "aws_injury_data_source",
    "aws_odds_source",
    "aws_opp_stats_source",
    "aws_pbp_data_source",
    "aws_player_attributes_source",
    "aws_preseason_odds_source",
    "aws_reddit_comment_data_source",
    "aws_reddit_data_source",
    "aws_schedule_source",
    "aws_shooting_stats_source",
    "aws_stats_source",
    "aws_team_attributes_source",
    "aws_transactions_source",
    "aws_twitter_data_source",
    "aws_twitter_tweepy_data_source",
    "aws_twitter_tweets_source",
    "inactive_dates",
    "staging_seed_player_attributes",
    "staging_seed_team_attributes",
    "staging_seed_top_players",
]

public_tables = [
    "rest_api_users",
    "user_predictions",
]


def store_sql_table(connection, table: str, schema: str):
    todays_date = datetime.now().date()

    try:
        df = pd.read_sql(f"select * from {schema}.{table};", con=connection)
        print(f"Queried {len(df)} Records from {schema}.{table}")

        df.to_parquet(f"sql/tables/{schema}/{table}-{todays_date}.parquet")
        print(
            f"Wrote {schema}.{table} to tables/{schema}/{table}-{todays_date}.parquet"
        )

        pass
    except BaseException as e:
        print(f"Error Occurred while Reading {schema}.{table}, {e}")
        raise e


with engine.connect() as connection:
    for table in ml_models_tables:
        store_sql_table(connection=connection, table=table, schema="ml_models")

    for table in nba_prod_tables:
        store_sql_table(connection=connection, table=table, schema="nba_prod")

    for table in nba_source_tables:
        store_sql_table(connection=connection, table=table, schema="nba_source")

    for table in public_tables:
        store_sql_table(connection=connection, table=table, schema="nba_prod")
```

## Reloading SQL Tables
``` sql
from datetime import datetime
import os

from sqlalchemy.engine import create_engine, Engine
import pandas as pd


def sql_connection(
    database: str,
    schema: str,
    user: str,
    pw: str,
    host: str,
    port: int,
) -> Engine:
    """
    SQL Engine function to define the SQL Driver + connection variables needed to connect to the DB.
    This doesn't actually make the connection, use conn.connect() in a context manager to create 1 re-usable connection

    Args:
        database(str): The Database to connect to

        schema (str): The Schema to connect to

        user (str): The User for the connection

        pw (str): The Password for the connection

        host (str): The Host Endpoint of the Database

        port (int): Database Port

    Returns:
        SQL Engine variable to a specified schema in my PostgreSQL DB
    """
    connection = create_engine(
        f"postgresql+psycopg2://{user}:{pw}@{host}:{port}/{database}",
        # pool_size=0,
        # max_overflow=20,
        connect_args={
            "options": f"-csearch_path={schema}",
        },
        # defining schema to connect to
        echo=False,
    )
    print(f"SQL Engine for schema: {schema} Successful")
    return connection


file_date = "2024-08-08"

engine = sql_connection(
    database=os.environ.get("RDS_DB"),
    schema="nba_source",
    user=os.environ.get("RDS_USER"),
    pw=os.environ.get("RDS_PW"),
    host=os.environ.get("IP"),
    port=17841,
)

ml_tables = [
    "tonights_games_ml",
]

nba_prod_tables = [
    "feature_flags",
    "feature_flags_audit",
    "incidents",
    "incidents_audit",
    "rest_api_users",
    "rest_api_users_audit",
    "shiny_feature_flags",
    "user_predictions",
    "user_predictions_audit",
]

nba_source_tables = [
    "aws_adv_stats_source",
    "aws_boxscores_source",
    "aws_contracts_source",
    "aws_injury_data_source",
    "aws_odds_source",
    "aws_opp_stats_source",
    "aws_pbp_data_source",
    "aws_player_attributes_source",
    "aws_preseason_odds_source",
    "aws_reddit_comment_data_source",
    "aws_reddit_data_source",
    "aws_schedule_source",
    "aws_shooting_stats_source",
    "aws_stats_source",
    "aws_team_attributes_source",
    "aws_transactions_source",
    "aws_twitter_data_source",
    "aws_twitter_tweepy_data_source",
    "aws_twitter_tweets_source",
    "inactive_dates",
    "staging_seed_player_attributes",
    "staging_seed_team_attributes",
    "staging_seed_top_players",
]

public_tables = [
    "rest_api_users",
    "user_predictions",
]


def load_sql_table(connection, table: str, schema: str, date: str):
    df = pd.read_parquet(f"sql/tables/{schema}/{table}-{date}.parquet")

    df.to_sql(
        name=table, con=connection, schema=schema, if_exists="replace", index=False
    )
    print(f"Reading {table}, writing to {schema}.{table}")
    pass


with engine.connect() as connection:
    # for table in ml_tables:
    #     load_sql_table(
    #         connection=connection, table=table, schema="ml", date=file_date
    #     )

    for table in nba_prod_tables:
        load_sql_table(
            connection=connection, table=table, schema="marts", date=file_date
        )

    for table in nba_source_tables:
        load_sql_table(
            connection=connection, table=table, schema="nba_source", date=file_date
        )

    for table in public_tables:
        load_sql_table(
            connection=connection, table=table, schema="public", date=file_date
        )
```