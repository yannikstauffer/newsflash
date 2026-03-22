# Newsflash

A multi-source news feed aggregator built with React 19 and TypeScript. Newsflash pulls RSS/XML feeds from tech and news outlets, normalizes them into a unified format, and presents them in a mobile-first interface with filtering, read lists, and swipe gestures.

Currently aggregating from Digitec, Galaxus, SRF (7 channels), WinFuture, Engadget, Heise, and Ubergizmo.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, Vite 8 |
| Language | TypeScript (strict) |
| Routing | TanStack Router |
| Styling | Tailwind CSS 4, shadcn/ui |
| Testing | Vitest, Playwright |
| Linting | ESLint (a11y, security, style) |
| Hosting | Vercel (Edge Functions for RSS proxy) |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run linting
npm run lint

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Architecture

```
src/
  app/          # App shell, routing, global providers
  features/
    connectors/ # Feed parsers (one per source)
    feed/       # Feed display, filtering, article cards
    feed-config/# User preferences and settings
    article-actions/ # Read list, swipe actions, keyboard shortcuts
  components/   # Shared UI components (shadcn/ui)
  config/       # Feed URL registry
  hooks/        # Shared hooks
  utils/        # Shared utilities
api/
  rss/          # Vercel Edge Function — proxies upstream RSS feeds
```

Feeds are fetched client-side through a Vercel Edge Function proxy (`/api/rss/:feedId`) to avoid CORS issues. Each source has a **connector** that parses its XML into a shared `NormalizedArticle` format.

## How to Contribute

### Adding a New Feed Source

1. **Create the connector** in `src/features/connectors/`:

   ```typescript
   // src/features/connectors/example-connector.ts
   import { parseRss } from "./base-parser"
   import type { Connector, NormalizedArticle } from "./types"

   export const exampleConnector: Connector = {
     id: "example",
     name: "Example News",
     language: "en",
     feeds: [
       { id: "example", name: "Example Feed" },
     ],
     parse(xml: string): NormalizedArticle[] {
       return parseRss(xml, this.id, this.language)
     },
   }
   ```

   If the feed has a non-standard XML structure, implement a custom `parse` method instead of using `parseRss`.

2. **Register the connector** in `src/features/connectors/registry.ts`:

   ```typescript
   import { exampleConnector } from "./example-connector"

   export const connectors: Connector[] = [
     // ... existing connectors
     exampleConnector,
   ]
   ```

3. **Add the feed URL** in `src/config/feeds.ts`:

   ```typescript
   export const feedUrls: Record<string, string> = {
     // ... existing feeds
     example: "https://example.com/rss.xml",
   }
   ```

4. **Write tests** — add cases to `src/features/connectors/connectors.test.ts` with sample XML from the source.

### General Contribution Guidelines

- Branch from `develop`, target PRs to `develop`
- Follow conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Run `npm run lint` and `npm run test` before committing
- Maintain 80%+ test coverage for new code
- Pre-commit hooks run ESLint automatically; pre-push hooks run TypeScript checks

## CI/CD

### GitHub Actions

The CI pipeline (`.github/workflows/ci.yml`) runs on PRs to `main`/`develop` and pushes to `main`:

1. **Lint** — ESLint with accessibility, security, and style rules
2. **Build** — TypeScript type checking + Vite production build
3. **Test** — Vitest unit tests

### Dependabot

Dependency updates are managed via Dependabot (`.github/dependabot.yml`), running weekly on Mondays at 06:00 CET. Updates are grouped to reduce PR noise:

| Group | Packages |
|-------|----------|
| React | `react`, `react-dom`, `@types/react*` |
| Vite | `vite`, `@vitejs/*` |
| Testing | `vitest`, `@vitest/*`, `@testing-library/*`, `@playwright/*`, `jsdom` |
| ESLint | `eslint*`, `@eslint/*`, `typescript-eslint`, `@stylistic/*` |
| Tailwind | `tailwindcss`, `@tailwindcss/*`, `tailwind-merge`, `tw-animate-css` |
| TypeScript | `typescript`, `@types/*` |

Major version bumps are ignored and reviewed manually.

### Vercel

The app is deployed on Vercel. The `vercel.json` config handles:

- **RSS proxy** — `/api/rss/:feed` routes to the Edge Function that fetches upstream feeds
- **SPA fallback** — all non-API routes serve `index.html` for client-side routing

## License

[MIT](LICENSE)
