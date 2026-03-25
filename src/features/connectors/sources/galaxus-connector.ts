import { parseRss } from "../base-parser"

import type { Connector, NormalizedArticle } from "../types"

const GALAXUS_CATEGORIES = [
  "Produkttest",
  "Hintergrund",
  "Kritik",
  "Meinung",
  "Neu im Sortiment",
  "Ratgeber",
  "Hinter den Kulissen",
] as const

export const galaxusConnector: Connector = {
  id: "galaxus",
  name: "Galaxus",
  language: "de",
  feeds: [
    {
      id: "galaxus",
      name: "Galaxus Magazine",
    },
  ],
  filters: GALAXUS_CATEGORIES.map((category) => ({
    id: `galaxus-${category.toLowerCase().replaceAll(" ", "-")}`,
    label: category,
    enabledByDefault: true,
    match: (article) => article.category === category,
  })),
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
