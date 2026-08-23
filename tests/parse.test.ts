import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFileInfo, parseTorrentList } from "../src/scrapers.ts";
import {
  buildSearchQuery,
  extractViewId,
  getCategoryID,
  getSearchParameters,
  isKnownCategory,
  isValidId,
  isValidUsername,
  resolveUrl,
  toCount,
} from "../src/utils.ts";

const LISTING_HTML = `
<table class="table torrent-list">
  <tbody>
    <tr class="default">
      <td><a href="/?c=1_4" title="Anime - Raw"><img alt="Anime - Raw"></a></td>
      <td colspan="2">
        <a href="/view/2148068" title="Sample Torrent">Sample Torrent</a>
      </td>
      <td class="text-center">
        <a href="/download/2148068.torrent"></a>
        <a href="magnet:?xt=urn:btih:abc123&amp;dn=Sample"></a>
      </td>
      <td class="text-center">146.6 GiB</td>
      <td class="text-center">2026-08-18 13:54</td>
      <td class="text-center">1</td>
      <td class="text-center">2</td>
      <td class="text-center">3</td>
    </tr>
    <tr class="success">
      <td><a href="/?c=1_2" title="Anime - English-translated"><img></a></td>
      <td colspan="2">
        <a href="/view/2148063#comments" class="comments" title="2 comments">
          <i class="fa fa-comments-o"></i>2
        </a>
        <a href="/view/2148063" title="Commented Torrent">Commented Torrent</a>
      </td>
      <td class="text-center">
        <a href="magnet:?xt=urn:btih:def456"></a>
      </td>
      <td class="text-center">1.3 GiB</td>
      <td class="text-center">2026-08-18 13:32</td>
      <td class="text-center">70</td>
      <td class="text-center">2</td>
      <td class="text-center">1109</td>
    </tr>
  </tbody>
</table>
`;

const VIEW_HTML = `
<body>
  <div class="container">ad</div>
  <div class="container">
    <div class="panel panel-success">
      <div class="panel-heading">
        <h3 class="panel-title">[SubsPlease] Example - 08 (1080p).mkv</h3>
      </div>
      <div class="panel-body">
        <div class="row">
          <div class="col-md-1">Category:</div>
          <div class="col-md-5"><a href="/?c=1_0">Anime</a> - <a href="/?c=1_2">English-translated</a></div>
          <div class="col-md-1">Date:</div>
          <div class="col-md-5">2026-08-18 13:32 UTC</div>
        </div>
        <div class="row">
          <div class="col-md-1">Submitter:</div>
          <div class="col-md-5"><a href="/user/subsplease">subsplease</a></div>
          <div class="col-md-1">Seeders:</div>
          <div class="col-md-5"><span style="color: green;">70</span></div>
        </div>
        <div class="row">
          <div class="col-md-1">Information:</div>
          <div class="col-md-5">https://subsplease.org/</div>
          <div class="col-md-1">Leechers:</div>
          <div class="col-md-5"><span style="color: red;">2</span></div>
        </div>
        <div class="row">
          <div class="col-md-1">File size:</div>
          <div class="col-md-5">1.3 GiB</div>
          <div class="col-md-1">Completed:</div>
          <div class="col-md-5">0</div>
        </div>
        <div class="row">
          <div class="col-md-offset-6 col-md-1">Info hash:</div>
          <div class="col-md-5"><kbd>e386a18cbd5525b5515a3b118e365033ec190465</kbd></div>
          <br><hr><div>advertisement</div>
        </div>
      </div>
      <div class="panel-footer clearfix">
        <a href="/download/2148063.torrent">Download Torrent</a>
        or
        <a href="magnet:?xt=urn:btih:e386a18cbd5525b5515a3b118e365033ec190465">Magnet</a>
      </div>
    </div>
    <div markdown-text class="panel-body" id="torrent-description">Released by SubsPlease</div>
    <div id="comments" class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title">Comments - 1</h3>
      </div>
      <div class="comment-panel">
        <div class="panel-body">
          <a href="/user/alice">alice</a>
          <img class="avatar" src="/static/img/avatar/default.png">
          <div class="comment-details">
            <a href="#com-1"><small data-timestamp="1787059921">2026-08-18 13:32 UTC</small></a>
          </div>
          <div class="comment-body">
            <div class="comment-content">Thanks for the upload</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
`;

test("parseTorrentList maps listing rows including magnet-only torrents", () => {
  const torrents = parseTorrentList(LISTING_HTML, "https://nyaa.land");

  assert.equal(torrents.length, 2);

  assert.deepEqual(torrents[0], {
    id: 2148068,
    title: "Sample Torrent",
    link: "https://nyaa.land/view/2148068",
    file: "https://nyaa.land/download/2148068.torrent",
    magnet: "magnet:?xt=urn:btih:abc123&dn=Sample",
    category: "Anime - Raw",
    size: "146.6 GiB",
    uploaded: "2026-08-18 13:54",
    seeders: 1,
    leechers: 2,
    completed: 3,
  });

  assert.equal(torrents[1].id, 2148063);
  assert.equal(torrents[1].title, "Commented Torrent");
  assert.equal(torrents[1].file, "");
  assert.equal(torrents[1].magnet, "magnet:?xt=urn:btih:def456");
  assert.equal(torrents[1].seeders, 70);
  assert.equal(torrents[1].completed, 1109);
});

test("parseFileInfo reads labeled fields, hash, and comments", () => {
  const file = parseFileInfo(VIEW_HTML, "https://nyaa.land", 2148063);

  assert.ok(file);
  assert.equal(file.torrent.title, "[SubsPlease] Example - 08 (1080p).mkv");
  assert.equal(file.torrent.category, "Anime - English-translated");
  assert.equal(file.torrent.uploaded, "2026-08-18 13:32 UTC");
  assert.equal(file.torrent.seeders, 70);
  assert.equal(file.torrent.leechers, 2);
  assert.equal(file.torrent.size, "1.3 GiB");
  assert.equal(file.torrent.completed, 0);
  assert.equal(file.torrent.file, "https://nyaa.land/download/2148063.torrent");
  assert.equal(
    file.torrent.magnet,
    "magnet:?xt=urn:btih:e386a18cbd5525b5515a3b118e365033ec190465"
  );
  assert.equal(file.submittedBy, "subsplease");
  assert.equal(file.infoHash, "e386a18cbd5525b5515a3b118e365033ec190465");
  assert.equal(file.description, "Released by SubsPlease");
  assert.equal(file.commentInfo.count, 1);
  assert.equal(file.commentInfo.comments[0].name, "alice");
  assert.equal(file.commentInfo.comments[0].content, "Thanks for the upload");
  assert.equal(file.commentInfo.comments[0].timestamp, "2026-08-18 13:32 UTC");
  assert.equal(
    file.commentInfo.comments[0].image,
    "https://nyaa.land/static/img/avatar/default.png"
  );
});

test("parseFileInfo returns null for empty markup", () => {
  assert.equal(parseFileInfo("<html></html>", "https://nyaa.si", 1), null);
});

test("category helpers accept documented software/application alias", () => {
  assert.equal(isKnownCategory("software"), true);
  assert.equal(isKnownCategory("id"), false);
  assert.equal(getCategoryID("software", "application"), "6_1");
  assert.equal(getCategoryID("software", "applications"), "6_1");
  assert.equal(getCategoryID("software", undefined), "6_0");
  assert.equal(getCategoryID("missing", "raw"), "0_0");
  assert.equal(getCategoryID("anime", "nope"), "1_0");
});

test("validation helpers reject unsafe ids and usernames", () => {
  assert.equal(isValidId("2148063"), true);
  assert.equal(isValidId("../etc"), false);
  assert.equal(isValidId("12abc"), false);
  assert.equal(isValidUsername("subsplease"), true);
  assert.equal(isValidUsername("a_b-1"), true);
  assert.equal(isValidUsername("../view"), false);
  assert.equal(isValidUsername("user/name"), false);
});

test("query builder encodes values and omits empty optional fields", () => {
  const query = buildSearchQuery(
    { query: "foo & bar", page: 2, sort: "seeders", order: "asc", filter: 1 },
    { c: "1_2" }
  );
  const params = new URLSearchParams(query);

  assert.equal(params.get("q"), "foo & bar");
  assert.equal(params.get("c"), "1_2");
  assert.equal(params.get("p"), "2");
  assert.equal(params.get("s"), "seeders");
  assert.equal(params.get("o"), "asc");
  assert.equal(params.get("f"), "1");
});

test("getSearchParameters defaults NaN-safe values and accepts filter alias", () => {
  const c = {
    req: {
      query: (key: string) =>
        ({ q: "one two", s: "date", filter: "2", p: "not-a-number" } as Record<
          string,
          string
        >)[key],
    },
  };

  const params = getSearchParameters(c as never);

  assert.equal(params.query, "one two");
  assert.equal(params.sort, "id");
  assert.equal(params.page, 1);
  assert.equal(params.filter, 2);
  assert.equal(params.order, "");
});

test("url and number helpers", () => {
  assert.equal(resolveUrl("https://nyaa.land", "/view/1"), "https://nyaa.land/view/1");
  assert.equal(resolveUrl("https://nyaa.land", "magnet:?xt=1"), "magnet:?xt=1");
  assert.equal(resolveUrl("https://nyaa.land", undefined), "");
  assert.equal(toCount("1,109"), 1109);
  assert.equal(toCount(""), 0);
  assert.equal(extractViewId("/view/2148063#comments"), 2148063);
  assert.equal(extractViewId("nope"), 0);
});
