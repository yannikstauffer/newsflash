import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

export const engadgetConnector: Connector = {
  id: "engadget",
  name: "Engadget",
  language: "en",
  feeds: [
    {
      id: "engadget",
      name: "Engadget",
      proxyPath: "/api/rss/engadget",
    },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
