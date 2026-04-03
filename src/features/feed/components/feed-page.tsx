import { FeedList } from "./feed-list"
import { FilterBar } from "./filter-bar"
import { useFeedPage } from "../hooks/use-feed-page"
import { formatRelativeTime } from "../utils/format-time"

export function FeedPage() {
  const { filterBarProps, feedListProps, lastRefreshedAt } = useFeedPage()

  return (
    <div className="flex flex-col gap-4">
      <FilterBar {...filterBarProps} />

      {lastRefreshedAt && (
        <p className="text-center text-xs text-muted-foreground" aria-label="Last refreshed">
          {`Refreshed ${formatRelativeTime(lastRefreshedAt)}`}
        </p>
      )}

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
