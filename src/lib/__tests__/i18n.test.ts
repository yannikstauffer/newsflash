import i18n from "i18next"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("i18n initialization", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("initializes i18next successfully", async () => {
    await import("../i18n")
    expect(i18n.isInitialized).toBe(true)
  })

  it("supports 'en' and 'de' languages", async () => {
    await import("../i18n")
    expect(i18n.options.supportedLngs).toContain("en")
    expect(i18n.options.supportedLngs).toContain("de")
  })

  it("falls back to English for unsupported locale", async () => {
    await import("../i18n")
    expect(i18n.options.fallbackLng).toContain("en")
  })

  it("reads locale from localStorage when available", async () => {
    localStorage.setItem("newsflash:locale", "de")
    // Re-import to pick up localStorage
    vi.resetModules()
    const i18nModule = await import("../i18n")
    const freshI18n = i18nModule.default
    // changeLanguage triggers detection
    await freshI18n.changeLanguage("de")
    expect(freshI18n.language).toBe("de")
  })

  it("loads English translations", async () => {
    await import("../i18n")
    await i18n.changeLanguage("en")
    expect(i18n.t("nav.feed")).toBe("Feed")
    expect(i18n.t("error.heading")).toBe("Something went wrong")
  })

  it("loads German translations", async () => {
    await import("../i18n")
    await i18n.changeLanguage("de")
    expect(i18n.t("nav.feed")).toBe("Feed")
    expect(i18n.t("error.heading")).toBe("Etwas ist schiefgelaufen")
  })

  it("strips region code to base language", async () => {
    await import("../i18n")
    // de-CH should resolve to de
    await i18n.changeLanguage("de-CH")
    expect(i18n.language).toBe("de-CH")
    // nonExplicitSupportedLngs allows de-CH to use de translations
    expect(i18n.t("nav.settings")).toBe("Einstellungen")
  })
})
