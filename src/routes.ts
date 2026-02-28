import { Hono } from "hono";
import * as Scrapers from "./scrapers";
import * as Utils from "./utils";
import type { ApiError } from "./models";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Nyaa API v2" });
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
    const result = await Scrapers.fileInfoScraper(searchUrl);

    if (!result) {
      return c.json<ApiError>(
        { error: "Not Found", message: `Torrent with ID ${id} not found` },
        404
      );
    }

    return c.json(result);
  } catch (error) {
    console.error("Error fetching torrent info:", error);
    return c.json<ApiError>(
      { error: "Internal Server Error", message: "Failed to fetch torrent info" },
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
      `?q=${queryParams.query.trim()}&p=${queryParams.page}` +
      `&s=${queryParams.sort}&o=${queryParams.order}&f=${queryParams.filter}`;

    const result = await Scrapers.scrapeNyaa(searchUrl);

    if (!result) {
      return c.json<ApiError>(
        { error: "Not Found", message: `User "${username}" not found or has no uploads` },
        404
      );
    }

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
      `${baseUrl}?q=${queryParams.query.trim()}&c=${category}` +
      `&p=${queryParams.page}&s=${queryParams.sort}` +
      `&o=${queryParams.order}&f=${queryParams.filter}`;

    const result = await Scrapers.scrapeNyaa(searchUrl);

    if (!result) {
      return c.json<ApiError>(
        { error: "Not Found", message: "No results found" },
        404
      );
    }

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
