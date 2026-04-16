import { FeedList } from "./feed-list"
import { FeedStatusRow } from "./feed-status-row"
import { FilterBar } from "./filter-bar"
import { useFeedPage } from "../hooks/use-feed-page"

export function FeedPage() {
  const { filterBarProps, feedListProps, lastRefreshedAt } = useFeedPage()

  return (
    <div className="flex flex-col gap-4">
      <FilterBar {...filterBarProps} />

      <FeedStatusRow lastRefreshedAt={lastRefreshedAt} />

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
        pendingCount={feedListProps.pendingCount}
        onAcceptPending={feedListProps.onAcceptPending}
      />
    </div>
  )
}
