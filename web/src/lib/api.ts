const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://nyaa-api-ts-63-fbs4nf88j6w0.nova420.deno.net";

export interface Torrent {
  id: number;
  title: string;
  category: string;
  uploaded: string;
  seeders: number;
  leechers: number;
  completed: number;
  size: string;
  file: string | null;
  link: string | null;
  magnet: string | null;
}

export interface TorrentList {
  torrents: Torrent[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
  };
}

export interface FileInfo {
  torrent: Torrent;
  description: string;
  submittedBy: string;
  infoHash: string;
  commentInfo: {
    count: number;
    comments: Comment[];
  };
}

export interface Comment {
  name: string;
  content: string;
  image: string;
  timestamp: string;
}

export interface SearchParams {
  q?: string;
  p?: number;
  s?: string;
  o?: string;
  f?: number;
}

export async function searchTorrents(
  params: SearchParams
): Promise<TorrentList> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.p) query.set("p", String(params.p));
  if (params.s) query.set("s", params.s);
  if (params.o) query.set("o", params.o);
  if (params.f !== undefined) query.set("f", String(params.f));

  const res = await fetch(`${API_URL}/search?${query.toString()}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function getTorrentById(id: number): Promise<FileInfo> {
  const res = await fetch(`${API_URL}/id/${id}`);
  if (!res.ok) throw new Error(`Torrent not found: ${res.status}`);
  return res.json();
}

export async function getCategoryTorrents(
  category: string,
  subcategory?: string,
  params?: SearchParams
): Promise<TorrentList> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.p) query.set("p", String(params.p));
  if (params?.s) query.set("s", params.s);
  if (params?.o) query.set("o", params.o);
  if (params?.f !== undefined) query.set("f", String(params.f));

  const path = subcategory
    ? `${category}/${subcategory}`
    : category;

  const qs = query.toString();
  const url = qs ? `${API_URL}/${path}?${qs}` : `${API_URL}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Category fetch failed: ${res.status}`);
  return res.json();
}

export async function getUserTorrents(
  username: string,
  params?: SearchParams
): Promise<TorrentList> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.p) query.set("p", String(params.p));
  if (params?.s) query.set("s", params.s);
  if (params?.o) query.set("o", params.o);

  const qs = query.toString();
  const url = qs
    ? `${API_URL}/user/${encodeURIComponent(username)}?${qs}`
    : `${API_URL}/user/${encodeURIComponent(username)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
  return res.json();
}

export const CATEGORIES = [
  { name: "All", slug: "all", subs: [] },
  {
    name: "Anime",
    slug: "anime",
    subs: [
      { name: "AMV", slug: "amv" },
      { name: "English", slug: "eng" },
      { name: "Non-English", slug: "non-eng" },
      { name: "Raw", slug: "raw" },
    ],
  },
  {
    name: "Audio",
    slug: "audio",
    subs: [
      { name: "Lossless", slug: "lossless" },
      { name: "Lossy", slug: "lossy" },
    ],
  },
  {
    name: "Manga",
    slug: "manga",
    subs: [
      { name: "English", slug: "eng" },
      { name: "Non-English", slug: "non-eng" },
      { name: "Raw", slug: "raw" },
    ],
  },
  {
    name: "Live Action",
    slug: "live_action",
    subs: [
      { name: "English", slug: "eng" },
      { name: "Promo", slug: "promo" },
      { name: "Non-English", slug: "non-eng" },
      { name: "Raw", slug: "raw" },
    ],
  },
  {
    name: "Pictures",
    slug: "pictures",
    subs: [
      { name: "Graphics", slug: "graphics" },
      { name: "Photos", slug: "photos" },
    ],
  },
  {
    name: "Software",
    slug: "software",
    subs: [
      { name: "Applications", slug: "applications" },
      { name: "Games", slug: "games" },
    ],
  },
];
