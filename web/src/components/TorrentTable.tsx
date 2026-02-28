import Link from "next/link";
import type { Torrent } from "@/lib/api";

function SeedLeechBadge({
  seeders,
  leechers,
}: {
  seeders: number;
  leechers: number;
}) {
  return (
    <span className="inline-flex gap-2 text-xs">
      <span className="text-[var(--success)]" title="Seeders">
        &#9650; {seeders}
      </span>
      <span className="text-[var(--danger)]" title="Leechers">
        &#9660; {leechers}
      </span>
    </span>
  );
}

export default function TorrentTable({ torrents }: { torrents: Torrent[] }) {
  if (torrents.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--text-secondary)]">
        No torrents found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--text-secondary)]">
            <th className="px-3 py-3">Category</th>
            <th className="px-3 py-3">Name</th>
            <th className="px-3 py-3">Size</th>
            <th className="px-3 py-3">Date</th>
            <th className="px-3 py-3">S/L</th>
            <th className="px-3 py-3">Downloads</th>
            <th className="px-3 py-3">Links</th>
          </tr>
        </thead>
        <tbody>
          {torrents.map((t) => (
            <tr
              key={t.id}
              className="border-b border-[var(--border)]/50 transition-colors hover:bg-[var(--bg-card)]"
            >
              <td className="px-3 py-3 text-xs text-[var(--text-secondary)]">
                {t.category}
              </td>
              <td className="max-w-md px-3 py-3">
                <Link
                  href={`/torrent/${t.id}`}
                  className="line-clamp-2 text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)] hover:underline"
                >
                  {t.title}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-[var(--text-secondary)]">
                {t.size}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-xs text-[var(--text-secondary)]">
                {t.uploaded}
              </td>
              <td className="px-3 py-3">
                <SeedLeechBadge seeders={t.seeders} leechers={t.leechers} />
              </td>
              <td className="px-3 py-3 text-[var(--text-secondary)]">
                {t.completed}
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                <div className="flex gap-2">
                  {t.file && (
                    <a
                      href={t.file}
                      className="rounded bg-[var(--accent)] px-2 py-1 text-xs text-white transition-colors hover:bg-[var(--accent-hover)]"
                      title="Download torrent"
                    >
                      .torrent
                    </a>
                  )}
                  {t.magnet && (
                    <a
                      href={t.magnet}
                      className="rounded bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-primary)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--border)]"
                      title="Magnet link"
                    >
                      Magnet
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
