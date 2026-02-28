import * as Constants from "./constants";
import * as cheerio from "cheerio";
import type * as Models from "./models";

/**
 * Scrapes detailed file/torrent info from a Nyaa view page.
 */
export async function fileInfoScraper(
  url: string
): Promise<Models.FileInfo | null> {
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const responseBody = await response.text();
  const $ = cheerio.load(responseBody);
  const container = $("body div.container").last();

  const fileIdMatch = url.match(/\/view\/(\d+)/);
  const fileId = fileIdMatch ? Number(fileIdMatch[1]) : 0;

  const torrentData: Models.Torrent = {
    title: container.find("h3.panel-title").first().text().trim(),
    file:
      Constants.NyaaBaseUrl +
      (container.find("div.panel-footer a").attr("href") ?? ""),
    link: `${Constants.NyaaBaseUrl}/view/${fileId}`,
    id: fileId,
    magnet:
      container.find("div.panel-footer a:nth-child(2)").attr("href") ?? null,
    size: container
      .find("div.panel-body div.row:nth-child(4) .col-md-5:nth-child(2)")
      .text()
      .trim(),
    category: container
      .find("div.panel-body div.row:nth-child(1) .col-md-5:nth-child(2)")
      .text()
      .trim(),
    uploaded: container
      .find("div.panel-body div.row:nth-child(1) .col-md-5:nth-child(4)")
      .text()
      .trim(),
    seeders: safeNumber(
      container
        .find("div.panel-body div.row:nth-child(2) .col-md-5:nth-child(4)")
        .text()
        .trim()
    ),
    leechers: safeNumber(
      container
        .find("div.panel-body div.row:nth-child(3) .col-md-5:nth-child(4)")
        .text()
        .trim()
    ),
    completed: safeNumber(
      container
        .find("div.panel-body div.row:nth-child(4) .col-md-5:nth-child(4)")
        .text()
        .trim()
    ),
  };

  const commentText = container
    .find("div#comments h3.panel-title")
    .text()
    .split("-")
    .at(-1);
  const commentCount = safeNumber(commentText ?? "0");

  const comments: Models.Comment[] = [];
  if (commentCount > 0) {
    container
      .find("div#comments div.comment-panel div.panel-body")
      .each((_, selection) => {
        const element = $(selection);

        const comment: Models.Comment = {
          name: element.find("a").first().text().trim(),
          content: element
            .find("div.comment-body div.comment-content")
            .text(),
          image:
            element.find("img.avatar").attr("src") ??
            Constants.DefaultProfilePic,
          timestamp: element.find("a").children().first().text(),
        };

        comments.push(comment);
      });
  }

  const file: Models.FileInfo = {
    torrent: torrentData,
    description: container.find("div.panel-body#torrent-description").text(),
    submittedBy: container
      .find("div.panel-body div.row:nth-child(2) .col-md-5:nth-child(2)")
      .text()
      .trim(),
    infoHash: container
      .find("div.panel-body div.row:nth-child(5) .col-md-5:nth-child(2)")
      .text()
      .trim(),
    commentInfo: {
      count: commentCount,
      comments: comments,
    },
  };

  return file;
}

/**
 * Scrapes the torrent listing table from a Nyaa search/user page.
 */
export async function scrapeNyaa(
  url: string
): Promise<Models.Torrent[] | null> {
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const responseBody = await response.text();
  const $ = cheerio.load(responseBody);
  const table = $("tbody");

  const torrents: Models.Torrent[] = [];
  table.find("tr").each((_, selection) => {
    const row = $(selection);
    const torrentPath = row.find("td:nth-child(2) a").last().attr("href") ?? "";
    const filePath =
      row.find("td:nth-child(3) a:nth-child(1)").attr("href") ?? "";

    const idMatch = torrentPath.match(/\/view\/(\d+)/);
    const id = idMatch ? Number(idMatch[1]) : 0;

    const torrent: Models.Torrent = {
      id,
      title: row.find("td:nth-child(2) a").last().text(),
      link: Constants.NyaaBaseUrl + torrentPath,
      file: Constants.NyaaBaseUrl + filePath,
      category: row.find("td:nth-child(1) a").attr("title") ?? "",
      size: row.find("td:nth-child(4)").text(),
      uploaded: row.find("td:nth-child(5)").text(),
      seeders: safeNumber(row.find("td:nth-child(6)").text()),
      leechers: safeNumber(row.find("td:nth-child(7)").text()),
      completed: safeNumber(row.find("td:nth-child(8)").text()),
      magnet: row.find("td:nth-child(3) a:nth-child(2)").attr("href") ?? null,
    };

    torrents.push(torrent);
  });

  return torrents;
}

/** Safely parse a string to number, returning 0 for NaN */
function safeNumber(value: string): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}
