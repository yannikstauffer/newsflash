import { parseRss } from "../base-parser"

import type { Connector, NormalizedArticle } from "../types"

export const heiseConnector: Connector = {
  id: "heise",
  name: "Heise",
  language: "de",
  feeds: [
    {
      id: "heise",
      name: "Heise Online",
    },
  ],
  filters: [
    {
      id: "heise-plus",
      label: "heise+ (Bezahlinhalte)",
      enabledByDefault: false,
      match: (article) => article.title.startsWith("heise+ |"),
    },
    {
      id: "heise-angebot",
      label: "heise-Angebot (Werbung)",
      enabledByDefault: true,
      match: (article) => article.title.startsWith("heise-Angebot:"),
    },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
