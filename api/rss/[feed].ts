import { feedUrls } from "../../src/config/feeds"

export const config = {
  runtime: "edge",
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const feedId = url.pathname.replace(/^\/api\/rss\//, "")

  const upstreamUrl = Object.hasOwn(feedUrls, feedId)
    ? feedUrls[feedId as keyof typeof feedUrls]
    : undefined
  if (!upstreamUrl) {
    return new Response(JSON.stringify({ error: `Unknown feed: ${feedId}` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const upstream = await fetch(upstreamUrl)

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          error: `Upstream feed failed with status ${upstream.status}`,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const body = await upstream.text()
    const contentType =
      upstream.headers.get("Content-Type") ?? "application/xml"

    return new Response(body, {
      status: 200,
      headers: { "Content-Type": contentType },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: "Upstream feed failed" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
