---
title: Twitter
description: A guide in my new Starlight docs site.
lastUpdated: 2025-06-14
---

:::caution[Not In Use]
This Data Source is no longer in use as of Q1 2025
:::

This page walks through Twitter as a Data Source for the NBA Project

---

## Source System

Twitter is a social media platform where users post and interact through short messages called tweets. It’s known for being fast-paced and real-time, making it a go-to platform for news, public discussions, and direct communication between people, brands, and organizations.

Twitter is often where sports news breaks first—whether it’s trades, injuries, free agent signings, or coaching changes. Pulling this data and using it as a way to analyze user engagement and is a great way to develop social media trends & insights.

Unfortunately, in June 2023 Elon completely removed the free-tier of the Twitter API, and made major changes to the Basic Plan that they previously offered. This effectively priced out indie developers and open source projects from scraping data via an API.

## Data Ingestion Process

Tweepy was used to authenticate w/ the Twitter API and pull a mix of high engagement tweets from well-known sports journalists, as well as other random NBA-related tweets.

- Before Tweepy, some tweet data was manually scraped off the website and stored into a separate table
- This data was joined together and transformed downstream in dbt

The same Sentiment Analysis process used in the Reddit section was also utilized here to enrich the social media data and identify comments as positive or negative.

### Source Tables

- `nba_source` Schema
    1. `twitter_tweepy_legacy` -> Tweet data pulled via the official Twitter API using the tweepy Package
    2. `twitter_tweets` -> Tweet data which was web scraped directly from raw tweets

## Data Quality Considerations
