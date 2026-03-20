import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

export const digitecConnector: Connector = {
  id: "digitec",
  name: "Digitec",
  language: "de",
  feeds: [
    {
      id: "digitec",
      name: "Digitec Magazine",
      proxyPath: "/api/rss/digitec",
    },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
