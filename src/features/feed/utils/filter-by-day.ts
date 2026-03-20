import type { NormalizedArticle } from "@/features/connectors/types"

export function filterByDay(
  articles: NormalizedArticle[],
  date: Date,
): NormalizedArticle[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  return articles.filter((article) => {
    const published = article.publishedAt
    return (
      published.getFullYear() === year &&
      published.getMonth() === month &&
      published.getDate() === day
    )
  })
}
