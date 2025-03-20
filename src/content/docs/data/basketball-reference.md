---
title: basketball-reference
description: A guide in my new Starlight docs site.
lastUpdated: 2025-03-19
---

This doc walks through basketball-reference as a Data Source for the NBA Project

## Source System

Sports Reference is a popular website that provides a comprehensive database of basketball statistics, analytics, and historical information. For basketball it covers the NBA, WNBA, ABA, college basketball, and international leagues, and it also covers other sports.

The NBA offers an official API which would normally be the preferred way of extracting this data, but the NBA blocks all AWS IP addresses from accessing its API. For this reason, basketball-reference is used to pull all NBA related data.

For the NBA Project, data is scraped from this website once a day at 12pm UTC which is typically after data has been updated & made available for the previous day's games.

## Data Ingestion Process

Web Scraping is used to extract data from the following pages:

1. Daily Boxscores -> https://www.basketball-reference.com/friv/dailyleaders.fcgi?month=03&day=15&year=2025
2. Play-by-Play data -> https://www.basketball-reference.com/boxscores/pbp/202503160CLE.html
3. Transactions -> https://www.basketball-reference.com/leagues/NBA_2025_transactions.html
4. Injuries -> https://www.basketball-reference.com/friv/injuries.fcgi
5. Team Statistics -> https://www.basketball-reference.com/leagues/NBA_2025.html
6. Schedule -> https://www.basketball-reference.com/leagues/NBA_2025_games.html
7. Player Shooting Statistics -> https://www.basketball-reference.com/leagues/NBA_2025_per_game.html

After the data has been pulled, it's stored into Pandas DataFrames and upserted into Postgres in the `nba_source` Schema.

### Source Tables

- `nba_source` Schema
   1. `aws_adv_stats_source` -> Team Advanced Stats
   2. `aws_boxscores_source` -> Boxscore Data
   3. `aws_injury_data_source` -> Injury Data
   4. `aws_pbp_data_source` -> PBP Event Data
   5. `aws_schedule_source` -> Schedule Data
   6. `aws_shooting_stats_source` -> Aggregated Player Shooting Stats
   7. `aws_stats_source` -> Aggregated Player Stats
   8. `aws_transactions_source` -> NBA League Transactions

## Data Quality Considerations

1. Player names have historically been changed by basketball-reference, which caused issues downstream in dbt on joining & grouping boxscore data

    - For example, they started removing suffixes on names such as Robert Williams III -> Robert Williams
    - There's also inconsistencies with how names are stored, such as:
        - [JJ Redick](https://www.basketball-reference.com/players/r/redicjj01.html)
        - [J.J Barea](https://www.basketball-reference.com/players/b/bareajo01.html)
    - Some of this I've tried to cleanup via various [helper functions](https://github.com/jyablonski/nba_elt_ingestion/blob/master/src/utils.py#L167), but it's still something to watchout for
