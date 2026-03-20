## ADDED Requirements

### Requirement: Barrel export as public API surface
The `article-actions` feature SHALL expose a single barrel export (`index.ts`) that re-exports all public components and hooks. External consumers SHALL import from this barrel export.

#### Scenario: FeedPage imports from barrel export
- **WHEN** `FeedPage` (or any external consumer) needs article-actions functionality
- **THEN** it SHALL import from `@/features/article-actions` (the barrel export), not from individual internal paths

#### Scenario: Barrel export includes all public API
- **WHEN** the barrel export is loaded
- **THEN** it SHALL re-export `ArticleActionButtons`, `HiddenArticleActions`, `SwipeableCard`, `useArticleKeyboardShortcuts`, and `useArticleState`

## MODIFIED Requirements

### Requirement: Hide article via swipe right on mobile
On touch devices, swiping an article card to the right SHALL mark it as hidden. The `SwipeableCard` component SHALL pass swipe handler props directly to the gesture handler without redundant `useCallback` wrappers.

#### Scenario: Swipe right hides article
- **WHEN** the user swipes an article card to the right on a touch device
- **THEN** the article SHALL be marked as hidden and removed from the feed (unless "Show hidden" is on)

#### Scenario: Swipe does not trigger navigation
- **WHEN** the user swipes an article card
- **THEN** the browser SHALL NOT navigate to the article's link

#### Scenario: No redundant callback wrappers
- **WHEN** `SwipeableCard` receives `onSwipeRight` and `onSwipeLeft` props
- **THEN** it SHALL use them directly in the gesture handler without wrapping in identity `useCallback`s
