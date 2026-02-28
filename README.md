# Nyaa API (TypeScript)

A lightweight web scraper API for [nyaa.si](https://nyaa.si), built with [Hono](https://hono.dev/) and [Cheerio](https://cheerio.js.org/). Runs on Cloudflare Workers, Deno, Bun, or Node.js.

## Endpoints

### `GET /`

Health check and API info. Returns available endpoints and valid categories.

### `GET /id/:id`

Get detailed info for a specific torrent by its numeric ID.

**Example:** `GET /id/1234567`

**Response:** Torrent details including title, magnet link, file links, seeders/leechers, comments, description, and info hash.

### `GET /search`

Search across all categories.

| Parameter | Type   | Default | Description                                      |
|-----------|--------|---------|--------------------------------------------------|
| `q`       | string | `""`    | Search query                                     |
| `p`       | number | `1`     | Page number                                      |
| `s`       | string | `""`    | Sort by: `date`, `seeders`, `leechers`, `size`, `downloads` |
| `o`       | string | `""`    | Order: `asc` or `desc`                           |
| `f`       | number | `0`     | Filter: `0` (none), `1` (no remakes), `2` (trusted only) |

**Example:** `GET /search?q=one+piece&s=seeders&o=desc&p=1`

### `GET /user/:username`

Get uploads by a specific user. Supports the same query parameters as `/search`.

**Example:** `GET /user/subsplease?q=&s=date&o=desc`

### `GET /:category`

Browse a top-level category. Returns all subcategories.

**Valid categories:** `all`, `anime`, `audio`, `manga`, `live_action`, `pictures`, `software`

**Example:** `GET /anime?s=date&o=desc`

### `GET /:category/:subcategory`

Browse a specific subcategory.

| Category      | Subcategories                          |
|---------------|----------------------------------------|
| `anime`       | `amv`, `eng`, `non-eng`, `raw`         |
| `audio`       | `lossless`, `lossy`                    |
| `manga`       | `eng`, `non-eng`, `raw`               |
| `live_action`  | `eng`, `promo`, `non-eng`, `raw`      |
| `pictures`    | `graphics`, `photos`                   |
| `software`    | `applications`, `games`                |

**Example:** `GET /anime/eng?q=naruto&p=2`

## Response Format

### Torrent List (search, category, user endpoints)

```json
{
  "torrents": [
    {
      "id": 1234567,
      "title": "Example Torrent",
      "category": "Anime - English-translated",
      "uploaded": "2024-01-15 12:00",
      "seeders": 150,
      "leechers": 10,
      "completed": 5000,
      "size": "1.4 GiB",
      "file": "https://nyaa.si/download/1234567.torrent",
      "link": "https://nyaa.si/view/1234567",
      "magnet": "magnet:?xt=urn:btih:..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "hasNextPage": true
  }
}
```

### Torrent Detail (`/id/:id`)

```json
{
  "torrent": { ... },
  "description": "Full torrent description text",
  "submittedBy": "username",
  "infoHash": "abc123...",
  "commentInfo": {
    "count": 5,
    "comments": [
      {
        "name": "user123",
        "content": "Thanks for the upload!",
        "image": "https://nyaa.si/static/img/avatar/default.png",
        "timestamp": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

### Error Response

```json
{
  "error": "Bad Request",
  "message": "Category \"invalid\" is not valid"
}
```

## Deployment

### Cloudflare Workers

```bash
npm install
npm run deploy
```

### Deno

```bash
deno run --allow-net src/index.ts
```

### Local Development

```bash
npm install
npm run dev
# API available at http://localhost:3000
```

## Tech Stack

- **[Hono](https://hono.dev/)** - Lightweight, multi-runtime web framework
- **[Cheerio](https://cheerio.js.org/)** - HTML parsing and scraping
- **TypeScript** - Strict mode enabled

## License

ISC
