## Context

The SRF connector currently declares 8 of 26 available RSS feeds. The settings page renders feeds as a flat checkbox list per connector. Adding 18 more SRF feeds would make the list unwieldy — SRF alone would have 26 checkboxes visible at once.

Current data model: `FeedConfig { id, name }` — no concept of categories. The settings UI iterates `connector.feeds` flat.

## Goals / Non-Goals

**Goals:**
- Add all 26 SRF feeds organized into 4 categories (News, Sport, Kultur, Wissen)
- Make feed groups collapsible in settings (collapsed by default)
- Show summary counts per group (e.g., "2/4 on")
- Provide group-level checkbox to toggle all feeds in a group
- Support grouping across all connectors (not just SRF)

**Non-Goals:**
- Adding more WinFuture topic-specific feeds (only the currently configured ones)
- Persistent collapse state in localStorage (simple UI state, reset on page load is fine)
- Drag-and-drop reordering of feeds or groups
- Nested groups (only one level of grouping)

## Decisions

### 1. Add optional `group` field to `FeedConfig`

```typescript
interface FeedConfig {
  id: string
  name: string
  group?: string  // Groups feeds under a collapsible header
}
```

**Rationale:** Minimal, backward-compatible change. Connectors with single feeds or no logical grouping simply omit the field. The UI derives group structure from the data — no separate group registry needed.

**Alternative considered:** A separate `groups` array on `Connector` with explicit group metadata. Rejected — adds complexity for little benefit. The group name string is sufficient; display order follows array order.

### 2. Group derivation in the UI

The settings page groups feeds by their `group` value:
1. Collect unique group names from `connector.feeds` (preserving first-occurrence order)
2. Feeds without a `group` render flat (ungrouped), as they do today
3. Each group renders as a collapsible section with header checkbox and count

```
feeds = [
  { id: "srf-latest", name: "Das Neueste", group: "News" },
  { id: "srf-switzerland", name: "Schweiz", group: "News" },
  { id: "srf-sport", name: "Sport", group: "Sport" },
  ...
]

→ Groups: ["News", "Sport", "Kultur", "Wissen"]
→ Ungrouped: []
```

**Rationale:** Keeps grouping logic simple — a `Map<string, FeedConfig[]>` built from the feeds array. No new data structures in the connector interface.

### 3. Collapsible UI with `useState` per group

Each group's collapsed state is managed by a local `Set<string>` of expanded group keys (format: `${connectorId}:${groupName}`). All groups start collapsed (empty set).

```typescript
const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
```

**Rationale:** No external state library needed. Collapse state is ephemeral — users won't frequently switch between settings configurations, so resetting on page load is acceptable.

**Alternative considered:** Storing collapse state in localStorage. Rejected — over-engineering for a settings page visited infrequently.

### 4. Group-level checkbox with indeterminate state

Each group header has a checkbox:
- **Checked** when all feeds in the group are enabled
- **Indeterminate** when some (but not all) feeds are enabled
- **Unchecked** when no feeds are enabled

Clicking the group checkbox toggles all feeds in that group. Uses the existing `setAllForSource` from `useFeedPreferences` — it already accepts arbitrary feed ID arrays.

### 5. Summary count badge

Each collapsed group header shows `"N/M on"` where N = enabled feeds in group, M = total feeds in group. This gives users at-a-glance information without expanding.

### 6. SRF feed ID naming convention

New feed IDs follow the existing `srf-` prefix pattern:

| Category | Feed | ID |
|----------|------|----|
| News | News (General) | `srf-news` |
| Sport | Eishockey | `srf-ice-hockey` |
| Sport | Tennis | `srf-tennis` |
| Sport | Ski Alpin | `srf-ski` |
| Sport | Leichtathletik | `srf-athletics` |
| Sport | Motorsport | `srf-motorsport` |
| Sport | Mehr Sport | `srf-more-sport` |
| Kultur | Film & Serien | `srf-film` |
| Kultur | Gesellschaft & Religion | `srf-society` |
| Kultur | Literatur | `srf-literature` |
| Kultur | Musik | `srf-music` |
| Kultur | Kunst | `srf-art` |
| Kultur | Buehne | `srf-theater` |
| Wissen | Gesundheit | `srf-health` |
| Wissen | Nachhaltigkeit | `srf-sustainability` |
| Wissen | Mensch | `srf-humanity` |
| Wissen | Natur & Tiere | `srf-nature` |
| Wissen | Wissen (General) | `srf-knowledge` |

English IDs for consistency with the codebase convention (existing IDs are `srf-switzerland`, `srf-football`, etc.).

### 7. Group assignments for other connectors

- **Digitec** (1 feed): no group needed
- **Galaxus** (1 feed): no group needed
- **WinFuture** (1 feed): no group needed
- **Engadget** (1 feed): no group needed
- **Heise** (1 feed): no group needed
- **Ubergizmo** (1 feed): no group needed

Currently only SRF has multiple feeds. The infrastructure supports groups for any connector, but single-feed connectors don't need them. If WinFuture or others gain sub-feeds later, they can simply add `group` to their feed configs.

### 8. Accessibility

- Group headers are `<button>` elements with `aria-expanded`
- Group content uses `role="group"` with `aria-labelledby` pointing to the header
- Chevron icon rotates on expand (visual indicator)
- Group checkbox is a standard `<input type="checkbox">` with `indeterminate` support
- All interactive elements maintain 44px minimum touch targets

## Risks / Trade-offs

- **[Risk] 18 new feed URLs may have changed or become unavailable** → Feed URLs from `.tmp/rss.md` research (2026-03-20). The proxy already handles upstream failures gracefully (502). Individual broken feeds won't affect others.

- **[Risk] New SRF feeds default to enabled, increasing initial load** → All feeds default to enabled per existing spec. Users who find the initial feed overwhelming can collapse groups and disable unwanted feeds. This matches the existing behavior — no change to the default-enabled policy.

- **[Trade-off] Collapse state is ephemeral** → Groups reset to collapsed on page reload. Acceptable for a settings page. If users complain, localStorage persistence can be added later with minimal effort.

- **[Trade-off] Group names are display strings, not IDs** → The group field is a human-readable string used both as a grouping key and display label. This is simpler but means renaming a group requires updating all feeds. Acceptable since group names change very rarely and are confined to a single connector file.
