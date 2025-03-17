---
title: DraftKings
description: A guide in my new Starlight docs site.
lastUpdated: 2025-03-17 23:32:49Z
---

This doc walks through DraftKings as a Data Source for the NBA Project

## Source System

DraftKings is a digital sports entertainment and gaming company that offers daily fantasy sports as well as a sportsbook platform. 

- Their gambling odds are made available on a public site called https://covers.com, which is where this data is scraped for this project

- **NOTE** The time of day in which the data is scraped is important, as during the games their content changes significantly and the odds turn into live odds
- Live odds, parlays, and total point over / under thresholds are **not** scraped in this project
- Moneyline odds and the spread for each home & away team are scraped & stored 

For the NBA Project, data is scraped from this website once a day at 12pm UTC which is after gambling data has been updated & made available for that night's upcoming games.

- **NOTE** These odds can change throughout the data, but for this project they're only scraped and stored once

## Data Ingestion Process

Web Scraping is used to extract data from the following pages:

1. Daily Odds -> https://www.covers.com/sport/basketball/nba/odds

After the data has been pulled, it's stored into Pandas DataFrames and upserted into Postgres in the `nba_source` Schema.

### Source Tables

- `nba_source` Schema
    1. `aws_odds_source`


## Data Quality Considerations