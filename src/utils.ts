import { Context } from "hono";
import { Constants } from "./constants.ts";
import { HttpError } from "./models.ts";
import type { ErrorStatus, FetchResult, QueryParams } from "./models.ts";

export function isValidId(id: string): boolean {
  return /^\d+$/.test(id);
}

export function isValidUsername(username: string): boolean {
  return /^[A-Za-z0-9_\-]{1,32}$/.test(username);
}

export function isKnownCategory(category: string): boolean {
  return Object.prototype.hasOwnProperty.call(Constants.NyaaEndpoints, category);
}

export function getCategoryID(c: string, s: string | undefined): string {
  const endpoints = Constants.NyaaEndpoints;
  const category = endpoints[c];

  if (!category) {
    return "0_0";
  }

  if (s === undefined || s === "") {
    return category["all"] ?? "0_0";
  }

  return category[s] ?? category["all"] ?? "0_0";
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function getSearchParameters(c: Context): QueryParams {
  const q = c.req.query("q") ?? "";
  const p = parsePositiveInt(c.req.query("p"), 1);
  const rawFilter = c.req.query("f") ?? c.req.query("filter");
  const f = parsePositiveInt(rawFilter, 0);
  const oRaw = (c.req.query("o") ?? "").toLowerCase();
  let s = c.req.query("s") ?? "";

  if (s === "date") {
    s = "id";
  }

  const order = Constants.ValidOrders.has(oRaw) ? oRaw : "";
  const sort = Constants.ValidSorts.has(s) ? s : "";

  return {
    query: q,
    page: p > 0 ? p : 1,
    order,
    sort,
    filter: f,
  };
}

export function buildSearchQuery(
  queryParams: QueryParams,
  extras: Record<string, string> = {}
): string {
  const params = new URLSearchParams();

  if (queryParams.query) {
    params.set("q", queryParams.query);
  }

  if (extras.c) {
    params.set("c", extras.c);
  }

  if (queryParams.page > 0) {
    params.set("p", String(queryParams.page));
  }

  if (queryParams.sort) {
    params.set("s", queryParams.sort);
  }

  if (queryParams.order) {
    params.set("o", queryParams.order);
  }

  params.set("f", String(queryParams.filter));

  for (const [key, value] of Object.entries(extras)) {
    if (key !== "c") {
      params.set(key, value);
    }
  }

  return params.toString();
}

export function resolveUrl(origin: string, href: string | undefined): string {
  if (!href) {
    return "";
  }

  if (
    href.startsWith("magnet:") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("data:")
  ) {
    return href;
  }

  try {
    return new URL(href, origin).toString();
  } catch {
    return href;
  }
}

export function toCount(value: string): number {
  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function extractViewId(href: string | undefined): number {
  if (!href) {
    return 0;
  }

  const match = href.match(/\/view\/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function isChallengePage(html: string): boolean {
  return html.includes("<title>Just a moment...</title>");
}

function mirrors(): string[] {
  const urls = [Constants.NyaaBaseUrl, Constants.NyaaAltUrl];
  return [...new Set(urls.filter(Boolean))];
}

export async function fetchNyaa(path: string): Promise<FetchResult> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let lastError: unknown;

  for (const origin of mirrors()) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Constants.FetchTimeoutMs
    );

    try {
      const response = await fetch(`${origin}${normalizedPath}`, {
        headers: {
          "User-Agent": Constants.UserAgent,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      if (response.status === 404) {
        throw new HttpError(404, "Not Found");
      }

      if (!response.ok) {
        lastError = new HttpError(
          502,
          `Upstream returned ${response.status} from ${origin}`
        );
        continue;
      }

      const html = await response.text();
      if (isChallengePage(html)) {
        lastError = new HttpError(
          502,
          `Upstream challenge page from ${origin}`
        );
        continue;
      }

      return { origin, html, status: response.status };
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        throw error;
      }
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (lastError instanceof HttpError) {
    throw lastError;
  }

  throw new HttpError(502, "All Nyaa mirrors failed");
}

export function errorStatus(error: unknown): ErrorStatus {
  if (error instanceof HttpError) {
    return error.status;
  }
  return 502;
}

export function errorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    return error.message;
  }
  if (error instanceof Error && error.name === "AbortError") {
    return "Upstream timeout";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Upstream error";
}
