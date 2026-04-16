import { Download, Share } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { FeedGroup } from "./feed-group"
import { useFeedPreferences } from "../hooks/use-feed-preferences"
import { useFilterPreferences } from "../hooks/use-filter-preferences"

import type { FeedConfig } from "@/features/connectors/types"
import type { ThemePreference } from "@/hooks/use-theme-preference"

import { SegmentedControl } from "@/components/segmented-control"
import { SettingRow } from "@/components/setting-row"
import { SettingsSection } from "@/components/settings-section"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useArticleState } from "@/features/article-actions/hooks/use-article-state"
import { connectors } from "@/features/connectors/registry"
import { SyncSettings } from "@/features/sync/components/sync-settings"
import { useInstallPrompt } from "@/hooks/use-install-prompt"
import { useIsStandalone } from "@/hooks/use-is-standalone"
import { useThemePreference } from "@/hooks/use-theme-preference"

const THEME_OPTIONS: ReadonlyArray<{ readonly value: ThemePreference; readonly label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

const LOCALE_OPTIONS: ReadonlyArray<{ readonly value: "de" | "en"; readonly label: string }> = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
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
  const { t, i18n } = useTranslation()
  const {
    isFeedEnabled,
    toggleFeed,
    setAllForSource,
    enableAll,
    disableAll,
  } = useFeedPreferences()
  const { isFilterEnabled, toggleFilter } = useFilterPreferences()
  const { removeHiddenBySource, removeReadListBySource } = useArticleState()
  const { theme, setTheme } = useThemePreference()
  const isStandalone = useIsStandalone()
  const { canInstall, isIosSafari, triggerInstall } = useInstallPrompt()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const currentLocale: "de" | "en" = i18n.language.startsWith("de") ? "de" : "en"

  const allFeedIds = connectors.flatMap((connector) =>
    connector.feeds.map((feed) => feed.id),
  )

  function handleLocaleChange(locale: "de" | "en") {
    i18n.changeLanguage(locale)
  }

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

  function handleEnableAll() {
    enableAll(allFeedIds)
  }

  function handleDisableAll() {
    disableAll(allFeedIds)
    for (const connector of connectors) {
      removeHiddenBySource(connector.id)
      removeReadListBySource(connector.id)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">{t("settings.heading")}</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingsSection
          title={t("settings.language")}
          description={t("settings.languageDescription")}
        >
          <SegmentedControl
            value={currentLocale}
            onChange={handleLocaleChange}
            options={LOCALE_OPTIONS}
            aria-label={t("settings.languagePreference")}
          />
        </SettingsSection>

        <SettingsSection
          title={t("settings.appearance")}
          description={t("settings.appearanceDescription")}
        >
          <SegmentedControl
            value={theme}
            onChange={setTheme}
            options={THEME_OPTIONS}
            aria-label={t("settings.appearance")}
          />
        </SettingsSection>
      </div>

      <SyncSettings />

      <SettingsSection
        title={t("settings.sources")}
        description={t("settings.sourcesDescription")}
        headerAction={
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleEnableAll}>
              {t("settings.enableAll")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisableAll}>
              {t("settings.disableAll")}
            </Button>
          </div>
        }
      >
        <div className="divide-y divide-border rounded-lg border border-border">
          {connectors.map((connector) => {
            const allEnabled = connector.feeds.every((feed) =>
              isFeedEnabled(feed.id),
            )

            const { groups, ungrouped } = groupFeedsByGroup(connector.feeds)
            const hasGroups = groups.size > 0

            return (
              <div key={connector.id} className="p-4">
                <div className="flex min-h-[44px] items-center justify-between md:min-h-0">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-foreground">
                      {connector.name}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {connector.language.toUpperCase()}
                    </span>
                  </div>
                  <Switch
                    checked={allEnabled}
                    onCheckedChange={(checked) =>
                      handleToggleAllForSource(
                        connector.id,
                        connector.feeds.map((f) => f.id),
                        checked,
                      )
                    }
                    aria-label={connector.name}
                  />
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
                      <SettingRow
                        key={feed.id}
                        label={feed.name}
                        checked={isFeedEnabled(feed.id)}
                        onCheckedChange={() => toggleFeed(feed.id)}
                      />
                    ))}
                  </div>
                )}

                {connector.filters && connector.filters.length > 0 && (
                  <div className="ml-6 mt-3 space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("settings.filters")}
                    </span>
                    {connector.filters.map((filter) => (
                      <SettingRow
                        key={filter.id}
                        label={filter.label}
                        checked={isFilterEnabled(filter.id, filter.enabledByDefault)}
                        onCheckedChange={() =>
                          toggleFilter(filter.id, filter.enabledByDefault)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SettingsSection>

      {!isStandalone && (canInstall || isIosSafari) && (
        <SettingsSection
          title={t("install.settingsHeading")}
          description={t("install.settingsDescription")}
        >
          {canInstall ? (
            <Button onClick={triggerInstall}>
              <Download className="size-4" aria-hidden="true" />
              {t("install.settingsInstallButton")}
            </Button>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Share className="size-4 shrink-0" aria-hidden="true" />
              {t("install.settingsIosInstructions")}
            </p>
          )}
        </SettingsSection>
      )}
    </div>
  )
}
