"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getCategoryTorrents, CATEGORIES, type TorrentList } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import TorrentTable from "@/components/TorrentTable";
import Pagination from "@/components/Pagination";

function CategoryContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slugArr = Array.isArray(params.slug) ? params.slug : [params.slug];
  const category = (slugArr[0] as string) || "";
  const subcategory = (slugArr[1] as string) || undefined;

  const catInfo = CATEGORIES.find((c) => c.slug === category);
  const subInfo = subcategory
    ? catInfo?.subs.find((s) => s.slug === subcategory)
    : null;

  const q = searchParams.get("q") || "";
  const p = Number(searchParams.get("p")) || 1;
  const s = searchParams.get("s") || "";
  const o = searchParams.get("o") || "";
  const f = Number(searchParams.get("f")) || 0;

  const [data, setData] = useState<TorrentList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!catInfo) {
      setError(`Unknown category: ${category}`);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getCategoryTorrents(category, subcategory, { q, p, s, o, f })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, subcategory, q, p, s, o, f, catInfo]);

  if (!catInfo) {
    return (
      <div className="py-16 text-center text-[var(--danger)]">
        Unknown category: {category}
      </div>
    );
  }

  const title = subInfo ? `${catInfo.name} - ${subInfo.name}` : catInfo.name;

  function buildHref(page: number) {
    const path = subcategory
      ? `/category/${category}/${subcategory}`
      : `/category/${category}`;
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    sp.set("p", String(page));
    if (s) sp.set("s", s);
    if (o) sp.set("o", o);
    if (f) sp.set("f", String(f));
    return `${path}?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>

      {catInfo.subs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <a
            href={`/category/${category}`}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              !subcategory
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] ring-1 ring-[var(--border)] hover:text-[var(--text-primary)]"
            }`}
          >
            All
          </a>
          {catInfo.subs.map((sub) => (
            <a
              key={sub.slug}
              href={`/category/${category}/${sub.slug}`}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                subcategory === sub.slug
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] ring-1 ring-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              {sub.name}
            </a>
          ))}
        </div>
      )}

      <SearchBar
        initialQuery={q}
        initialSort={s}
        initialOrder={o}
        initialFilter={f}
        initialCategory={category}
        initialSubcategory={subcategory || ""}
        showCategoryFilter={false}
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

      {data && !loading && (
        <>
          <div className="text-sm text-[var(--text-secondary)]">
            {data.torrents.length} torrents{p > 1 && ` (page ${p})`}
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

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[var(--text-secondary)]">
          Loading...
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
