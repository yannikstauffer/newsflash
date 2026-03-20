export const feedUrls: Record<string, string> = {
  digitec: "https://static.digitecgalaxus.ch/feeds/rss/digitec_CH_de.xml",
  galaxus: "https://static.digitecgalaxus.ch/feeds/rss/Galaxus_CH_de.xml",
  "srf-latest": "https://www.srf.ch/news/bnf/rss/19032223",
  "srf-switzerland": "https://www.srf.ch/news/bnf/rss/1890",
  "srf-international": "https://www.srf.ch/news/bnf/rss/1922",
  "srf-economy": "https://www.srf.ch/news/bnf/rss/1926",
  "srf-sport": "https://www.srf.ch/sport/bnf/rss/718",
  "srf-football": "https://www.srf.ch/sport/bnf/rss/2562",
  "srf-culture": "https://www.srf.ch/kultur/bnf/rss/454",
  "srf-technology": "https://www.srf.ch/bnf/rss/19920122",
  winfuture: "https://static.winfuture.de/feeds/WinFuture-News-rss2.0.xml",
  engadget: "https://www.engadget.com/rss.xml",
  heise: "https://www.heise.de/rss/heise-atom.xml",
  ubergizmo: "https://www.ubergizmo.com/feed/",
}

export function feedProxyPath(feedId: string): string {
  return `/api/rss/${feedId}`
}
