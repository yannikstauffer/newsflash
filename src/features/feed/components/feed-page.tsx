import { FeedList } from "./feed-list"
import { FilterBar } from "./filter-bar"
import { useFeedPage } from "../hooks/use-feed-page"

export function FeedPage() {
  const { filterBarProps, feedListProps } = useFeedPage()

  return (
    <div className="space-y-4">
      <FilterBar {...filterBarProps} />

      <FeedList
        articles={feedListProps.filteredArticles}
        loading={feedListProps.loading}
        errors={feedListProps.errors}
        hiddenIds={feedListProps.hiddenIds}
        showHidden={feedListProps.showHidden}
        renderActions={feedListProps.renderActions}
        renderWrapper={feedListProps.renderWrapper}
        emptyMessage={feedListProps.emptyMessage}
      />
    </div>
  )
}
