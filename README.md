# Nyaa API

An unofficial API for [nyaa.si](https://nyaa.si) that scrapes torrent listings and returns clean JSON. Built with TypeScript, runs anywhere.

## Quick Start

```bash
npm install
npm run dev
# http://localhost:3000
```

## API

### Search torrents

```
GET /search?q=one+piece&s=seeders&o=desc
```

### Get torrent by ID

```
GET /id/1234567
```

### Browse by category

```
GET /anime
GET /anime/eng
GET /manga/raw
```

### Get user uploads

```
GET /user/subsplease
GET /user/subsplease?q=naruto&s=date&o=desc
```

### Query parameters

All list endpoints accept these:

| Param | Description | Example |
|-------|-------------|---------|
| `q` | Search query | `q=one+piece` |
| `p` | Page number | `p=2` |
| `s` | Sort by: `date`, `seeders`, `leechers`, `size`, `downloads` | `s=seeders` |
| `o` | Order: `asc` or `desc` | `o=desc` |
| `f` | Filter: `0` (none), `1` (no remakes), `2` (trusted only) | `f=2` |

### Categories

| Category | Subcategories |
|----------|--------------|
| `all` | - |
| `anime` | `amv`, `eng`, `non-eng`, `raw` |
| `audio` | `lossless`, `lossy` |
| `manga` | `eng`, `non-eng`, `raw` |
| `live_action` | `eng`, `promo`, `non-eng`, `raw` |
| `pictures` | `graphics`, `photos` |
| `software` | `applications`, `games` |

## Deploy

**Cloudflare Workers:**
```bash
npm run deploy
```

**Deno:**
```bash
deno run --allow-net src/index.ts
```

**Bun:**
```bash
bun run src/index.ts
```

## What changed from v1

This is a complete rewrite of the original codebase. Here's what's different:

**Framework:** Replaced the deprecated `worktop` (v0.7, unmaintained) with [Hono](https://hono.dev/) -- a modern, lightweight router that works on Cloudflare Workers, Deno, Bun, and Node.js.

**Actually works now:** The old version hardcoded a dead mirror URL (`nyaa.smartass08.xyz`) as the base URL. It also had a `checkNyaaUrl()` function to handle failover, but it was never called anywhere. Now `resolveBaseUrl()` is called on every request, checks if nyaa.si is up, and falls back automatically. Results are cached for 5 minutes to avoid hammering the upstream.

**Won't crash on bad HTML:** The scrapers used to do things like `torrentPath.split("/")[2]` on potentially undefined values, and `Number(undefined)` would produce `NaN` in responses. Now all scraped values have null checks, fallback defaults, and a `safeNumber()` helper that returns `0` instead of `NaN`.

**Type safety:** `NyaaEndpoints` was typed as `Object` (no index signature), and `tsconfig.json` had `strict` off. Now everything is properly typed with `strict: true` and `noUncheckedIndexedAccess`.

**Input validation:** Invalid categories return a `400` with a message like `Category "invalid" is not valid` instead of silently crashing. Torrent IDs are validated as numeric.

**Error responses:** Instead of every error returning a bare `404 "Not Found"` string, errors now return structured JSON with appropriate status codes (400, 404, 500) and descriptive messages. Server errors are logged to `console.error`.

**New features:**
- `GET /search` endpoint for cross-category search
- Pagination info (`currentPage`, `hasNextPage`) in all list responses
- `Cache-Control` headers for CDN/browser caching
- 10-second timeout on all upstream requests (prevents hanging)
- Root endpoint shows available endpoints and valid categories

**Developer experience:**
- Added `dev`, `deploy`, and `typecheck` npm scripts (previously empty)
- Added `wrangler` to devDependencies (was missing)
- Updated TypeScript to v5, added `@cloudflare/workers-types`
- Updated `compatibility_date` in `wrangler.toml` from 2022 to 2024

## Tech Stack

- [Hono](https://hono.dev/) -- web framework
- [Cheerio](https://cheerio.js.org/) -- HTML scraping
- TypeScript (strict mode)

## License

ISC
