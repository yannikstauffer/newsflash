import type { Page } from "@playwright/test"

/**
 * Clears all localStorage to ensure deterministic test state.
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear())
}

/**
 * Seeds a specific localStorage key with a value.
 */
export async function seedLocalStorage(
  page: Page,
  key: string,
  value: unknown,
): Promise<void> {
  await page.evaluate(
    ({ k, v }) => localStorage.setItem(k, JSON.stringify(v)),
    { k: key, v: value },
  )
}

/**
 * Seeds feed preferences in localStorage.
 */
export async function seedFeedPreferences(
  page: Page,
  preferences: Record<string, boolean | string>,
): Promise<void> {
  await seedLocalStorage(page, "newsflash:feed-prefs", preferences)
}

/**
 * Seeds the read list in localStorage.
 */
export async function seedReadList(
  page: Page,
  articles: Array<{
    id: string
    title: string
    description: string
    link: string
    publishedAt: string
    source: string
    language: "de" | "en"
    imageUrl?: string
    category?: string
  }>,
): Promise<void> {
  await seedLocalStorage(page, "newsflash:readlist", articles)
}

/**
 * Seeds hidden article IDs in localStorage.
 */
export async function seedHiddenArticles(
  page: Page,
  articleIds: string[],
): Promise<void> {
  await seedLocalStorage(page, "newsflash:hidden", articleIds)
}
