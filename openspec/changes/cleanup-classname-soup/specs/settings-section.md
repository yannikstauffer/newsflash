# Spec: `<SettingsSection>`

## Location

`src/components/settings-section.tsx`

## Props

```tsx
interface SettingsSectionProps {
  readonly title: string
  readonly description?: string
  readonly headerAction?: ReactNode
  readonly children: ReactNode
  readonly "aria-label"?: string
  readonly "data-testid"?: string
}
```

## Markup

```tsx
<section
  className="space-y-3 rounded-lg border border-border p-6"
  aria-label={ariaLabel}
  data-testid={dataTestId}
>
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {headerAction}
  </div>
  {children}
</section>
```

## Usage examples

**Basic (language, appearance, sync, install sections):**
```tsx
<SettingsSection title={t("settings.language")} description={t("settings.languageDescription")}>
  <SegmentedControl ... />
</SettingsSection>
```

**With header action (sources section):**
```tsx
<SettingsSection
  title={t("settings.sources")}
  description={t("settings.sourcesDescription")}
  headerAction={
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={handleEnableAll}>{t("settings.enableAll")}</Button>
      <Button variant="ghost" size="sm" onClick={handleDisableAll}>{t("settings.disableAll")}</Button>
    </div>
  }
>
  ...
</SettingsSection>
```

## Replaces

6 identical `<section className="space-y-3 rounded-lg border border-border p-6">` blocks:
- `feed-config-page.tsx` lines 136, 165, 197, 319
- `sync-settings.tsx` lines 54-55, 172-173

## Test requirements

- Renders title
- Renders description when provided, omits when not
- Renders headerAction when provided
- Renders children
- Passes aria-label and data-testid through
