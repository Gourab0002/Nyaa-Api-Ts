export interface Torrent {
  id: number;
  title: string;
  category: string;
  uploaded: string;
  seeders: number;
  leechers: number;
  completed: number;
  size: string;
  file: string;
  link: string;
  magnet: string;
}

export interface File {
  torrent: Torrent;
  description: string;
  submittedBy: string;
  infoHash: string;
  commentInfo: Comments;
}

export interface Comment {
  name: string;
  content: string;
  image: string;
  timestamp: string;
}

export interface Comments {
  count: number;
  comments: Comment[];
}

export interface QueryParams {
  query: string;
  sort: string;
  order: string;
  page: number;
  filter: number;
}

export interface FetchResult {
  origin: string;
  html: string;
  status: number;
}

export type ErrorStatus = 400 | 404 | 502;

export class HttpError extends Error {
  status: ErrorStatus;

  constructor(status: ErrorStatus, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
