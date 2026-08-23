import { Context } from "hono";
import * as Scrapers from "./scrapers.ts";
import * as Utils from "./utils.ts";

export class Handlers {
  static Ping = function (c: Context) {
    return c.text("Nyaa API v2 // Alive");
  };

  static GetInfoFromID = async function (c: Context) {
    try {
      const id = c.req.param("id") ?? "";
      if (!Utils.isValidId(id)) {
        return c.text("Invalid ID", 400);
      }

      return await Scrapers.fileInfoScraper(c, `/view/${id}`);
    } catch (error) {
      return c.text(Utils.errorMessage(error), Utils.errorStatus(error));
    }
  };

  static GetUserUploads = async function (c: Context) {
    try {
      const username = c.req.param("username") ?? "";
      if (!Utils.isValidUsername(username)) {
        return c.text("Invalid username", 400);
      }

      const queryParams = Utils.getSearchParameters(c);
      const searchUrl = `/user/${encodeURIComponent(username)}?${Utils.buildSearchQuery(queryParams)}`;

      return await Scrapers.scrapeNyaa(c, searchUrl);
    } catch (error) {
      return c.text(Utils.errorMessage(error), Utils.errorStatus(error));
    }
  };

  static Search = async function (c: Context) {
    try {
      const queryParams = Utils.getSearchParameters(c);
      const searchUrl = `/?${Utils.buildSearchQuery(queryParams, { c: "0_0" })}`;

      return await Scrapers.scrapeNyaa(c, searchUrl);
    } catch (error) {
      return c.text(Utils.errorMessage(error), Utils.errorStatus(error));
    }
  };

  static GetCategoryTorrents = async function (c: Context) {
    try {
      const cat = c.req.param("category") ?? "";
      const subCat = c.req.param("subcategory");

      if (!Utils.isKnownCategory(cat)) {
        return c.text("Invalid category", 400);
      }

      const category = Utils.getCategoryID(cat, subCat);
      const queryParams = Utils.getSearchParameters(c);
      const searchUrl = `/?${Utils.buildSearchQuery(queryParams, { c: category })}`;

      return await Scrapers.scrapeNyaa(c, searchUrl);
    } catch (error) {
      return c.text(Utils.errorMessage(error), Utils.errorStatus(error));
    }
  };
}
