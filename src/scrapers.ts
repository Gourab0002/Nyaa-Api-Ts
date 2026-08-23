import { Context } from "hono";
import * as cheerio from "cheerio";
import { Constants } from "./constants.ts";
import * as Models from "./models.ts";
import {
  extractViewId,
  fetchNyaa,
  normalizeText,
  resolveUrl,
  toCount,
} from "./utils.ts";

function labeledValue(
  $: ReturnType<typeof cheerio.load>,
  scope: ReturnType<ReturnType<typeof cheerio.load>>,
  label: string
): string {
  const match = scope.find("div.row > div").filter((_, el) => {
    return normalizeText($(el).text()) === label;
  });
  return normalizeText(match.first().next().text());
}

export function parseTorrentList(
  html: string,
  origin: string
): Models.Torrent[] {
  const $ = cheerio.load(html);
  const torrents: Models.Torrent[] = [];

  let rows = $("table.torrent-list tbody tr");
  if (!rows.length) {
    rows = $("tbody tr");
  }

  rows.each((_, selection) => {
    const row = $(selection);
    const titleLink = row
      .find('a[href^="/view/"]')
      .not(".comments")
      .last();
    const torrentPath = titleLink.attr("href") ?? "";
    const id = extractViewId(torrentPath);

    if (!id) {
      return;
    }

    const downloadHref = row.find('a[href^="/download/"]').attr("href");
    const magnetHref = row.find('a[href^="magnet:"]').attr("href");
    const cells = row.find("td");
    const last = cells.length;

    torrents.push({
      id,
      title: normalizeText(titleLink.text()),
      link: resolveUrl(origin, torrentPath),
      file: resolveUrl(origin, downloadHref),
      magnet: magnetHref ?? "",
      category: row.find("td:first-child a").attr("title") ?? "",
      size: last >= 5 ? normalizeText(cells.eq(last - 5).text()) : "",
      uploaded: last >= 4 ? normalizeText(cells.eq(last - 4).text()) : "",
      seeders: last >= 3 ? toCount(cells.eq(last - 3).text()) : 0,
      leechers: last >= 2 ? toCount(cells.eq(last - 2).text()) : 0,
      completed: last >= 1 ? toCount(cells.eq(last - 1).text()) : 0,
    });
  });

  return torrents;
}

export function parseFileInfo(
  html: string,
  origin: string,
  fileId: number
): Models.File | null {
  const $ = cheerio.load(html);
  const container = $("body div.container").last();

  if (!container.length) {
    return null;
  }

  const title = normalizeText(
    container.find(".panel-heading h3.panel-title").first().text()
  );

  if (!title) {
    return null;
  }

  const downloadHref = container.find('a[href^="/download/"]').attr("href");
  const magnetHref = container.find('a[href^="magnet:"]').attr("href") ?? "";
  const infoHash = container.find("kbd").first().text().trim();
  const commentTitle = container
    .find("div#comments h3.panel-title")
    .first()
    .text();
  const commentParts = commentTitle.split("-");
  const commentCount = toCount(commentParts[commentParts.length - 1] ?? "0");

  const comments: Models.Comment[] = [];
  if (commentCount > 0) {
    container
      .find("div#comments div.comment-panel div.panel-body")
      .each((_, selection) => {
        const element = $(selection);
        const avatar = element.find("img.avatar").attr("src");

        comments.push({
          name: normalizeText(element.find("a").first().text()),
          content: element.find("div.comment-content").text().trim(),
          image: resolveUrl(
            origin,
            avatar || Constants.DefaultProfilePicPath
          ),
          timestamp: normalizeText(
            element.find("small[data-timestamp]").first().text()
          ),
        });
      });
  }

  const torrentData: Models.Torrent = {
    title,
    file: resolveUrl(origin, downloadHref),
    link: `${origin}/view/${fileId}`,
    id: fileId,
    magnet: magnetHref,
    size: labeledValue($, container, "File size:"),
    category: labeledValue($, container, "Category:"),
    uploaded: labeledValue($, container, "Date:"),
    seeders: toCount(labeledValue($, container, "Seeders:")),
    leechers: toCount(labeledValue($, container, "Leechers:")),
    completed: toCount(labeledValue($, container, "Completed:")),
  };

  return {
    torrent: torrentData,
    description: container.find("div.panel-body#torrent-description").text(),
    submittedBy: labeledValue($, container, "Submitter:"),
    infoHash,
    commentInfo: {
      count: commentCount,
      comments,
    },
  };
}

export async function fileInfoScraper(c: Context, path: string) {
  const result = await fetchNyaa(path);
  const fileId = extractViewId(path);
  const file = parseFileInfo(result.html, result.origin, fileId);

  if (!file) {
    return c.text("Not Found", 404);
  }

  return c.json(file);
}

export async function scrapeNyaa(c: Context, path: string) {
  const result = await fetchNyaa(path);
  return c.json(parseTorrentList(result.html, result.origin));
}
