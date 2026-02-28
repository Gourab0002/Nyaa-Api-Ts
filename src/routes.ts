import { Hono } from "hono";
import { cors } from "hono/cors";
import * as Scrapers from "./scrapers";
import * as Utils from "./utils";
import * as Constants from "./constants";
import type { ApiError } from "./models";

const app = new Hono();

/** Enable CORS for all origins so browser clients can use the API */
app.use("*", cors());

/** Default cache duration for responses (5 minutes) */
const CACHE_MAX_AGE = 300;

/** Sets standard cache headers on the response */
function setCacheHeaders(c: { header: (name: string, value: string) => void }) {
  c.header("Cache-Control", `public, max-age=${CACHE_MAX_AGE}`);
}

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Nyaa API v2",
    endpoints: {
      ping: "GET /",
      torrentById: "GET /id/:id",
      userUploads: "GET /user/:username",
      search: "GET /search?q=query&p=1&s=seeders&o=desc&f=0",
      category: "GET /:category",
      categoryWithSub: "GET /:category/:subcategory",
    },
    categories: Constants.ValidCategories,
  });
});

app.get("/id/:id", async (c) => {
  const id = c.req.param("id");

  if (!/^\d+$/.test(id)) {
    return c.json<ApiError>(
      { error: "Bad Request", message: "ID must be a number" },
      400
    );
  }

  try {
    const baseUrl = await Utils.resolveBaseUrl();
    const searchUrl = `${baseUrl}/view/${id}`;
    const result = await Scrapers.fileInfoScraper(searchUrl, baseUrl);

    if (!result) {
      return c.json<ApiError>(
        { error: "Not Found", message: `Torrent with ID ${id} not found` },
        404
      );
    }

    setCacheHeaders(c);
    return c.json(result);
  } catch (error) {
    console.error("Error fetching torrent info:", error);
    return c.json<ApiError>(
      { error: "Internal Server Error", message: "Failed to fetch torrent info" },
      500
    );
  }
});

app.get("/search", async (c) => {
  try {
    const baseUrl = await Utils.resolveBaseUrl();
    const queryParams = Utils.getSearchParameters(new URL(c.req.url));

    const searchUrl =
      `${baseUrl}?q=${encodeURIComponent(queryParams.query.trim())}&c=0_0` +
      `&p=${queryParams.page}&s=${encodeURIComponent(queryParams.sort)}` +
      `&o=${encodeURIComponent(queryParams.order)}&f=${queryParams.filter}`;

    const result = await Scrapers.scrapeNyaa(searchUrl, queryParams.page, baseUrl);

    if (!result) {
      return c.json<ApiError>(
        { error: "Not Found", message: "No results found" },
        404
      );
    }

    setCacheHeaders(c);
    return c.json(result);
  } catch (error) {
    console.error("Error searching torrents:", error);
    return c.json<ApiError>(
      { error: "Internal Server Error", message: "Failed to search torrents" },
      500
    );
  }
});

app.get("/user/:username", async (c) => {
  const username = c.req.param("username");

  try {
    const baseUrl = await Utils.resolveBaseUrl();
    const queryParams = Utils.getSearchParameters(new URL(c.req.url));

    const searchUrl =
      `${baseUrl}/user/${encodeURIComponent(username)}` +
      `?q=${encodeURIComponent(queryParams.query.trim())}&p=${queryParams.page}` +
      `&s=${encodeURIComponent(queryParams.sort)}&o=${encodeURIComponent(queryParams.order)}&f=${queryParams.filter}`;

    const result = await Scrapers.scrapeNyaa(searchUrl, queryParams.page, baseUrl);

    if (!result) {
      return c.json<ApiError>(
        { error: "Not Found", message: `User "${username}" not found or has no uploads` },
        404
      );
    }

    setCacheHeaders(c);
    return c.json(result);
  } catch (error) {
    console.error("Error fetching user uploads:", error);
    return c.json<ApiError>(
      { error: "Internal Server Error", message: "Failed to fetch user uploads" },
      500
    );
  }
});

app.get("/:category/:subcategory?", async (c) => {
  const cat = c.req.param("category");
  const subCat = c.req.param("subcategory");

  const category = Utils.getCategoryID(cat, subCat);
  if (!category) {
    const detail = subCat
      ? `Category "${cat}/${subCat}" is not valid`
      : `Category "${cat}" is not valid`;
    return c.json<ApiError>(
      { error: "Bad Request", message: detail },
      400
    );
  }

  try {
    const baseUrl = await Utils.resolveBaseUrl();
    const queryParams = Utils.getSearchParameters(new URL(c.req.url));

    const searchUrl =
      `${baseUrl}?q=${encodeURIComponent(queryParams.query.trim())}&c=${category}` +
      `&p=${queryParams.page}&s=${encodeURIComponent(queryParams.sort)}` +
      `&o=${encodeURIComponent(queryParams.order)}&f=${queryParams.filter}`;

    const result = await Scrapers.scrapeNyaa(searchUrl, queryParams.page, baseUrl);

    if (!result) {
      return c.json<ApiError>(
        { error: "Not Found", message: "No results found" },
        404
      );
    }

    setCacheHeaders(c);
    return c.json(result);
  } catch (error) {
    console.error("Error fetching category torrents:", error);
    return c.json<ApiError>(
      { error: "Internal Server Error", message: "Failed to fetch torrents" },
      500
    );
  }
});

export default app;
