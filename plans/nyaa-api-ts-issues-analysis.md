# Issues Found in Nyaa-Api-Ts

## Overview

This is a Cloudflare Workers-based web scraper API for nyaa.si, built with TypeScript, worktop (a Cloudflare Workers router), and cheerio for HTML parsing. After reviewing all source files, here are the issues identified, grouped by severity.

---

## Critical Issues

### 1. Outdated and Deprecated Framework (worktop v0.7)

The project uses `worktop@0.7.3`, which targets an older Cloudflare Workers API. The `listen()` function and the `Router` class from worktop v0.7 are deprecated. Modern Cloudflare Workers use the ES module format with `export default { fetch }` rather than `addEventListener('fetch', ...)` which `listen()` wraps. This may fail to deploy on current Cloudflare Workers runtimes.

**File:** `src/index.ts` line 19, `package.json` line 17

### 2. Hardcoded Alternative URL is Likely Dead

`Constants.NyaaAltUrl` is set to `https://nyaa.smartass08.xyz` -- a third-party mirror that is almost certainly offline. The `routes.ts` hardcodes `baseUrl = Constants.NyaaAltUrl` instead of using the primary `NyaaBaseUrl` (`https://nyaa.si`), meaning the API will always hit the mirror, not the real site.

**File:** `src/routes.ts` line 6, `src/constants.ts` line 3

### 3. `checkNyaaUrl()` is Defined but Never Called

There is a utility function `checkNyaaUrl()` in `utils.ts` that checks whether `nyaa.si` is reachable and falls back to the alt URL. However, this function is never invoked anywhere in the codebase. The routes just hardcode the alt URL. This means the failover logic is dead code.

**File:** `src/utils.ts` lines 5-20

---

## Moderate Issues

### 4. No Error Handling for Scraping Failures

In `scrapers.ts`, when `fetch()` returns status 200, the code assumes the HTML structure matches expectations. If nyaa.si changes its HTML layout, cheerio selectors will silently return `undefined` or empty strings. There is no validation of scraped data, and `Number(undefined)` produces `NaN` which gets sent to the client.

For example, `torrentPath.split("/")[2]` at line 121 will throw if `torrentPath` is `undefined`.

**File:** `src/scrapers.ts` lines 117-121

### 5. `NyaaEndpoints` Typed as `Object`

`Constants.NyaaEndpoints` is typed as `Object`, which removes all type safety. Accessing it with `Constants.NyaaEndpoints[c]["all"]` in `getCategoryID()` will cause TypeScript errors because `Object` doesn't have an index signature. This should be typed as `Record<string, Record<string, string>>` or a more specific type.

**File:** `src/constants.ts` line 7, `src/utils.ts` line 24

### 6. No Input Validation on Route Parameters

`getCategoryID()` does no validation on the `c` and `s` parameters. If a user requests `/invalidcategory`, it will try `Constants.NyaaEndpoints["invalidcategory"]["all"]` which is `undefined`, causing a runtime error. The catch block in the route handler will swallow this as a generic 404, hiding the real problem.

**File:** `src/utils.ts` lines 22-28, `src/routes.ts` lines 39-55

### 7. Non-null Assertion on Magnet Link

In `fileInfoScraper`, the magnet link uses `!` (non-null assertion): `.attr("href")!`. If the element is missing, this will pass `undefined` through, violating the `string` type and potentially causing downstream issues.

**File:** `src/scrapers.ts` line 23

---

## Minor Issues

### 8. No Build Scripts in package.json

`package.json` has `"scripts": {}` -- completely empty. There are no build, dev, deploy, or test scripts. Developers have to know to use `wrangler dev` or `wrangler publish` manually.

**File:** `package.json` line 6

### 9. Missing wrangler Dependency

The project uses `wrangler.toml` for Cloudflare Workers deployment, but `wrangler` is not listed in `devDependencies`. The developer must have it installed globally.

**File:** `package.json` lines 10-13

### 10. Outdated TypeScript and Node Types

TypeScript `4.9.4` and `@types/node@18.x` are quite old. Newer versions have better type narrowing, performance, and support for modern JS features.

**File:** `package.json` lines 11-12

### 11. `tsconfig.json` is Minimal

The TypeScript config only specifies `allowJs`, `rootDir`, and a single `lib` entry (`ES2021.String`). It is missing important settings like `strict`, `target`, `module`, `moduleResolution`, `esModuleInterop`, and `outDir`. This means TypeScript is running in its most permissive mode with minimal type checking.

**File:** `tsconfig.json`

### 12. `DefaultProfilePic` Points to a Different Repository

The default profile picture URL references `Yash-Garg/Nyaa-Api-Go` (a Go version of this project), not the current repository. If that repo is deleted or the file is moved, the link breaks.

**File:** `src/constants.ts` line 4-5

### 13. `compatibility_date` in wrangler.toml is Old

Set to `2022-09-11`, which means the worker uses behavior from that date. Updating this would allow access to newer Workers features and bug fixes.

**File:** `wrangler.toml` line 2

### 14. Generic Error Responses

All route handlers catch errors and return `res.send(404, "Not Found")`. This hides whether the issue is a bad request, a server error, or a network problem. There is no logging of the caught error either.

**File:** `src/routes.ts` lines 19-21, 34-36, 52-54

---

## Summary Table

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | Critical | Deprecated worktop v0.7 framework | `package.json`, `src/index.ts` |
| 2 | Critical | Hardcoded dead alt URL as base | `src/routes.ts`, `src/constants.ts` |
| 3 | Critical | `checkNyaaUrl()` never called | `src/utils.ts` |
| 4 | Moderate | No validation of scraped data | `src/scrapers.ts` |
| 5 | Moderate | `NyaaEndpoints` typed as `Object` | `src/constants.ts` |
| 6 | Moderate | No input validation on route params | `src/utils.ts`, `src/routes.ts` |
| 7 | Moderate | Non-null assertion on magnet link | `src/scrapers.ts` |
| 8 | Minor | No build scripts | `package.json` |
| 9 | Minor | Missing wrangler dependency | `package.json` |
| 10 | Minor | Outdated TypeScript version | `package.json` |
| 11 | Minor | Minimal tsconfig | `tsconfig.json` |
| 12 | Minor | External profile pic URL | `src/constants.ts` |
| 13 | Minor | Old compatibility date | `wrangler.toml` |
| 14 | Minor | Generic error responses | `src/routes.ts` |
