import path from "path"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const feedTargets: Record<string, string> = {
  "digitec": "https://static.digitecgalaxus.ch/feeds/rss/digitec_CH_de.xml",
  "galaxus": "https://static.digitecgalaxus.ch/feeds/rss/Galaxus_CH_de.xml",
  "srf-latest": "https://www.srf.ch/news/bnf/rss/19032223",
  "srf-switzerland": "https://www.srf.ch/news/bnf/rss/1890",
  "srf-international": "https://www.srf.ch/news/bnf/rss/1922",
  "srf-economy": "https://www.srf.ch/news/bnf/rss/1926",
  "srf-sport": "https://www.srf.ch/sport/bnf/rss/718",
  "srf-football": "https://www.srf.ch/sport/bnf/rss/2562",
  "srf-culture": "https://www.srf.ch/kultur/bnf/rss/454",
  "srf-technology": "https://www.srf.ch/bnf/rss/19920122",
  "winfuture": "https://static.winfuture.de/feeds/WinFuture-News-rss2.0.xml",
  "engadget": "https://www.engadget.com/rss.xml",
  "heise": "https://www.heise.de/rss/heise-atom.xml",
  "ubergizmo": "https://www.ubergizmo.com/feed/",
}

function buildProxyConfig() {
  const proxy: Record<string, object> = {}
  for (const [id, target] of Object.entries(feedTargets)) {
    const targetUrl = new URL(target)
    proxy[`/api/rss/${id}`] = {
      target: `${targetUrl.protocol}//${targetUrl.host}`,
      changeOrigin: true,
      rewrite: () => targetUrl.pathname,
    }
  }
  return proxy
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: buildProxyConfig(),
  },
})
