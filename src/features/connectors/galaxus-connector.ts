import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

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
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
