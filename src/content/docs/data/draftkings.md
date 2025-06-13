---
title: DraftKings
description: A guide in my new Starlight docs site.
lastUpdated: 2025-06-13
---

This page walks through DraftKings as a Data Source for the NBA Project

## Source System

DraftKings is a digital sports entertainment and gaming company that offers daily fantasy sports as well as a sportsbook platform. 

- Their gambling odds are made available on a public site called https://covers.com, which is where this data is scraped for this project
- Live odds, parlays, and total point over / under thresholds are **not** scraped in this project
- Moneyline odds and the spread for each home & away team are scraped & stored 

> _Note:_ 
The time of day in which the data is scraped is important, as during the games their content changes significantly and the odds turn into live odds

For the NBA Project, data is scraped from this website once a day at 12pm UTC which is after gambling data has been updated & made available for that night's upcoming games.

## Data Ingestion Process

Web Scraping is used to extract data from the following pages:

1. Daily Odds -> https://www.covers.com/sport/basketball/nba/odds

After the data has been pulled, it's stored into Pandas DataFrames and upserted into Postgres in the `nba_source` Schema.

### Source Tables

- `nba_source` Schema
    1. `draftkings_game_odds`


## Data Quality Considerations

1. Because data is only pulled once a day, there can be inconsistencies with the metrics being pulled vs when the game is played ~10-12 hours later
    - These are typically only minor differences
    - However, if star players are downgraded from day-to-day to out before the game, then the lines can have more dramatic shifts
    - A separate Script or Lambda could be setup to re-pull & upsert the odds data on an hourly basis, but then the downstream dbt models would also have to be rebuilt on the same cadence. The Frontend dashboard would also have to re-sync this data, so this process introduces a fair amount of complexity.