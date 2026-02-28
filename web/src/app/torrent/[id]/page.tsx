import { getTorrentById } from "@/lib/api";
import Link from "next/link";

interface TorrentPageProps {
  params: Promise<{ id: string }>;
}

export default async function TorrentPage({ params }: TorrentPageProps) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return (
      <div className="py-16 text-center text-[var(--danger)]">
        Invalid torrent ID.
      </div>
    );
  }

  let data;
  try {
    data = await getTorrentById(numId);
  } catch {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-[var(--danger)]">Torrent not found.</p>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  const { torrent, description, submittedBy, infoHash, commentInfo } = data;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-sm text-[var(--accent)] hover:underline"
      >
        &larr; Back to home
      </Link>

      {/* Title */}
      <h1 className="text-2xl font-bold leading-tight">{torrent.title}</h1>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Category" value={torrent.category} />
        <InfoCard label="Size" value={torrent.size} />
        <InfoCard label="Uploaded" value={torrent.uploaded} />
        <InfoCard label="Submitted by" value={submittedBy} />
        <InfoCard label="Seeders" value={String(torrent.seeders)} variant="success" />
        <InfoCard label="Leechers" value={String(torrent.leechers)} variant="danger" />
        <InfoCard label="Completed" value={String(torrent.completed)} />
        <InfoCard label="Info Hash" value={infoHash} mono />
      </div>

      {/* Download buttons */}
      <div className="flex flex-wrap gap-3">
        {torrent.file && (
          <a
            href={torrent.file}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Download .torrent
          </a>
        )}
        {torrent.magnet && (
          <a
            href={torrent.magnet}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--border)]"
          >
            Magnet Link
          </a>
        )}
      </div>

      {/* Description */}
      {description && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Description</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm text-[var(--text-secondary)]">
            {description}
          </div>
        </section>
      )}

      {/* Comments */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Comments ({commentInfo.count})
        </h2>
        {commentInfo.comments.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {commentInfo.comments.map((comment, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4"
              >
                <div className="mb-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comment.image}
                    alt={comment.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <span className="text-sm font-medium">{comment.name}</span>
                    <span className="ml-2 text-xs text-[var(--text-secondary)]">
                      {comment.timestamp}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
  variant,
  mono,
}: {
  label: string;
  value: string;
  variant?: "success" | "danger";
  mono?: boolean;
}) {
  const colorClass =
    variant === "success"
      ? "text-[var(--success)]"
      : variant === "danger"
        ? "text-[var(--danger)]"
        : "text-[var(--text-primary)]";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div
        className={`mt-1 text-sm font-medium ${colorClass} ${mono ? "break-all font-mono text-xs" : ""}`}
      >
        {value || "-"}
      </div>
    </div>
  );
}
