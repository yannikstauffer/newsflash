# WCAG 2.1 Level AA Accessibility Guidelines

The system **MUST** meet WCAG 2.1 Level AA accessibility standards. All features must be accessible to users with disabilities.

## Alt Text for Images

Every image must have an `alt` attribute. Decorative images use an empty `alt` with `role="presentation"`.

```tsx
// Required — All images must have alt text
<img src="/logo.png" alt="Company logo" />
<img src="/decoration.png" alt="" role="presentation" />

// Violation — Missing alt
<img src="/logo.png" />
```

## Keyboard Accessibility

All interactive elements must be keyboard-operable with a visible focus indicator.

```tsx
// Required — Keyboard accessible with visible focus ring
<button
  onClick={handleClick}
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
  Submit
</button>

// Violation — No visible focus indicator
<button onClick={handleClick} className="outline-none">Submit</button>

// Violation — Div used as button (not focusable, no keyboard events)
<div onClick={handleClick}>Submit</div>
```

### Key expectations

- `Tab` moves focus forward through interactive elements
- `Shift+Tab` moves focus backward
- `Enter` / `Space` activates buttons and links
- `Escape` closes modals, dropdowns, and overlays
- Focus order matches visual order

## Form Labels

Every form input must have a programmatically associated label. Use `aria-invalid` and `aria-describedby` for error states.

```tsx
// Required — All inputs must have labels
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <p id="email-error" role="alert">
    Please enter a valid email
  </p>
)}

// Violation — No label, placeholder is not a substitute
<input type="email" placeholder="Email" />
```

## Semantic HTML

Use native HTML elements for their intended purpose. Avoid `<div>` soup.

```tsx
// Required — Semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>
<main>
  <h1>Page Title</h1>
  <article>Content</article>
</main>

// Violation — Div soup with no semantics
<div className="navigation">
  <div className="nav-item">Home</div>
</div>
```

### Heading hierarchy

- Every page must have exactly one `<h1>`
- Headings must not skip levels (e.g., `<h1>` followed by `<h3>`)
- Use headings to create a logical document outline

## Color Contrast

Text must meet minimum contrast ratios against its background.

| Text type | Minimum ratio |
|-----------|---------------|
| Normal text (< 18px) | 4.5:1 |
| Large text (>= 18px bold or >= 24px) | 3:1 |
| UI components and graphical objects | 3:1 |

```tsx
// Required — High contrast text
<p className="text-gray-900">High contrast text</p>

// Violation — Low contrast
<p className="text-gray-300">Low contrast text on white background</p>
```

### Verification

Use browser DevTools or tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify ratios.

## Touch Targets (Mobile)

All interactive elements must have a minimum 44x44px touch target.

```tsx
// Required — Minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px] p-3">
  <Icon />
</button>

// Violation — Too small
<button className="p-1"><Icon /></button>
```

## ARIA Attributes

Use ARIA only when native HTML semantics are insufficient.

```tsx
// Expandable section
<button aria-expanded={isOpen} aria-controls="panel-1">
  Toggle Details
</button>
<div id="panel-1" role="region" hidden={!isOpen}>
  Details content
</div>

// Live region for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Loading state
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? "Loading..." : content}
</div>
```

## Focus Management

Manage focus when content changes dynamically (modals, route transitions, deletions).

```tsx
import { useRef, useEffect } from "react"

function Modal({ isOpen, onClose, children }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" aria-label="Dialog">
      <button ref={closeRef} onClick={onClose}>
        Close
      </button>
      {children}
    </div>
  )
}
```

## Testing Requirements

### Automated (runs on commit)

- ESLint accessibility checks (30+ rules via `eslint-plugin-jsx-a11y`) — **Pre-commit hook**

### Manual Testing Checklist (before major releases)

- [ ] **Keyboard navigation** — Tab through entire page, verify all interactive elements reachable
- [ ] **Focus indicators** — Visible focus ring on every interactive element
- [ ] **Screen reader** — Test with VoiceOver (macOS) or NVDA (Windows)
- [ ] **Zoom at 200%** — Content remains usable and readable
- [ ] **Color contrast** — Verify with DevTools or contrast checker
- [ ] **Form errors** — Error messages announced by screen readers
- [ ] **Dynamic content** — Live regions announce updates
- [ ] **Heading structure** — Logical hierarchy, no skipped levels

### Playwright Accessibility Audit

Use `@axe-core/playwright` in E2E tests for automated WCAG checks:

```typescript
import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test("page has no accessibility violations", async ({ page }) => {
  await page.goto("/")

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze()

  expect(results.violations).toEqual([])
})
```
