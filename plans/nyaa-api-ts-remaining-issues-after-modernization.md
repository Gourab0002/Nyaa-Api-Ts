# Remaining Issues in Nyaa-Api-Ts After Modernization

## What Was Fixed
The modernization effort successfully addressed several original issues:
- Migrated from deprecated worktop v0.7 to Hono v4
- Added proper `resolveBaseUrl()` with failover logic (was dead code before)
- Typed `NyaaEndpoints` as `Record<string, Record<string, string>>`
- Added input validation on route parameters via `getCategoryID()`
- Added `safeNumber()` to prevent NaN in scraped numeric data
- Fixed magnet link non-null assertion (now uses `?? null`)
- Added build/dev/deploy scripts to package.json
- Added wrangler as a devDependency
- Updated tsconfig with strict mode and proper settings
- Updated compatibility_date to 2024-02-01
- Added structured error responses with proper HTTP status codes

---

## Issues That Still Exist

### Critical: Hardcoded Base URL in Scrapers

**Files:** `src/scrapers.ts` lines 30-32 and 150-151

The `resolveBaseUrl()` function in utils.ts correctly resolves either `nyaa.si` or `nyaa.land` depending on availability. However, `scrapers.ts` constructs torrent file/link URLs using `Constants.NyaaBaseUrl` directly instead of the resolved URL:

```typescript
// fileInfoScraper - lines 30-32
file: Constants.NyaaBaseUrl + (container.find(...).attr("href") ?? ""),
link: `${Constants.NyaaBaseUrl}/view/${fileId}`,

// scrapeNyaa - lines 150-151
link: Constants.NyaaBaseUrl + torrentPath,
file: Constants.NyaaBaseUrl + filePath,
```

If the primary URL is down and the alt URL is used for fetching, the returned torrent links still point to the unreachable `nyaa.si`. The resolved base URL should be passed into the scraper functions or used from the resolved cache.

---

### Moderate: No URL Encoding for Search Queries

**File:** `src/routes.ts` lines 72-74, 103-106, 147-150

Search queries are inserted into URLs with only space-to-plus replacement but no proper URL encoding:

```typescript
// utils.ts line 56
const q = (url.searchParams.get("q") ?? "").replace(/\s+/g, "+");

// routes.ts line 72
const searchUrl = `${baseUrl}?q=${queryParams.query.trim()}&c=0_0`...
```

Characters like `&`, `=`, `#`, `%` in search terms will break the constructed URL. The query should use `encodeURIComponent()`.

---

### Moderate: No CORS Headers

**File:** `src/routes.ts`

The API sets `Cache-Control` headers but no CORS headers. Any browser-based client trying to call this API will be blocked by the browser's same-origin policy. Hono has built-in CORS middleware that should be added.

---

### Moderate: Module-Level Mutable Cache State

**File:** `src/utils.ts` lines 5-7

```typescript
let cachedBaseUrl: string | null = null;
let cacheExpiry = 0;
```

Module-level mutable state in Cloudflare Workers is unreliable. Workers isolates can be recycled at any time, and there is no guarantee of state persistence between requests. While this cache will work within the same isolate, it provides inconsistent behavior. For a simple HEAD check with a 5-second timeout, caching adds complexity without reliable benefit. Consider either removing the cache or documenting this limitation.

---

### Moderate: Empty File/Link URLs When Elements Are Missing

**Files:** `src/scrapers.ts` lines 30, 142, 151

When cheerio selectors don't match (e.g., if HTML structure changes), the fallback is an empty string:

```typescript
file: Constants.NyaaBaseUrl + (container.find(...).attr("href") ?? ""),
// If attr returns undefined, result is "https://nyaa.si" with no path
```

This produces a URL that just points to the base domain, which is misleading. Should return `null` or an empty string instead of a broken URL.

---

### Minor: cheerio Version is a Release Candidate

**File:** `package.json` line 21

```json
"cheerio": "^1.0.0-rc.12"
```

Cheerio 1.0.0 stable has been released. The project should update to the stable version.

---

### Minor: Fragile Comment Timestamp Selector

**File:** `src/scrapers.ts` line 90

```typescript
timestamp: element.find("a").children().first().text(),
```

This selector for extracting comment timestamps is fragile. Nyaa stores timestamps in `data-timestamp` attributes on elements. If the HTML structure changes slightly, this will return incorrect data. A more robust approach would target the specific `data-timestamp` attribute.

---

### Minor: DefaultProfilePic Hardcoded to Primary Domain

**File:** `src/constants.ts` line 4-5

```typescript
export const DefaultProfilePic = "https://nyaa.si/static/img/avatar/default.png";
```

If the primary domain is down, this URL will also be unreachable. This is a minor consistency issue.

---

## Summary Table

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | Critical | Hardcoded NyaaBaseUrl in scrapers bypasses URL resolution | `src/scrapers.ts` |
| 2 | Moderate | No URL encoding for search query parameters | `src/routes.ts`, `src/utils.ts` |
| 3 | Moderate | No CORS headers for browser clients | `src/routes.ts` |
| 4 | Moderate | Module-level mutable cache is unreliable in Workers | `src/utils.ts` |
| 5 | Moderate | Broken URLs when cheerio selectors return empty | `src/scrapers.ts` |
| 6 | Minor | cheerio is on a release candidate, not stable | `package.json` |
| 7 | Minor | Fragile comment timestamp selector | `src/scrapers.ts` |
| 8 | Minor | DefaultProfilePic hardcoded to primary domain | `src/constants.ts` |

## Recommended Fix Order

1. Pass resolved base URL into scraper functions (critical)
2. Add `encodeURIComponent` for query parameters
3. Add Hono CORS middleware
4. Handle empty selectors gracefully in scrapers
5. Update cheerio to stable release
6. Improve comment timestamp parsing
7. Address minor consistency issues
