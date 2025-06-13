---
title: Reddit
description: A guide in my new Starlight docs site.
lastUpdated: 2025-06-13
---

This page walks through Reddit as a Data Source for the NBA Project

## Source System

Reddit is a social media platform and online community where users can post content, share links, and engage in discussions across a wide variety of topics. It’s organized into "subreddits," which are individual forums dedicated to specific interests like news, technology, gaming, fitness, and sports.

For the purposes of this project, data from https://reddit.com/r/nba is scraped to better understand what topics users are engaging with. Both Reddit Posts as well as comments are scraped and stored into separate tables.

- Notably, Users can assign themselves a "Flair" which basically puts a team logo on their username whenever they comment or post in the subreddit
- This flair data can be pulled and used to build out analytics downstream, as its a way of associating Reddit User's with their favorite team

For the NBA Project, this social media data is scraped once a day at 12pm UTC to capture all of the engagement & buzz surrounding yesterday's games.

## Data Ingestion Process

The [praw](https://praw.readthedocs.io/en/stable/) Python Package is used to interact with Reddit's API and extract Reddit posts + comments.

- First, the ~27 most popular Reddit Posts in the last 24 hours are scraped
- Then, **most** of the comments that have received negative or positive upvotes are scraped from those posts
- This process doesn't pull 100% of the comments on these Reddit posts for performance purposes (it takes 10-100x longer to retrieve all these comments, which typically receive few upvotes and don't drive that much engagement)

After pulling the data, the [nltk](https://www.nltk.org/) Python Package is used to conduct Sentiment Analysis on these comments to see whether their tone is positive or negative. These insights are then aggregated up and displayed downstream in the Frontend dashboard.

- This process creates new Sentiment Analysis columns that are stored along every record
- This enables interesting analytics insights to be found when grouping by Flair and by Average Sentiment (such as fanbases getting hyped after a big win, or becoming really negative after a bad loss)

After the data has been pulled & enriched, it's stored into Pandas DataFrames and upserted into Postgres in the `nba_source` Schema.


### Source Tables

- `nba_source` Schema
    1. `reddit_posts` -> Reddit posts
    2. `reddit_comments` -> Reddit comments


## Data Quality Considerations

1. The quality of the Sentiment Analysis provided by nltk isn't perfect. There's potential improvements to be made here to increase the accuracy and validity of these sentiment analysis values.
