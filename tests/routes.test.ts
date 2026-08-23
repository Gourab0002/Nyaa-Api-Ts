import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import app from "../src/index.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("GET / reports that the API is alive", async () => {
  const res = await app.request("/");
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "Nyaa API v2 // Alive");
});

test("GET /id/:id rejects non-numeric IDs", async () => {
  const res = await app.request("/id/12abc");
  assert.equal(res.status, 400);
  assert.equal(await res.text(), "Invalid ID");
});

test("GET /user/:username rejects path-like usernames", async () => {
  const res = await app.request("/user/has.dot");
  assert.equal(res.status, 400);
  assert.equal(await res.text(), "Invalid username");
});

test("GET /:category rejects unknown categories", async () => {
  const res = await app.request("/not-a-category");
  assert.equal(res.status, 400);
  assert.equal(await res.text(), "Invalid category");
});

test("GET /id/:id maps upstream 404 to 404", async () => {
  globalThis.fetch = (async () =>
    new Response("missing", { status: 404 })) as typeof fetch;

  const res = await app.request("/id/999999");
  assert.equal(res.status, 404);
  assert.equal(await res.text(), "Not Found");
});

test("GET /anime maps upstream failures to 502 after trying both mirrors", async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response("blocked", { status: 503 });
  }) as typeof fetch;

  const res = await app.request("/anime");
  assert.equal(res.status, 502);
  assert.equal(calls, 2);
});

test("GET /search is an alias for browsing all categories", async () => {
  let requested: string | undefined;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requested = String(input);
    return new Response(
      `<table class="table torrent-list"><tbody></tbody></table>`,
      { status: 200 }
    );
  }) as typeof fetch;

  const res = await app.request("/search?q=one%20piece");
  assert.equal(res.status, 200);
  assert.ok(requested);
  assert.match(requested, /https:\/\/nyaa\.(si|land)\/\?/);
  assert.match(requested, /q=one(\+|%20)piece/);
  assert.match(requested, /c=0_0/);
  assert.deepEqual(await res.json(), []);
});
