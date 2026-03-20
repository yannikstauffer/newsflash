export interface FeedConfig {
  id: string
  name: string
  proxyPath: string
}

export interface Connector {
  id: string
  name: string
  language: "de" | "en"
  feeds: FeedConfig[]
  parse(xml: string): NormalizedArticle[]
}

export interface NormalizedArticle {
  id: string
  title: string
  description: string
  link: string
  publishedAt: Date
  source: string
  language: "de" | "en"
  imageUrl?: string
  category?: string
}
