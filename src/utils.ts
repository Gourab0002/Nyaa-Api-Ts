import * as Constants from "./constants";
import type { QueryParams } from "./models";

/**
 * Checks if nyaa.si is reachable. Falls back to the alt URL.
 * Results are cached per-request (call once at app level if needed).
 */
export async function resolveBaseUrl(): Promise<string> {
  try {
    const resp = await fetch(Constants.NyaaBaseUrl, { method: "HEAD" });
    if (resp.ok) {
      return Constants.NyaaBaseUrl;
    }
    return Constants.NyaaAltUrl;
  } catch {
    return Constants.NyaaAltUrl;
  }
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
