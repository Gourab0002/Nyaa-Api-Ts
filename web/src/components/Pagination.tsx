import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  buildHref: (page: number) => string;
}

export default function Pagination({
  currentPage,
  hasNextPage,
  buildHref,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="rounded-lg bg-[var(--bg-card)] px-4 py-2 text-sm ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--border)]"
        >
          &larr; Previous
        </Link>
      ) : (
        <span className="rounded-lg bg-[var(--bg-card)]/50 px-4 py-2 text-sm text-[var(--text-secondary)] ring-1 ring-[var(--border)]/50">
          &larr; Previous
        </span>
      )}

      <span className="text-sm text-[var(--text-secondary)]">
        Page {currentPage}
      </span>

      {hasNextPage ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="rounded-lg bg-[var(--bg-card)] px-4 py-2 text-sm ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--border)]"
        >
          Next &rarr;
        </Link>
      ) : (
        <span className="rounded-lg bg-[var(--bg-card)]/50 px-4 py-2 text-sm text-[var(--text-secondary)] ring-1 ring-[var(--border)]/50">
          Next &rarr;
        </span>
      )}
    </div>
  );
}
