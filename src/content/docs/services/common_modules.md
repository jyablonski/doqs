---
title: Common Modules
description: A reference page in my new Starlight docs site.
lastUpdated: 2025-03-17 23:32:49Z
---


jyablonski Common Modules is an internal Python library hosted on PyPI that is used throughout various services & applications in the project

## Architecture


## CI / CD

For continuous integration (CI), the entire test suite is run on every commit in a pull request using Docker.

After a PR is merged, the continuous deployment (CD) pipeline performs the following steps:

1. Builds the library and generates platform-specific wheels
2. Publishes the new version and wheels to PyPI
