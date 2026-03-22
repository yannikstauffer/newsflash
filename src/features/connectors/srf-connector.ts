import { parseRss } from "./base-parser"

import type { Connector, NormalizedArticle } from "./types"

export const srfConnector: Connector = {
  id: "srf",
  name: "SRF",
  language: "de",
  feeds: [
    { id: "srf-latest", name: "Das Neueste", group: "News" },
    { id: "srf-switzerland", name: "Schweiz", group: "News" },
    { id: "srf-international", name: "International", group: "News" },
    { id: "srf-economy", name: "Wirtschaft", group: "News" },
    { id: "srf-news", name: "News", group: "News" },
    { id: "srf-sport", name: "Sport", group: "Sport" },
    { id: "srf-football", name: "Fussball", group: "Sport" },
    { id: "srf-ice-hockey", name: "Eishockey", group: "Sport" },
    { id: "srf-tennis", name: "Tennis", group: "Sport" },
    { id: "srf-ski", name: "Ski Alpin", group: "Sport" },
    { id: "srf-athletics", name: "Leichtathletik", group: "Sport" },
    { id: "srf-motorsport", name: "Motorsport", group: "Sport" },
    { id: "srf-more-sport", name: "Mehr Sport", group: "Sport" },
    { id: "srf-culture", name: "Kultur", group: "Kultur" },
    { id: "srf-film", name: "Film & Serien", group: "Kultur" },
    { id: "srf-society", name: "Gesellschaft & Religion", group: "Kultur" },
    { id: "srf-literature", name: "Literatur", group: "Kultur" },
    { id: "srf-music", name: "Musik", group: "Kultur" },
    { id: "srf-art", name: "Kunst", group: "Kultur" },
    { id: "srf-theater", name: "Buehne", group: "Kultur" },
    { id: "srf-knowledge", name: "Wissen", group: "Wissen" },
    { id: "srf-health", name: "Gesundheit", group: "Wissen" },
    { id: "srf-sustainability", name: "Nachhaltigkeit", group: "Wissen" },
    { id: "srf-humanity", name: "Mensch", group: "Wissen" },
    { id: "srf-nature", name: "Natur & Tiere", group: "Wissen" },
    { id: "srf-technology", name: "Technik", group: "Wissen" },
  ],
  parse(xml: string): NormalizedArticle[] {
    return parseRss(xml, this.id, this.language)
  },
}
