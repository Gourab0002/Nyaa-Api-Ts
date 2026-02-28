"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/api";

interface SearchBarProps {
  initialQuery?: string;
  initialSort?: string;
  initialOrder?: string;
  initialFilter?: number;
  initialCategory?: string;
  initialSubcategory?: string;
  showCategoryFilter?: boolean;
}

export default function SearchBar({
  initialQuery = "",
  initialSort = "",
  initialOrder = "",
  initialFilter = 0,
  initialCategory = "",
  initialSubcategory = "",
  showCategoryFilter = true,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [order, setOrder] = useState(initialOrder);
  const [filter, setFilter] = useState(initialFilter);
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState(initialSubcategory);

  const selectedCat = CATEGORIES.find((c) => c.slug === category);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // If a category is selected, navigate to the category route
    if (category && category !== "all") {
      const path = subcategory
        ? `/category/${category}/${subcategory}`
        : `/category/${category}`;
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (sort) params.set("s", sort);
      if (order) params.set("o", order);
      if (filter) params.set("f", String(filter));
      const qs = params.toString();
      router.push(qs ? `${path}?${qs}` : path);
    } else {
      // General search
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (sort) params.set("s", sort);
      if (order) params.set("o", order);
      if (filter) params.set("f", String(filter));
      router.push(`/search?${params.toString()}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search torrents..."
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          Search
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {showCategoryFilter && (
          <>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
              }}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {selectedCat && selectedCat.subs.length > 0 && (
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                <option value="">All Subcategories</option>
                {selectedCat.subs.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        >
          <option value="">Sort By</option>
          <option value="seeders">Seeders</option>
          <option value="leechers">Leechers</option>
          <option value="size">Size</option>
          <option value="date">Date</option>
          <option value="downloads">Downloads</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        >
          <option value="">Order</option>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <select
          value={filter}
          onChange={(e) => setFilter(Number(e.target.value))}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        >
          <option value={0}>No Filter</option>
          <option value={1}>No Remakes</option>
          <option value={2}>Trusted Only</option>
        </select>
      </div>
    </form>
  );
}
