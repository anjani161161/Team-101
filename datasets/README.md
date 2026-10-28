# Datasets

The current application retrieves USGS, GDACS, and Open-Meteo data on demand through API provider adapters. It does not bundle bulk data or historical event files. `catalog.json` describes configured sources, credentials, and limitations. Educational content is curated source-linked material under `apps/api/src/data/curriculum.js`, not incident data. NASA FIRMS is catalogued but requires an operator-provided API key before it can be enabled.
