## 1. Data Model

- [ ] 1.1 Add optional `group` field to `FeedConfig` interface in `src/features/connectors/types.ts`
- [ ] 1.2 Update `FeedConfig` unit tests if any exist that validate the interface shape

## 2. SRF Connector & Feed URLs

- [ ] 2.1 Add 18 new SRF feed URLs to `src/config/feeds.ts` (News: srf-news; Sport: srf-ice-hockey, srf-tennis, srf-ski, srf-athletics, srf-motorsport, srf-more-sport; Kultur: srf-film, srf-society, srf-literature, srf-music, srf-art, srf-theater; Wissen: srf-health, srf-sustainability, srf-humanity, srf-nature, srf-knowledge)
- [ ] 2.2 Update `src/config/feeds.test.ts` to expect 32 feeds (was 14) and validate new SRF entries are HTTPS URLs
- [ ] 2.3 Expand SRF connector feeds array in `src/features/connectors/srf-connector.ts` from 8 to 26 feeds, adding `group` property to all feeds (News, Sport, Kultur, Wissen)
- [ ] 2.4 Update `src/features/connectors/connectors.test.ts` to expect 26 SRF feeds and validate group assignments
- [ ] 2.5 Update `src/features/connectors/registry.test.ts` if it asserts total feed counts

## 3. E2E Test Infrastructure

- [ ] 3.1 Add new SRF feed ID mappings in `tests-e2e/helpers/mock-feeds.ts` (can reuse existing `srf.xml` fixture for all SRF feeds)

## 4. Collapsible Group UI

- [ ] 4.1 Create a `FeedGroup` component that renders a collapsible section with: group name header, expand/collapse toggle button with `aria-expanded`, summary count badge ("N/M on"), group-level checkbox with indeterminate state, and individual feed checkboxes when expanded
- [ ] 4.2 Refactor `feed-config-page.tsx` to group connector feeds by `group` property, render `FeedGroup` for grouped feeds, and render ungrouped feeds flat as before
- [ ] 4.3 Manage expand/collapse state with `useState<Set<string>>` (empty set = all collapsed by default)
- [ ] 4.4 Ensure group-level checkbox calls `setAllForSource` with the group's feed IDs (not the entire connector's)
- [ ] 4.5 Ensure source-level (connector) checkbox still toggles all feeds across all groups

## 5. Accessibility & Mobile

- [ ] 5.1 Verify group headers have `aria-expanded`, group content has `role="group"` and `aria-labelledby`
- [ ] 5.2 Ensure 44px minimum touch targets on group headers and checkboxes
- [ ] 5.3 Add keyboard support (Enter/Space) on group header buttons

## 6. Testing

- [ ] 6.1 Write unit tests for `FeedGroup` component: collapsed/expanded rendering, summary count, group checkbox toggle, indeterminate state
- [ ] 6.2 Write unit tests for `feed-config-page.tsx`: grouped vs ungrouped feeds rendering, connector-level toggle with groups
- [ ] 6.3 Run full test suite (`npm run test` and `npm run lint`) and fix any failures
