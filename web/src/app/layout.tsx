import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyaa Web - Torrent Search",
  description: "A modern web interface for searching anime torrents on Nyaa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="text-xl font-bold text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
            >
              Nyaa Web
            </Link>
            <div className="flex gap-4 text-sm">
              <Link
                href="/"
                className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Home
              </Link>
              <Link
                href="/search"
                className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Search
              </Link>
              <Link
                href="/category/anime"
                className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Anime
              </Link>
              <Link
                href="/category/manga"
                className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Manga
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--text-secondary)]">
          Powered by Nyaa API
        </footer>
      </body>
    </html>
  );
}
