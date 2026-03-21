import { useFeedPreferences } from "../hooks/use-feed-preferences"

import type { LanguagePreference } from "../hooks/use-feed-preferences"

import { useArticleState } from "@/features/article-actions/hooks/use-article-state"
import { connectors } from "@/features/connectors/registry"
import { useThemePreference } from "@/hooks/use-theme-preference"

const LANGUAGE_OPTIONS: Array<{ readonly value: LanguagePreference; readonly label: string }> = [
  { value: "all", label: "All" },
  { value: "de", label: "DE" },
  { value: "en", label: "EN" },
]

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
          {(["light", "dark"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={theme === option}
              onClick={() => setTheme(option)}
              className={`min-h-[44px] px-4 text-sm font-medium capitalize transition-colors first:rounded-l-lg last:rounded-r-lg md:min-h-0 md:py-2 ${
                theme === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {option}
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

                {connector.feeds.length > 1 && (
                  <div className="ml-6 mt-2 space-y-1">
                    {connector.feeds.map((feed) => (
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
