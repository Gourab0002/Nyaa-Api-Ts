"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { searchTorrents, type TorrentList } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import TorrentTable from "@/components/TorrentTable";
import Pagination from "@/components/Pagination";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const p = Number(searchParams.get("p")) || 1;
  const s = searchParams.get("s") || "";
  const o = searchParams.get("o") || "";
  const f = Number(searchParams.get("f")) || 0;

  const [data, setData] = useState<TorrentList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    searchTorrents({ q, p, s, o, f })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [q, p, s, o, f]);

  function buildHref(page: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    sp.set("p", String(page));
    if (s) sp.set("s", s);
    if (o) sp.set("o", o);
    if (f) sp.set("f", String(f));
    return `/search?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search Torrents</h1>

      <SearchBar
        initialQuery={q}
        initialSort={s}
        initialOrder={o}
        initialFilter={f}
      />

      {loading && (
        <div className="py-16 text-center text-[var(--text-secondary)]">
          Loading...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[var(--danger)]/50 bg-[var(--danger)]/10 p-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {!q && !data && !loading && (
        <div className="py-16 text-center text-[var(--text-secondary)]">
          Enter a search term to find torrents.
        </div>
      )}

      {data && !loading && (
        <>
          <div className="text-sm text-[var(--text-secondary)]">
            Showing {data.torrents.length} results for &quot;{q}&quot;
            {p > 1 && ` (page ${p})`}
          </div>
          <TorrentTable torrents={data.torrents} />
          <Pagination
            currentPage={p}
            hasNextPage={data.pagination.hasNextPage}
            buildHref={buildHref}
          />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[var(--text-secondary)]">
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
