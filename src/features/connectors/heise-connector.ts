import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

export const heiseConnector: Connector = {
  id: "heise",
  name: "Heise",
  language: "de",
  feeds: [
    {
      id: "heise",
      name: "Heise Online",
      proxyPath: "/api/rss/heise",
    },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
