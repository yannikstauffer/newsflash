## 1. Project Setup

- [x] 1.1 Install dependencies: `fast-xml-parser`, `@use-gesture/react`
- [x] 1.2 Configure Vite dev proxy for `/api/rss/*` routes mapping to all 7 feed URLs
- [x] 1.3 Create feature module directory structure (`connectors/`, `feed/`, `article-actions/`, `feed-config/`)

## 2. Connector System

- [x] 2.1 Define TypeScript interfaces: `Connector`, `NormalizedArticle`, `FeedConfig` in `connectors/types.ts`
- [x] 2.2 Implement base RSS 2.0 + Atom parser in `connectors/base-parser.ts` with tests
- [x] 2.3 Implement `fetchFeed` abstraction that routes through the Vite proxy
- [x] 2.4 Implement digitec connector with tests
- [x] 2.5 Implement galaxus connector with tests
- [x] 2.6 Implement SRF connector (multi-feed) with tests
- [x] 2.7 Implement WinFuture connector with tests
- [x] 2.8 Implement Engadget connector with tests
- [x] 2.9 Implement Heise connector (Atom format) with tests
- [x] 2.10 Implement Ubergizmo connector with tests
- [x] 2.11 Create connector registry in `connectors/registry.ts` with tests

## 3. Feed State and Data Layer

- [x] 3.1 Implement `useLocalStorage` hook for typed localStorage read/write with tests
- [x] 3.2 Implement feed preferences store (enabled/disabled feeds) with localStorage persistence
- [x] 3.3 Implement article state store (hidden set, read-list set) with localStorage persistence
- [x] 3.4 Implement feed fetching hook: fetch all enabled feeds, parse via connectors, merge, deduplicate by URL, sort chronologically
- [x] 3.5 Implement filtering logic: source filter, language filter, show-hidden toggle, text search with AND combination

## 4. Article Feed UI

- [x] 4.1 Build article card component: title, source, relative time, description, optional image, links to original source in new tab
- [x] 4.2 Build feed list component: renders article cards, loading state, partial error indicators
- [x] 4.3 Build filter bar: source toggles, language filter (All/DE/EN), show-hidden toggle, search input
- [x] 4.4 Build refresh button with loading state
- [x] 4.5 Wire up feed page: filter bar + feed list + refresh, fetch on mount

## 5. Article Actions (Hide + Read List)

- [x] 5.1 Implement swipe gestures with `@use-gesture/react`: swipe right to hide, swipe left to save, with `stopPropagation` to prevent navigation
- [x] 5.2 Build hover action buttons (hide + save/bookmark) that appear on desktop hover, with `stopPropagation`
- [x] 5.3 Implement keyboard shortcuts: `H` to hide, `S` to save focused/hovered article
- [x] 5.4 Build Read List view: displays saved articles newest-saved first, with remove action
- [x] 5.5 Implement unhide action for articles visible via "Show hidden" filter
- [x] 5.6 Add dimmed visual styling for hidden articles when "Show hidden" is active

## 6. Feed Configuration UI

- [x] 6.1 Build feed configuration view: lists all feeds grouped by source with toggles
- [x] 6.2 Implement source-level master toggle (enable/disable all sub-feeds for a source)
- [x] 6.3 Wire feed configuration to localStorage preferences store

## 7. App Shell and Navigation

- [x] 7.1 Build app layout with navigation between Feed view, Read List view, and Feed Configuration view
- [x] 7.2 Add mobile-first responsive styling across all views (touch targets >= 44px, breakpoints at 320/375/768/1024/1440px)
- [x] 7.3 Verify WCAG Level AA: keyboard navigation, focus indicators, semantic HTML, contrast, alt text
