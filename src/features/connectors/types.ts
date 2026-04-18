export interface FeedConfig {
  id: string
  name: string
  group?: string
}

export interface ArticleFilter {
  readonly id: string
  readonly label: string
  readonly enabledByDefault: boolean
  readonly match: (article: NormalizedArticle) => boolean
}

export interface Connector {
  id: string
  name: string
  language: "de" | "en"
  feeds: FeedConfig[]
  filters?: readonly ArticleFilter[]
  parse(xml: string): NormalizedArticle[]
}

export interface NormalizedArticle {
  id: string
  title: string
  description: string
  link: string
  publishedAt: Date
  source: string
  feedId?: string
  language: "de" | "en"
  imageUrl?: string
  category?: string
  processed?: boolean
}
