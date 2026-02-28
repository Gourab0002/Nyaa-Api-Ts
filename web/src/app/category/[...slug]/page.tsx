import { getCategoryTorrents, CATEGORIES } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import TorrentTable from "@/components/TorrentTable";
import Pagination from "@/components/Pagination";

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{
    q?: string;
    p?: string;
    s?: string;
    o?: string;
    f?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = slug[0] || "";
  const subcategory = slug[1] || undefined;

  const catInfo = CATEGORIES.find((c) => c.slug === category);
  if (!catInfo) {
    return (
      <div className="py-16 text-center text-[var(--danger)]">
        Unknown category: {category}
      </div>
    );
  }

  const subInfo = subcategory
    ? catInfo.subs.find((s) => s.slug === subcategory)
    : null;

  const q = sp.q || "";
  const p = Number(sp.p) || 1;
  const s = sp.s || "";
  const o = sp.o || "";
  const f = Number(sp.f) || 0;

  let data;
  let error;

  try {
    data = await getCategoryTorrents(category, subcategory, {
      q,
      p,
      s,
      o,
      f,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch torrents";
  }

  const title = subInfo
    ? `${catInfo.name} - ${subInfo.name}`
    : catInfo.name;

  function buildHref(page: number) {
    const path = subcategory
      ? `/category/${category}/${subcategory}`
      : `/category/${category}`;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("p", String(page));
    if (s) params.set("s", s);
    if (o) params.set("o", o);
    if (f) params.set("f", String(f));
    return `${path}?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>

      {/* Subcategory nav */}
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

      {error && (
        <div className="rounded-lg border border-[var(--danger)]/50 bg-[var(--danger)]/10 p-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {data && (
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
