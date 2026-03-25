import { parseRss } from "../base-parser"

import type { Connector, NormalizedArticle } from "../types"

const DIGITEC_CATEGORIES = [
  "Produkttest",
  "Hintergrund",
  "Kritik",
  "Meinung",
  "Neu im Sortiment",
  "Ratgeber",
  "Hinter den Kulissen",
] as const

export const digitecConnector: Connector = {
  id: "digitec",
  name: "Digitec",
  language: "de",
  feeds: [
    {
      id: "digitec",
      name: "Digitec Magazine",
    },
  ],
  filters: DIGITEC_CATEGORIES.map((category) => ({
    id: `digitec-${category.toLowerCase().replaceAll(" ", "-")}`,
    label: category,
    enabledByDefault: true,
    match: (article) => article.category === category,
  })),
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
