import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import handler from "./[feed]"

vi.mock("../../src/config/feeds", () => ({
  feedUrls: {
    engadget: "https://www.engadget.com/rss.xml",
    heise: "https://www.heise.de/rss/heise-atom.xml",
  },
}))

describe("feed edge function handler", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("returns upstream RSS content for a valid feed ID", async () => {
    const xmlBody = "<rss><channel></channel></rss>"
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(xmlBody, {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      }),
    )

    const request = new Request("https://example.com/api/rss/engadget")
    const response = await handler(request)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe(xmlBody)
    expect(response.headers.get("Content-Type")).toBe("application/xml")
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://www.engadget.com/rss.xml",
    )
  })

  it("returns 404 for an unknown feed ID", async () => {
    const request = new Request("https://example.com/api/rss/unknown-feed")
    const response = await handler(request)

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toEqual({ error: "Unknown feed: unknown-feed" })
  })

  it("returns 502 when upstream returns non-2xx status", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response("Service Unavailable", { status: 503 }),
    )

    const request = new Request("https://example.com/api/rss/engadget")
    const response = await handler(request)

    expect(response.status).toBe(502)
    const body = await response.json()
    expect(body.error).toContain("Upstream feed failed")
    expect(body.error).toContain("503")
  })

  it("returns 502 when upstream fetch throws a network error", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("Network error"))

    const request = new Request("https://example.com/api/rss/heise")
    const response = await handler(request)

    expect(response.status).toBe(502)
    const body = await response.json()
    expect(body).toEqual({ error: "Upstream feed failed" })
  })

  it("preserves upstream Content-Type header", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response("<feed/>", {
        status: 200,
        headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
      }),
    )

    const request = new Request("https://example.com/api/rss/heise")
    const response = await handler(request)

    expect(response.headers.get("Content-Type")).toBe(
      "application/atom+xml; charset=utf-8",
    )
  })
})
