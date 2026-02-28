import { searchTorrents } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import TorrentTable from "@/components/TorrentTable";
import Pagination from "@/components/Pagination";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    p?: string;
    s?: string;
    o?: string;
    f?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const p = Number(params.p) || 1;
  const s = params.s || "";
  const o = params.o || "";
  const f = Number(params.f) || 0;

  let data = null;
  let error = null;

  if (q) {
    try {
      data = await searchTorrents({ q, p, s, o, f });
    } catch (err) {
      error = err instanceof Error ? err.message : "Search failed";
    }
  }

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

      {error && (
        <div className="rounded-lg border border-[var(--danger)]/50 bg-[var(--danger)]/10 p-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {!q && !data && (
        <div className="py-16 text-center text-[var(--text-secondary)]">
          Enter a search term to find torrents.
        </div>
      )}

      {data && (
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
