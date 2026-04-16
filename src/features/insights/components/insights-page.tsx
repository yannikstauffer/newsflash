import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useInsightsData } from "../hooks/use-insights-data"

import type { FilterInsight, SourceInsight } from "../hooks/use-insights-data"

import { cn } from "@/lib/utils"

// --- Badge ---

interface RecommendationBadgeProps {
  readonly variant: "disable" | "enable"
  readonly children: string
}

function RecommendationBadge({ variant, children }: RecommendationBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "disable"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      )}
      data-testid="recommendation-badge"
    >
      {variant === "disable"
        ? <TrendingDown className="size-3" aria-hidden="true" />
        : <TrendingUp className="size-3" aria-hidden="true" />}
      {children}
    </span>
  )
}

// --- Not enough data ---

function NotEnoughData() {
  const { t } = useTranslation()
  return (
    <span
      className="text-xs text-muted-foreground italic"
      data-testid="not-enough-data"
    >
      {t("insights.notEnoughData")}
    </span>
  )
}

// --- Source insight card ---

interface SourceInsightCardProps {
  readonly insight: SourceInsight
}

function SourceInsightCard({ insight }: SourceInsightCardProps) {
  const { t } = useTranslation()

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 space-y-2"
      data-testid="source-insight-card"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm">{insight.sourceName}</h3>
        <div className="flex flex-wrap gap-1 justify-end">
          {insight.recommendDisable && (
            <RecommendationBadge variant="disable">
              {t("insights.considerDisabling")}
            </RecommendationBadge>
          )}
          {insight.noRecentArticles && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
              data-testid="no-recent-articles-badge"
            >
              <AlertTriangle className="size-3" aria-hidden="true" />
              {t("insights.noRecentArticles")}
            </span>
          )}
        </div>
      </div>

      {insight.hasEnoughData ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-4 text-sm text-muted-foreground">
          <div>
            <dt className="text-xs uppercase tracking-wide">{t("insights.appeared")}</dt>
            <dd className="font-medium text-foreground" data-testid="source-appeared">{insight.appeared}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide">{t("insights.hidden")}</dt>
            <dd className="font-medium text-foreground" data-testid="source-hidden">{insight.hidden}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide">{t("insights.saved")}</dt>
            <dd className="font-medium text-foreground" data-testid="source-saved">{insight.saved}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide">{t("insights.hideRate")}</dt>
            <dd className="font-medium text-foreground" data-testid="source-hide-rate">
              {Math.round(insight.hideRate * 100)}%
            </dd>
          </div>
        </dl>
      ) : (
        <NotEnoughData />
      )}
    </div>
  )
}

// --- Filter insight card ---

interface FilterInsightCardProps {
  readonly insight: FilterInsight
}

function FilterInsightCard({ insight }: FilterInsightCardProps) {
  const { t } = useTranslation()

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 space-y-2"
      data-testid="filter-insight-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-sm">{insight.filterLabel}</h3>
          <p className="text-xs text-muted-foreground">{insight.sourceName}</p>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {insight.recommendEnable && (
            <RecommendationBadge variant="enable">
              {t("insights.considerEnabling")}
            </RecommendationBadge>
          )}
          {insight.recommendDisable && (
            <RecommendationBadge variant="disable">
              {t("insights.considerDisabling")}
            </RecommendationBadge>
          )}
        </div>
      </div>

      {insight.appeared > 0 ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 text-sm text-muted-foreground">
          <div>
            <dt className="text-xs uppercase tracking-wide">{t("insights.matched")}</dt>
            <dd className="font-medium text-foreground" data-testid="filter-appeared">{insight.appeared}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide">{t("insights.hidden")}</dt>
            <dd className="font-medium text-foreground" data-testid="filter-hidden">{insight.hidden}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide">{t("insights.saved")}</dt>
            <dd className="font-medium text-foreground" data-testid="filter-saved">{insight.saved}</dd>
          </div>
        </dl>
      ) : (
        <span className="text-xs text-muted-foreground italic" data-testid="no-matching-articles">
          {t("insights.noMatchingArticles")}
        </span>
      )}
    </div>
  )
}

// --- Empty state ---

function InsightsEmptyState() {
  const { t } = useTranslation()
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center gap-3"
      data-testid="insights-empty-state"
    >
      <TrendingUp className="size-10 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="font-medium">{t("insights.emptyTitle")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("insights.emptyDescription")}</p>
      </div>
    </div>
  )
}

// --- Insights page ---

export default function InsightsPage() {
  const { t } = useTranslation()
  const { sources, filters, hasData } = useInsightsData()

  return (
    <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">{t("insights.heading")}</h1>

      {hasData ? (
        <>
          {sources.length > 0 && (
            <section aria-label={t("insights.sourcesSection")}>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                {t("insights.sourcesSection")}
              </h2>
              <div className="space-y-3">
                {sources.map((insight) => (
                  <SourceInsightCard key={insight.sourceId} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {filters.length > 0 && (
            <section aria-label={t("insights.filtersSection")}>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                {t("insights.filtersSection")}
              </h2>
              <div className="space-y-3">
                {filters.map((insight) => (
                  <FilterInsightCard key={insight.filterId} insight={insight} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <InsightsEmptyState />
      )}
    </div>
  )
}
