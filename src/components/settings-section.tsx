import type { ReactNode } from "react"

interface SettingsSectionProps {
  readonly title: string
  readonly description?: string
  readonly headerAction?: ReactNode
  readonly children: ReactNode
  readonly "aria-label"?: string
  readonly "data-testid"?: string
}

export function SettingsSection({
  title,
  description,
  headerAction,
  children,
  "aria-label": ariaLabel,
  "data-testid": testId,
}: SettingsSectionProps) {
  return (
    <section
      className="space-y-3 rounded-lg border border-border p-6"
      aria-label={ariaLabel}
      data-testid={testId}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
  )
}
