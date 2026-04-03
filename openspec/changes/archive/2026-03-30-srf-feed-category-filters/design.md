## Context

SRF has 26 feeds organized into 4 groups: News (5), Sport (8), Kultur (7), Wissen (6). The `srf-latest` feed aggregates articles across all categories. When articles are parsed, they all receive `source: "srf"` — the connector ID — regardless of which feed delivered them.

The existing `ArticleFilter` infrastructure (used by Heise, Digitec, Galaxus, WinFuture) provides content-based filtering at the display layer. SRF currently defines no filters. The settings UI automatically renders filter toggles for any connector that has a `filters` array.

SRF article URLs encode category in the path:
- `srf.ch/sport/...` → Sport content
- `srf.ch/kultur/...` → Kultur content
- `srf.ch/news/...` → News content
- `srf.ch/wissen/...` or other paths → Wissen/other content

## Goals / Non-Goals

**Goals:**
- Allow users to hide SRF Sport/Kultur/Wissen content regardless of which feed delivered the articles
- Reuse the existing `ArticleFilter` infrastructure — no new abstractions
- Filters default to enabled, preserving current behavior

**Non-Goals:**
- Changing how `source` is assigned to articles (architectural change out of scope)
- Adding per-feed tracking to articles (would not solve the cross-feed problem anyway)
- Fine-grained sub-category filtering (e.g., filtering only "Eishockey" but keeping "Fussball") — this could be a future enhancement
- Filtering News category (News is the core SRF content; filtering it would essentially disable SRF)

## Decisions

### 1. URL path matching for category detection

**Decision:** Match `article.link` against URL path prefixes (`/sport/`, `/kultur/`) to determine category.

**Alternatives considered:**
- **RSS category field:** SRF RSS items do not consistently include a `<category>` element, and the `category` field on `NormalizedArticle` is often `undefined` for SRF articles. Unreliable.
- **Title heuristics:** Too fragile, would produce false positives/negatives.

**Rationale:** SRF URLs are stable and structured. The path prefix is a reliable signal that SRF controls as part of their site architecture. Pattern: `https://www.srf.ch/{category}/...`.

### 2. Three category filters: Sport, Kultur, Wissen

**Decision:** Define three filters matching the SRF feed groups (excluding News):

| Filter ID | Label | URL match | `enabledByDefault` |
|---|---|---|---|
| `srf-filter-sport` | Sport | `/sport/` in link | `true` |
| `srf-filter-kultur` | Kultur | `/kultur/` in link | `true` |
| `srf-filter-wissen` | Wissen | `/wissen/` in link | `true` |

**Rationale:**
- Maps 1:1 to the existing SRF feed groups in settings, making the mental model consistent
- News is excluded because filtering it would make the SRF source nearly useless
- `enabledByDefault: true` preserves current behavior — no change unless user explicitly opts out
- Filter IDs use `srf-filter-` prefix to avoid collision with feed IDs like `srf-sport`

### 3. Match function uses `article.link.includes()`

**Decision:** Use `article.link.includes("/sport/")` rather than a regex or URL parsing.

**Rationale:** Simple, fast, and sufficient. The URL paths are unique enough that `/sport/` won't false-match on non-sport URLs. Consistent with Heise's `startsWith` approach — minimal pattern matching.

## Risks / Trade-offs

- **SRF URL structure changes** → Low risk. SRF has used this URL scheme for years. If it changes, the filters simply stop matching and all articles pass through (safe failure mode). Mitigation: filter tests document the expected URL patterns.
- **Articles with unexpected URL paths** → Some SRF articles may not match any category filter (e.g., `/audio/`, `/meteo/`). These will always be shown. This is the desired behavior — only explicitly defined categories get filter controls.
- **No Wissen URL verification** → Need to verify that Wissen articles actually use `/wissen/` in their URL path. Some may use other paths like `/gesundheit/` or `/natur/`. Mitigation: check actual article URLs during implementation and adjust match logic if needed.
