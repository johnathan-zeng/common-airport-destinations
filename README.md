# Airport Destination Comparator

This is a lightweight web tool that compares passenger destinations between two airports entered by ICAO or IATA code. It uses Wikipedia airport pages to identify:

- Common destinations between both airports
- Destinations unique to Airport 1
- Destinations unique to Airport 2
- Results grouped by airline plus an overall summary

## How It Works

1. Enter two airport codes such as `TFU` and `ZUUU`.
2. The app looks up each airport page through the MediaWiki API.
3. It loads the page HTML directly from Wikipedia's parse API.
4. It extracts airline and destination tables, then compares the routes.

## Local Testing

You can run the app locally with any static file server. One simple option is:

```bash
python3 -m http.server 4173
```

Then open:

`http://127.0.0.1:4173`

## Notes

- Wikipedia page structure varies by airport, so some tables may still need airport-specific cleanup in the future.
- The app no longer depends on third-party CORS proxies, which makes local testing and deployment much more reliable.
