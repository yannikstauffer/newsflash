import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

export const winfutureConnector: Connector = {
  id: "winfuture",
  name: "WinFuture",
  language: "de",
  feeds: [
    {
      id: "winfuture",
      name: "WinFuture News",
    },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
