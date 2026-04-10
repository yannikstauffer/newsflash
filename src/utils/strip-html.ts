/**
 * Strips HTML tags from a string, decodes entities, and collapses whitespace.
 * Uses DOMParser for robust handling of malformed HTML and entity decoding.
 *
 * When `DOMParser` is unavailable (e.g., service worker context), the input is
 * returned unchanged. Callers that run in environments without `DOMParser`
 * must not assume tags are stripped or entities decoded — the main-thread
 * fixup in `useFeedData` re-runs this function once `DOMParser` is available.
 */
export function stripHtml(html: string): string {
  if (!html) {
    return ""
  }

  if (typeof DOMParser === "undefined") {
    return html
  }

  const parsed = new DOMParser().parseFromString(html, "text/html")
  const text = parsed.body.textContent ?? ""
  return text.replaceAll(/\s+/g, " ").trim()
}
