# Nyaa Web

A modern web interface for browsing anime torrents, powered by the [Nyaa API](https://github.com/Gourab0002/Nyaa-Api-Ts).

## Features

- Search torrents with filters (sort, order, category)
- Browse by category with subcategory navigation
- Detailed torrent info with description, comments, and download links
- Dark theme UI
- Server-side rendering with Next.js App Router
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Configure API URL (optional)

By default, the app uses the deployed Nyaa API. To use a different API instance, create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=https://your-api-url.example.com
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

The easiest way to deploy is via [Vercel](https://vercel.com):

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable if needed
4. Deploy

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
