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

export function isKnownSubcategory(
  category: string,
  subcategory: string | undefined
): boolean {
  if (subcategory === undefined || subcategory === "") {
    return true;
  }

  const endpoints = Constants.NyaaEndpoints[category];
  return (
    !!endpoints &&
    Object.prototype.hasOwnProperty.call(endpoints, subcategory)
  );
}

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
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
  const filter = f === 1 || f === 2 ? f : 0;
  const page = Math.min(p > 0 ? p : 1, Constants.MaxPage);

  return {
    query: q,
    page,
    order,
    sort,
    filter,
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

function isViewPage(html: string): boolean {
  return html.includes('id="torrent-description"') || html.includes("Info hash:");
}

function mirrors(): string[] {
  const urls = [Constants.NyaaBaseUrl, Constants.NyaaAltUrl];
  return [...new Set(urls.filter(Boolean))];
}

type OriginAttempt =
  | { kind: "ok"; result: FetchResult }
  | { kind: "not_found" }
  | { kind: "fail"; error: unknown };

async function fetchFromOrigin(
  origin: string,
  path: string,
  signal: AbortSignal
): Promise<OriginAttempt> {
  try {
    const response = await fetch(`${origin}${path}`, {
      headers: {
        "User-Agent": Constants.UserAgent,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal,
    });

    if (response.status === 404) {
      return { kind: "not_found" };
    }

    if (!response.ok) {
      return {
        kind: "fail",
        error: new HttpError(
          502,
          `Upstream returned ${response.status} from ${origin}`
        ),
      };
    }

    const html = await response.text();
    if (isChallengePage(html)) {
      return {
        kind: "fail",
        error: new HttpError(502, `Upstream challenge page from ${origin}`),
      };
    }

    if (path.startsWith("/view/") && !isViewPage(html)) {
      return { kind: "not_found" };
    }

    return { kind: "ok", result: { origin, html, status: response.status } };
  } catch (error) {
    return { kind: "fail", error };
  }
}

export async function fetchNyaa(path: string): Promise<FetchResult> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origins = mirrors();

  if (!origins.length) {
    throw new HttpError(502, "All Nyaa mirrors failed");
  }

  const controllers = origins.map(() => new AbortController());
  const timeout = setTimeout(() => {
    for (const controller of controllers) {
      controller.abort();
    }
  }, Constants.FetchTimeoutMs);

  try {
    return await new Promise<FetchResult>((resolve, reject) => {
      let pending = origins.length;
      let settled = false;
      let sawNotFound = false;
      let lastError: unknown;

      const finishIfComplete = () => {
        if (settled) {
          return;
        }

        pending -= 1;
        if (pending > 0) {
          return;
        }

        settled = true;
        if (sawNotFound) {
          reject(new HttpError(404, "Not Found"));
          return;
        }
        if (lastError instanceof HttpError) {
          reject(lastError);
          return;
        }
        reject(new HttpError(502, "All Nyaa mirrors failed"));
      };

      for (let i = 0; i < origins.length; i += 1) {
        fetchFromOrigin(origins[i], normalizedPath, controllers[i].signal)
          .then((attempt) => {
            if (settled) {
              return;
            }

            if (attempt.kind === "ok") {
              settled = true;
              for (const controller of controllers) {
                controller.abort();
              }
              resolve(attempt.result);
              return;
            }

            if (attempt.kind === "not_found") {
              sawNotFound = true;
            } else {
              lastError = attempt.error;
            }

            finishIfComplete();
          })
          .catch((error) => {
            if (settled) {
              return;
            }
            lastError = error;
            finishIfComplete();
          });
      }
    });
  } finally {
    clearTimeout(timeout);
  }
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
  return "Upstream error";
}
