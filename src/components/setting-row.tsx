import { Switch } from "@/components/ui/switch"

interface SettingRowProps {
  readonly label: string
  readonly checked: boolean
  readonly onCheckedChange: (checked: boolean) => void
  readonly "aria-label"?: string
}

export function SettingRow({
  label,
  checked,
  onCheckedChange,
  "aria-label": ariaLabel,
}: SettingRowProps) {
  return (
    <div className="flex min-h-11 items-center justify-between md:min-h-0">
      <span className="text-sm text-foreground">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={ariaLabel ?? label}
      />
    </div>
  )
}
