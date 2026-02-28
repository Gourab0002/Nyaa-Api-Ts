import Link from "next/link";
import { CATEGORIES } from "@/lib/api";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="py-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-[var(--accent)]">
          Nyaa Web
        </h1>
        <p className="mb-8 text-[var(--text-secondary)]">
          Search and browse anime torrents with a modern interface
        </p>
        <div className="mx-auto max-w-2xl">
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.filter((c) => c.slug !== "all").map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/10"
            >
              <h3 className="mb-2 font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                {cat.name}
              </h3>
              {cat.subs.length > 0 && (
                <p className="text-xs text-[var(--text-secondary)]">
                  {cat.subs.map((s) => s.name).join(", ")}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
