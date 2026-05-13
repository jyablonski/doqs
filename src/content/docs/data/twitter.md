---
title: Twitter
description: Notes on historical Twitter data ingestion and current platform limitations.
lastUpdated: 2026-05-13
author: jyablonski
tags: ["data-source", "social-media", "deprecated"]
---

:::caution[Not In Use]
This Data Source is no longer in use as of Q1 2025
:::

Twitter was previously used to capture NBA news and engagement signals, but the source is deprecated due to API pricing and access changes.

---

## Source System

Twitter is a social media platform where users post and interact through short messages called tweets. It’s known for being fast-paced and real-time, making it a go-to platform for news, public discussions, and direct communication between people, brands, and organizations.

Twitter is often where sports news breaks first, including trades, injuries, free agent signings, and coaching changes. Pulling this data helped analyze user engagement and develop social media trends and insights.

Unfortunately, in June 2023 Elon completely removed the free-tier of the Twitter API, and made major changes to the Basic Plan that they previously offered. This effectively priced out indie developers and open source projects from scraping data via an API.

## Data Ingestion Process

Tweepy was used to authenticate with the Twitter API and pull a mix of high-engagement tweets from well-known sports journalists, as well as other NBA-related tweets.

- Before Tweepy, some tweet data was manually scraped off the website and stored into a separate table
- This data was joined together and transformed downstream in dbt

The same Sentiment Analysis process used in the Reddit section was also utilized here to enrich the social media data and identify comments as positive or negative.

### Source Tables

- `bronze` Schema
  1. `twitter_tweepy_legacy` -> Tweet data pulled via the official Twitter API using the tweepy Package
  2. `twitter_tweets` -> Tweet data which was web scraped directly from raw tweets

## Data Quality Considerations
