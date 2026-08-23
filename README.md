# Nyaa-Api-Ts

Unofficial [Nyaa](https://nyaa.si) torrent API. It scrapes public listing and view pages and returns JSON.

Built with TypeScript and [Hono](https://hono.dev/). Runs on Cloudflare Workers or Deno.

## Usage

`username` and `id` are required for `/user/{username}` and `/id/{id}`.

If no query is given on category endpoints such as `/anime` or `/manga`, the latest uploads in that category are returned.

Filters: `f=1` (or `filter=1`) for no remakes, `f=2` (or `filter=2`) for trusted only.

### Query parameters

| Param | Description |
| ----- | ----------- |
| `q` | Search query |
| `s` | Sort field |
| `p` | Page number |
| `f` | Filter (`filter` is accepted as an alias) |
| `o` | Sort order. Defaults to descending |

### Endpoints

| Category | Endpoint |
| -------- | -------- |
| All | `/all` or `/search` |
| Anime | `/anime` |
| Manga | `/manga` |
| Audio | `/audio` |
| Pictures | `/pictures` |
| Live Action | `/live_action` |
| Software | `/software` |
| ID | `/id/{id}` |
| User | `/user/{username}` |

### Sub-categories

Not used by `/user` or `/id`.

| Category | Sub-category |
| -------- | ------------ |
| Anime | `/amv`, `/eng`, `/non-eng`, `/raw` |
| Manga | `/eng`, `/non-eng`, `/raw` |
| Audio | `/lossy`, `/lossless` |
| Pictures | `/photos`, `/graphics` |
| Live Action | `/promo`, `/eng`, `/non-eng`, `/raw` |
| Software | `/application`, `/applications`, `/games` |

### Sorting

| Param | Values |
| ----- | ------ |
| Sort (`s`) | `size`, `seeders`, `leechers`, `date`, `downloads`, `comments` |
| Order (`o`) | `asc`, `desc` |

### Examples

```
/id/{id}

/{category}?q={query}
/{category}?q={query}&s={sort}&p={page}&o={order}&f={filter}

/{category}/{sub_category}?q={query}

/user/{username}
/user/{username}?q={query}&s={sort}&p={page}&o={order}&f={filter}

/search?q={query}
```

Invalid IDs, usernames, and categories return **400**. Missing torrents return **404**. Upstream failures return **502**.

## Development

```bash
npm install
npm run dev
```

```bash
# Deno
deno task start
```

```bash
npm test
npm run typecheck
```

```bash
npm run deploy
```

## License

[Apache 2.0](LICENSE)
