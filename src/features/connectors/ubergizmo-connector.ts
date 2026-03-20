import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

export const ubergizmoConnector: Connector = {
  id: "ubergizmo",
  name: "Ubergizmo",
  language: "en",
  feeds: [
    {
      id: "ubergizmo",
      name: "Ubergizmo",
      proxyPath: "/api/rss/ubergizmo",
    },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
