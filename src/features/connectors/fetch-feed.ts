export async function fetchFeed(proxyPath: string): Promise<string> {
  const response = await fetch(proxyPath)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch feed ${proxyPath}: ${response.status} ${response.statusText}`,
    )
  }

  return response.text()
}
