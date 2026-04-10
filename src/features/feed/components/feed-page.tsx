import { FeedList } from "./feed-list"
import { FilterBar } from "./filter-bar"
import { useFeedPage } from "../hooks/use-feed-page"
import { formatRelativeTime } from "../utils/format-time"

import { InstallBanner } from "@/components/install-banner"
import { LastSyncedIndicator } from "@/components/last-synced-indicator"

export function FeedPage() {
  const { filterBarProps, feedListProps, lastRefreshedAt } = useFeedPage()

  return (
    <div className="flex flex-col gap-4">
      <InstallBanner />
      <FilterBar {...filterBarProps} />

      {lastRefreshedAt && (
        <p className="text-center text-xs text-muted-foreground" aria-label="Last refreshed">
          {`Refreshed ${formatRelativeTime(lastRefreshedAt)}`}
        </p>
      )}

      <LastSyncedIndicator />

      <FeedList
        articles={feedListProps.filteredArticles}
        loading={feedListProps.loading}
        errors={feedListProps.errors}
        hiddenIds={feedListProps.hiddenIds}
        showHidden={feedListProps.showHidden}
        renderActions={feedListProps.renderActions}
        renderWrapper={feedListProps.renderWrapper}
        emptyMessage={feedListProps.emptyMessage}
        onRefresh={feedListProps.onRefresh}
      />
    </div>
  )
}
