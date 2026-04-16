# Spec: `<SettingRow>`

## Location

`src/components/setting-row.tsx`

## Props

```tsx
interface SettingRowProps {
  readonly label: string
  readonly checked: boolean
  readonly onCheckedChange: (checked: boolean) => void
  readonly "aria-label"?: string
}
```

## Markup

```tsx
<div className="flex min-h-11 items-center justify-between md:min-h-0">
  <span className="text-sm text-foreground">{label}</span>
  <Switch
    checked={checked}
    onCheckedChange={onCheckedChange}
    aria-label={ariaLabel ?? label}
  />
</div>
```

## Notes

- Uses `min-h-11` (44px) for WCAG touch target on mobile, collapses on desktop
- The `aria-label` defaults to `label` if not provided, since the label text is usually sufficient

## Replaces

5 identical blocks:

| File | Description |
|---|---|
| `feed-config-page.tsx` lines 272-280 | Ungrouped feed rows |
| `feed-config-page.tsx` lines 296-308 | Filter rows |
| `feed-group.tsx` lines 83-92 | Individual feed rows within a group |

## Test requirements

- Renders label text
- Renders Switch with correct checked state
- Calls onCheckedChange when Switch is toggled
- Uses label as aria-label when no explicit aria-label provided
- Uses explicit aria-label when provided
