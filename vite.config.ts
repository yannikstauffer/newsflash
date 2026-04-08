import path from "path"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

import { feedUrls } from "./src/config/feeds"

function buildProxyConfig() {
  const proxy: Record<string, object> = {}
  for (const [id, target] of Object.entries(feedUrls)) {
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
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: buildProxyConfig(),
  },
})
