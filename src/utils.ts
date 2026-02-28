import * as Constants from "./constants";
import type { QueryParams } from "./models";

/** Cached base URL and its expiry timestamp */
let cachedBaseUrl: string | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Default timeout for upstream fetch calls (ms) */
export const FETCH_TIMEOUT_MS = 10_000;

/**
 * Resolves the best available Nyaa base URL.
 * Caches the result for 5 minutes to avoid repeated HEAD requests.
 */
export async function resolveBaseUrl(): Promise<string> {
  const now = Date.now();
  if (cachedBaseUrl && now < cacheExpiry) {
    return cachedBaseUrl;
  }

  try {
    const resp = await fetch(Constants.NyaaBaseUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    cachedBaseUrl = resp.ok ? Constants.NyaaBaseUrl : Constants.NyaaAltUrl;
  } catch {
    cachedBaseUrl = Constants.NyaaAltUrl;
  }

  cacheExpiry = now + CACHE_TTL_MS;
  return cachedBaseUrl;
}

/**
 * Resolves a category + subcategory pair to a Nyaa category ID string (e.g. "1_2").
 * Returns null if the category/subcategory combination is invalid.
 */
export function getCategoryID(
  category: string,
  subcategory: string | undefined
): string | null {
  const cat = Constants.NyaaEndpoints[category];
  if (!cat) return null;

  const sub = subcategory ?? "all";
  const id = cat[sub];
  return id ?? null;
}

/**
 * Extracts and normalizes search query parameters from a request URL.
 */
export function getSearchParameters(url: URL): QueryParams {
  const q = (url.searchParams.get("q") ?? "").replace(/\s+/g, "+");
  const p = Number(url.searchParams.get("p")) || 1;
  const o = url.searchParams.get("o") ?? "";
  const f = Number(url.searchParams.get("f")) || 0;
  let s = url.searchParams.get("s") ?? "";

  // Nyaa uses "id" internally for date sorting
  if (s === "date") {
    s = "id";
  }

  return { query: q, page: p, order: o, sort: s, filter: f };
}
