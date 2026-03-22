import { useState } from "react"

import { FeedGroup } from "./feed-group"
import { useFeedPreferences } from "../hooks/use-feed-preferences"

import type { LanguagePreference } from "../hooks/use-feed-preferences"
import type { FeedConfig } from "@/features/connectors/types"
import type { ThemePreference } from "@/hooks/use-theme-preference"

import { useArticleState } from "@/features/article-actions/hooks/use-article-state"
import { connectors } from "@/features/connectors/registry"
import { useThemePreference } from "@/hooks/use-theme-preference"

const THEME_OPTIONS: Array<{ readonly value: ThemePreference; readonly label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

const LANGUAGE_OPTIONS: Array<{ readonly value: LanguagePreference; readonly label: string }> = [
  { value: "all", label: "All" },
  { value: "de", label: "DE" },
  { value: "en", label: "EN" },
]

function groupFeedsByGroup(feeds: FeedConfig[]): {
  groups: Map<string, FeedConfig[]>
  ungrouped: FeedConfig[]
} {
  const groups = new Map<string, FeedConfig[]>()
  const ungrouped: FeedConfig[] = []

  for (const feed of feeds) {
    if (feed.group) {
      const existing = groups.get(feed.group)
      if (existing) {
        existing.push(feed)
      } else {
        groups.set(feed.group, [feed])
      }
    } else {
      ungrouped.push(feed)
    }
  }

  return { groups, ungrouped }
}

export default function FeedConfigPage() {
  const {
    isFeedEnabled,
    toggleFeed,
    setAllForSource,
    language,
    setLanguage,
  } = useFeedPreferences()
  const { removeHiddenBySource, removeReadListBySource } = useArticleState()
  const { theme, setTheme } = useThemePreference()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  function handleToggleAllForSource(
    connectorId: string,
    feedIds: string[],
    enable: boolean,
  ) {
    setAllForSource(feedIds, enable)

    if (!enable) {
      removeHiddenBySource(connectorId)
      removeReadListBySource(connectorId)
    }
  }

  function handleToggleGroupExpand(groupKey: string) {
    setExpandedGroups((previous) => {
      const next = new Set(previous)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })
  }

  function handleToggleGroup(
    connectorId: string,
    feedIds: string[],
    enable: boolean,
  ) {
    setAllForSource(feedIds, enable)

    if (!enable) {
      removeHiddenBySource(connectorId)
      removeReadListBySource(connectorId)
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-foreground">Settings</h2>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Language</h3>
        <div
          className="inline-flex rounded-lg border border-border"
          role="radiogroup"
          aria-label="Language preference"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={language === option.value}
              onClick={() => setLanguage(option.value)}
              className={`min-h-[44px] px-4 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg md:min-h-0 md:py-2 ${
                language === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Appearance</h3>
        <div
          className="inline-flex rounded-lg border border-border"
          role="radiogroup"
          aria-label="Theme preference"
        >
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={theme === option.value}
              onClick={() => setTheme(option.value)}
              className={`min-h-[44px] px-4 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg md:min-h-0 md:py-2 ${
                theme === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Sources</h3>
        <div className="divide-y divide-border rounded-lg border border-border">
          {connectors.map((connector) => {
            const allEnabled = connector.feeds.every((feed) =>
              isFeedEnabled(feed.id),
            )
            const someEnabled = connector.feeds.some((feed) =>
              isFeedEnabled(feed.id),
            )

            const { groups, ungrouped } = groupFeedsByGroup(connector.feeds)
            const hasGroups = groups.size > 0

            return (
              <div key={connector.id} className="p-4">
                <div className="flex items-center gap-3">
                  <label className="flex min-h-[44px] cursor-pointer items-center gap-2 md:min-h-0">
                    <input
                      type="checkbox"
                      checked={allEnabled}
                      ref={(element) => {
                        if (element) {
                          element.indeterminate = someEnabled && !allEnabled
                        }
                      }}
                      onChange={() =>
                        handleToggleAllForSource(
                          connector.id,
                          connector.feeds.map((f) => f.id),
                          !allEnabled,
                        )
                      }
                      className="size-4 accent-primary"
                    />
                    <span className="text-base font-semibold text-foreground">
                      {connector.name}
                    </span>
                  </label>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {connector.language.toUpperCase()}
                  </span>
                </div>

                {hasGroups && (
                  <div className="space-y-1">
                    {[...groups.entries()].map(([groupName, feeds]) => {
                      const groupKey = `${connector.id}:${groupName}`
                      return (
                        <FeedGroup
                          key={groupKey}
                          connectorId={connector.id}
                          groupName={groupName}
                          feeds={feeds}
                          isExpanded={expandedGroups.has(groupKey)}
                          isFeedEnabled={isFeedEnabled}
                          onToggleExpand={() =>
                            handleToggleGroupExpand(groupKey)
                          }
                          onToggleFeed={toggleFeed}
                          onToggleGroup={(feedIds, enable) =>
                            handleToggleGroup(connector.id, feedIds, enable)
                          }
                        />
                      )
                    })}
                  </div>
                )}

                {ungrouped.length > 0 && connector.feeds.length > 1 && (
                  <div className="ml-6 mt-2 space-y-1">
                    {ungrouped.map((feed) => (
                      <label
                        key={feed.id}
                        className="flex min-h-[44px] cursor-pointer items-center gap-2 md:min-h-0"
                      >
                        <input
                          type="checkbox"
                          checked={isFeedEnabled(feed.id)}
                          onChange={() => toggleFeed(feed.id)}
                          className="size-4 accent-primary"
                        />
                        <span className="text-sm text-foreground">
                          {feed.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
