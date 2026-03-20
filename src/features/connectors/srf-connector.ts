import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

export const srfConnector: Connector = {
  id: "srf",
  name: "SRF",
  language: "de",
  feeds: [
    { id: "srf-latest", name: "Das Neueste" },
    { id: "srf-switzerland", name: "Schweiz" },
    { id: "srf-international", name: "International" },
    { id: "srf-economy", name: "Wirtschaft" },
    { id: "srf-sport", name: "Sport" },
    { id: "srf-football", name: "Fussball" },
    { id: "srf-culture", name: "Kultur" },
    { id: "srf-technology", name: "Technik" },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
