## Context

The filter bar's Row 1 currently wraps "Refreshed X ago" and the article count in a single `<div>` with `gap-1.5`. Both items sit left-aligned, followed by toggle buttons and a mobile search icon. On mobile, this makes the refresh text and article count visually indistinct.

Current DOM structure (simplified):
```
<div.flex.items-center.gap-2>          ← Row 1
  <div.flex.gap-1.5>                   ← status group (left)
    <span>Refreshed 2m ago</span>
    <span>42 articles</span>
  </div>
  <div.flex.gap-2>                     ← toggles
    <Button/> <Button/> <Button/>
  </div>
  <Button class="md:hidden"/>          ← mobile search icon
</div>
```

## Goals / Non-Goals

**Goals:**
- Visually separate "Refreshed..." (left) from article count + filters (right)
- Use responsive spacing: tighter on mobile, wider on desktop
- Maintain correct layout when `lastRefreshedAt` is null

**Non-Goals:**
- Changing Row 2 (day navigation)
- Changing desktop search input behavior
- Modifying any logic or state management

## Decisions

**1. Use `ml-auto` on the right cluster instead of `justify-between` on the parent**

The parent already contains conditionally-rendered children (search overlay vs. normal view). Adding `justify-between` would affect the search-open state too. Applying `ml-auto` to just the right cluster is surgical and self-contained.

**2. Move article count span into the toggles div**

Rather than keeping three sibling groups (refresh, count, toggles), merge count into toggles to form one right-aligned cluster. This keeps the DOM flat and avoids an extra wrapper.

**3. Responsive gap: `gap-1.5 md:gap-3`**

`gap-1.5` (6px) on mobile keeps things compact. `gap-3` (12px) on desktop provides clear visual separation between the article count text and the first button without being excessive.

## Risks / Trade-offs

- **[320px squeeze]** On very narrow screens, the refresh text could get truncated if the right cluster is wide. → The refresh text uses `text-xs` and truncates naturally with flex shrink. Acceptable degradation.
- **[No refresh text]** When `lastRefreshedAt` is null, the left side is empty and the right cluster still pushes right via `ml-auto`. → Correct behavior, no risk.
