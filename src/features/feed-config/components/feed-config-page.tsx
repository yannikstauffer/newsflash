import { useFeedPreferences } from "../hooks/use-feed-preferences"

import { connectors } from "@/features/connectors/registry"

export function FeedConfigPage() {
  const { isFeedEnabled, toggleFeed, setAllForSource } = useFeedPreferences()

  return (
    <div className="space-y-6">
      {connectors.map((connector) => {
        const allEnabled = connector.feeds.every((feed) =>
          isFeedEnabled(feed.id),
        )
        const someEnabled = connector.feeds.some((feed) =>
          isFeedEnabled(feed.id),
        )

        return (
          <section key={connector.id} className="space-y-2">
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
                    setAllForSource(
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
              <span className="text-xs text-muted-foreground">
                {connector.language.toUpperCase()}
              </span>
            </div>

            {connector.feeds.length > 1 && (
              <div className="ml-6 space-y-1">
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
                    <span className="text-sm text-foreground">{feed.name}</span>
                  </label>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
