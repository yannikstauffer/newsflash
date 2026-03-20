# Mobile-First Development Guidelines

This project follows a **strict mobile-first approach**. All components and features MUST be designed for mobile devices first, then progressively enhanced for larger screens.

## Core Principles

1. **Design for mobile first** — Start with the smallest viewport (320px)
2. **Progressive enhancement** — Add features and complexity for larger screens
3. **Touch-first interactions** — Optimize for touch before mouse/keyboard
4. **Performance priority** — Optimize for mobile networks and devices

## Tailwind CSS Mobile-First Pattern

Tailwind uses mobile-first breakpoints by default. **Base styles apply to mobile, then override for larger screens.**

**Standard breakpoints:**

| Prefix | Min Width | Target |
|--------|-----------|--------|
| _(none)_ | 320px+ | Mobile |
| `sm:` | 640px+ | Large mobile |
| `md:` | 768px+ | Tablet |
| `lg:` | 1024px+ | Desktop |
| `xl:` | 1280px+ | Large desktop |
| `2xl:` | 1536px+ | Extra large |

## Layout Guidelines

### Spacing and Sizing

```tsx
// Mobile-first spacing
<div className="
  p-4 gap-4                   // Mobile: 16px padding and gap
  md:p-6 md:gap-6             // Tablet: 24px
  lg:p-8 lg:gap-8             // Desktop: 32px
">

// Mobile-first container widths
<div className="
  w-full                      // Mobile: full width
  md:max-w-2xl                // Tablet: max 672px
  lg:max-w-4xl                // Desktop: max 896px
">
```

### Grid and Flex Layouts

```tsx
// Mobile: stack vertically, Desktop: grid
<div className="
  flex flex-col gap-4         // Mobile: vertical stack
  lg:grid lg:grid-cols-2      // Desktop: 2-column grid
  lg:gap-8
">

// Mobile: single column, Tablet: 2 cols, Desktop: 3 cols
<div className="
  grid grid-cols-1 gap-4      // Mobile: 1 column
  md:grid-cols-2              // Tablet: 2 columns
  lg:grid-cols-3 lg:gap-6     // Desktop: 3 columns, larger gap
">
```

### Typography

```tsx
// Mobile-first text sizing
<h1 className="
  text-2xl font-bold          // Mobile: 24px
  md:text-3xl                 // Tablet: 30px
  lg:text-4xl                 // Desktop: 36px
">

// Mobile-first line height and spacing
<p className="
  text-sm leading-relaxed     // Mobile: 14px, relaxed line height
  md:text-base                // Tablet: 16px
  lg:text-lg lg:leading-loose // Desktop: 18px, loose line height
">
```

## Touch Target Guidelines

**CRITICAL:** All interactive elements must meet minimum touch target sizes.

```tsx
// Minimum 44px touch target (mobile accessibility)
<button className="
  min-h-[44px] min-w-[44px] p-3  // Minimum 44px x 44px
  md:min-h-[40px]                 // Can be smaller on desktop
">

// Adequate spacing between touch targets
<div className="
  flex gap-4                      // Mobile: 16px gap (safe)
  md:gap-3                        // Desktop: can be tighter
">
```

## Common Mobile-First Patterns

### Navigation

```tsx
// Mobile: hamburger menu, Desktop: horizontal nav
<nav className="
  fixed bottom-0 left-0 right-0 p-4        // Mobile: bottom nav
  md:static md:flex md:items-center        // Desktop: top horizontal
">

// Mobile: full-screen overlay, Desktop: dropdown
<div className="
  fixed inset-0 bg-white                   // Mobile: fullscreen
  md:absolute md:inset-auto md:top-full   // Desktop: dropdown
  md:w-64
">
```

### Cards and Content

```tsx
// Mobile: full width, Desktop: grid
<article className="
  w-full p-4                              // Mobile: full width card
  md:max-w-sm md:rounded-lg md:border    // Tablet: constrained card with border
">

// Mobile: vertical stack, Desktop: horizontal
<div className="
  flex flex-col gap-4                     // Mobile: vertical
  md:flex-row md:items-center            // Desktop: horizontal
">
```

### Forms

```tsx
// Mobile-first form inputs
<input className="
  w-full h-12 px-4 text-base             // Mobile: full width, 48px height, 16px text
  md:h-10 md:text-sm                     // Desktop: smaller
" />

// Mobile: stacked labels, Desktop: inline
<label className="
  flex flex-col gap-2                     // Mobile: vertical
  md:flex-row md:items-center md:gap-4  // Desktop: horizontal
">
```

## Component Development Checklist

When creating components, verify:

- [ ] **Mobile layout works at 320px** — Test at smallest viewport
- [ ] **Touch targets >= 44px** — All buttons, links, inputs are tappable
- [ ] **Content readable without zoom** — Font size >= 16px for body text
- [ ] **No horizontal scroll** — Content fits viewport at all sizes
- [ ] **Breakpoints tested** — Verify behavior at sm, md, lg breakpoints
- [ ] **Images responsive** — Use `w-full h-auto` or responsive `<img>` with `width`/`height` attributes
- [ ] **Forms mobile-friendly** — Large inputs, clear labels, proper input types

## Performance Considerations

- **Lazy load below-the-fold content** — Use `loading="lazy"` on `<img>` elements
- **Optimize images** — Use responsive images with proper `width`/`height` attributes and `srcSet`
- **Minimize client JS** — Prefer lean components, use `React.lazy()` for heavy code
- **Test on 3G networks** — Use Chrome DevTools network throttling

## Testing Mobile-First

Before committing components, test:

### 1. Chrome DevTools Device Mode

- Test at 320px, 375px, 768px, 1024px, 1440px
- Toggle device toolbar (Cmd+Shift+M)

### 2. Touch Interactions

- Enable touch simulation in DevTools
- Verify tap targets are adequate

### 3. Real Devices (when possible)

- Test on actual mobile devices
- Check iOS Safari and Android Chrome

## Common Mistakes to Avoid

```tsx
// WRONG: Desktop-first thinking
<div className="grid grid-cols-3 md:grid-cols-1">

// CORRECT: Mobile-first
<div className="grid grid-cols-1 md:grid-cols-3">

// WRONG: Fixed pixel widths
<div className="w-[800px]">

// CORRECT: Responsive widths
<div className="w-full max-w-4xl">

// WRONG: Tiny touch targets
<button className="p-1 text-xs">

// CORRECT: Adequate touch targets
<button className="p-3 text-sm min-h-[44px]">

// WRONG: Hidden on mobile without reason
<div className="hidden md:block">Important content</div>

// CORRECT: Reflow on mobile, show on all sizes
<div className="md:flex md:items-center">Important content</div>
```
