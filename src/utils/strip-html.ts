/**
 * Strips HTML tags from a string, decodes entities, and collapses whitespace.
 * Uses DOMParser for robust handling of malformed HTML and entity decoding.
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
