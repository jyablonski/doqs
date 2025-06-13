---
title: basketball-reference
description: A guide in my new Starlight docs site.
lastUpdated: 2025-06-13
---

This page walks through basketball-reference as a Data Source for the NBA Project

## Source System

Sports Reference is a renowned website that provides a comprehensive database of statistics, analytics, and historical information across various sports. For the NBA, it includes detailed pages on game logs, play-by-play data, injuries, team transactions, salaries, and more. This serves as the primary data source for all NBA-related information throughout this project.

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
   1. `bbref_player_boxscores` -> Boxscore Data
   2. `bbref_player_injuries` -> Injury Data
   3. `bbref_player_pbp` -> PBP Event Data
   4. `bbref_player_shooting_stats` -> Aggregated Player Shooting Stats
   5. `bbref_player_stats_snapshot` -> Aggregated Player Stats Snapshot
   6. `bbref_league_schedule` -> Schedule Data
   7. `bbref_league_transactions` -> League Transactions such as trades, free agent signings etc
   8. `bbref_team_adv_stats_snapshot` -> Team Advanced Stats Snapshot
   9. `bbref_team_opponent_shooting_stats` -> Team Opponent Shooting Stats

## Data Quality Considerations

1. Player names have historically been changed by basketball-reference, which caused issues downstream in dbt on joining & grouping boxscore data

    - For example, they started removing suffixes on names such as Robert Williams III -> Robert Williams
    - There's also inconsistencies with how names are stored, such as:
        - [JJ Redick](https://www.basketball-reference.com/players/r/redicjj01.html)
        - [J.J Barea](https://www.basketball-reference.com/players/b/bareajo01.html)
    - Some of this I've tried to cleanup via various [helper functions](https://github.com/jyablonski/nba_elt_ingestion/blob/master/src/utils.py#L167), but it's still something to watchout for

2. Boxscore & play-by-play data is sometimes not available at 12 pm UTC when the Ingestion Script runs.

    - In these cases, this data must be manually pulled at a later time once the data is made available, and the downstream dbt models must be refreshed afterwards.