## ADDED Requirements

### Requirement: Action buttons visible on keyboard focus
The article action buttons (hide, save) SHALL become visible when the article card or any focusable element within it receives keyboard focus, using the `group-focus-within` CSS variant.

#### Scenario: Focus on article card reveals action buttons
- **WHEN** a keyboard user tabs to an article card (which has `tabindex="0"`)
- **THEN** the hide and save action buttons SHALL become visible, identical to the hover-revealed state

#### Scenario: Focus on inner link reveals action buttons
- **WHEN** a keyboard user tabs to the article title link inside a card
- **THEN** the action buttons SHALL become visible via `focus-within` propagation

#### Scenario: Blur hides action buttons
- **WHEN** focus leaves the article card and all its children
- **THEN** the action buttons SHALL be hidden (unless the card is being hovered)

### Requirement: Article cards are focusable
Each article card SHALL be focusable via `tabindex="0"` so keyboard users can navigate to it using the Tab key. The card SHALL display a visible focus indicator (focus ring) that meets WCAG 2.4.7.

#### Scenario: Tab navigates to article card
- **WHEN** a keyboard user presses Tab
- **THEN** article cards SHALL receive focus in document order with a visible focus ring

#### Scenario: Focus ring is visible
- **WHEN** an article card receives focus
- **THEN** a focus ring SHALL be displayed using the design system's ring color token with at least 2px width

### Requirement: Keyboard shortcuts work on focused article
The H and S keyboard shortcuts SHALL work on the currently focused article card, not only the hovered one. If an article has keyboard focus, it SHALL take priority over any hovered article for shortcut resolution.

#### Scenario: H key hides focused article
- **WHEN** a keyboard user focuses an article card and presses H
- **THEN** the focused article SHALL be hidden, even if a different article is being hovered by the mouse

#### Scenario: S key saves focused article
- **WHEN** a keyboard user focuses an article card and presses S
- **THEN** the focused article SHALL be added to or removed from the read list

#### Scenario: Hovered article is used as fallback
- **WHEN** no article card has keyboard focus and the user hovers an article with the mouse and presses H or S
- **THEN** the hovered article SHALL be used for the shortcut (existing behavior preserved)

### Requirement: Action buttons always visible on touch devices
On devices without hover capability (`@media (hover: none)`), the action buttons SHALL be displayed permanently in a compact layout without requiring hover or focus.

#### Scenario: Touch device shows buttons without interaction
- **WHEN** an article card is rendered on a device where `@media (hover: none)` matches
- **THEN** the hide and save action buttons SHALL be visible immediately without any user interaction

#### Scenario: Compact layout on touch devices
- **WHEN** action buttons are always visible on a touch device
- **THEN** the buttons SHALL use a compact presentation that does not significantly increase the card height

## MODIFIED Requirements

### Requirement: Hide article via hover button on desktop
On desktop, hovering over an article card SHALL reveal a hide button. Clicking it SHALL mark the article as hidden. The hide button SHALL also be revealed when the article card receives keyboard focus.

#### Scenario: Hover reveals hide button
- **WHEN** the user hovers over an article card on desktop
- **THEN** a hide button SHALL become visible

#### Scenario: Focus reveals hide button
- **WHEN** a keyboard user focuses an article card on desktop
- **THEN** a hide button SHALL become visible

#### Scenario: Clicking hide button hides article
- **WHEN** the user clicks the hide button
- **THEN** the article SHALL be marked as hidden and the click SHALL NOT navigate to the article

### Requirement: Save to Read List via hover button on desktop
On desktop, hovering over an article card SHALL reveal a save/bookmark button. Clicking it SHALL add the article to the Read List. The save button SHALL also be revealed when the article card receives keyboard focus.

#### Scenario: Hover reveals save button
- **WHEN** the user hovers over an article card on desktop
- **THEN** a save/bookmark button SHALL become visible

#### Scenario: Focus reveals save button
- **WHEN** a keyboard user focuses an article card on desktop
- **THEN** a save/bookmark button SHALL become visible

#### Scenario: Clicking save button adds to Read List
- **WHEN** the user clicks the save button
- **THEN** the article SHALL be added to the Read List and the click SHALL NOT navigate to the article

### Requirement: Hide article via keyboard shortcut
Pressing `H` while an article is focused or hovered SHALL mark it as hidden. Focused article takes priority over hovered article.

#### Scenario: H key hides focused article
- **WHEN** the user presses `H` while an article card is focused
- **THEN** the article SHALL be marked as hidden

#### Scenario: H key hides hovered article as fallback
- **WHEN** the user presses `H` while no article is focused but an article card is hovered
- **THEN** the hovered article SHALL be marked as hidden

### Requirement: Save to Read List via keyboard shortcut
Pressing `S` while an article is focused or hovered SHALL add it to the Read List. Focused article takes priority over hovered article.

#### Scenario: S key saves focused article
- **WHEN** the user presses `S` while an article card is focused
- **THEN** the article SHALL be added to the Read List

#### Scenario: S key saves hovered article as fallback
- **WHEN** the user presses `S` while no article is focused but an article card is hovered
- **THEN** the hovered article SHALL be added to the Read List
