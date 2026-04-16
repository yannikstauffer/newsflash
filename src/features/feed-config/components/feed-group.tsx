import { useId } from "react"
import { useTranslation } from "react-i18next"

import type { FeedConfig } from "@/features/connectors/types"

import { SettingRow } from "@/components/setting-row"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface FeedGroupProps {
  readonly connectorId: string // nosonar typescript:S6767
  readonly groupName: string
  readonly feeds: readonly FeedConfig[]
  readonly isExpanded: boolean
  readonly isFeedEnabled: (feedId: string) => boolean
  readonly onToggleExpand: () => void
  readonly onToggleFeed: (feedId: string) => void
  readonly onToggleGroup: (feedIds: string[], enable: boolean) => void
}

export function FeedGroup({
  groupName,
  feeds,
  isExpanded,
  isFeedEnabled,
  onToggleExpand,
  onToggleFeed,
  onToggleGroup,
}: FeedGroupProps) {
  const { t } = useTranslation()
  const headerId = useId()
  const groupId = useId()

  const enabledCount = feeds.filter((feed) => isFeedEnabled(feed.id)).length
  const totalCount = feeds.length
  const allEnabled = enabledCount === totalCount

  function handleGroupToggleChange(checked: boolean) {
    const feedIds = feeds.map((feed) => feed.id)
    onToggleGroup(feedIds, checked)
  }

  return (
    <div className="ml-6 mt-2">
      <div className="flex items-center gap-2">
        <button
          id={headerId}
          type="button"
          aria-expanded={isExpanded}
          aria-controls={groupId}
          onClick={onToggleExpand}
          className="flex min-h-11 flex-1 items-center gap-2 text-left md:min-h-0"
        >
          <svg
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-90",
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-sm font-medium text-foreground">
            {groupName}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {t("feedConfig.enabledCount", { enabled: enabledCount, total: totalCount })}
          </span>
        </button>
        <Switch
          checked={allEnabled}
          onCheckedChange={handleGroupToggleChange}
          aria-label={t("feedConfig.toggleAllFeeds", { groupName })}
        />
      </div>

      {isExpanded && (
        <div
          id={groupId}
          role="group"
          aria-labelledby={headerId}
          className="ml-6 mt-1 space-y-1"
        >
          {feeds.map((feed) => (
            <SettingRow
              key={feed.id}
              label={feed.name}
              checked={isFeedEnabled(feed.id)}
              onCheckedChange={() => onToggleFeed(feed.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
