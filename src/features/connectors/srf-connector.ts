import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

export const srfConnector: Connector = {
  id: "srf",
  name: "SRF",
  language: "de",
  feeds: [
    { id: "srf-latest", name: "Das Neueste", proxyPath: "/api/rss/srf-latest" },
    { id: "srf-switzerland", name: "Schweiz", proxyPath: "/api/rss/srf-switzerland" },
    { id: "srf-international", name: "International", proxyPath: "/api/rss/srf-international" },
    { id: "srf-economy", name: "Wirtschaft", proxyPath: "/api/rss/srf-economy" },
    { id: "srf-sport", name: "Sport", proxyPath: "/api/rss/srf-sport" },
    { id: "srf-football", name: "Fussball", proxyPath: "/api/rss/srf-football" },
    { id: "srf-culture", name: "Kultur", proxyPath: "/api/rss/srf-culture" },
    { id: "srf-technology", name: "Technik", proxyPath: "/api/rss/srf-technology" },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
