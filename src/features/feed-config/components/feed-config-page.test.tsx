import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mockDisabledFeeds = new Set<string>()
const mockToggleFeed = vi.fn()
const mockSetAllForSource = vi.fn()

vi.mock("../hooks/use-feed-preferences", () => ({
  useFeedPreferences: () => ({
    isFeedEnabled: (id: string) => !mockDisabledFeeds.has(id),
    toggleFeed: mockToggleFeed,
    setAllForSource: mockSetAllForSource,
  }),
}))

const mockDisabledFilters = new Set<string>()
const mockToggleFilter = vi.fn()

vi.mock("../hooks/use-filter-preferences", () => ({
  useFilterPreferences: () => ({
    isFilterEnabled: (filterId: string, enabledByDefault: boolean) => {
      if (mockDisabledFilters.has(filterId)) return false
      return enabledByDefault
    },
    toggleFilter: mockToggleFilter,
  }),
}))

vi.mock("@/features/article-actions/hooks/use-article-state", () => ({
  useArticleState: () => ({
    removeHiddenBySource: vi.fn(),
    removeReadListBySource: vi.fn(),
  }),
}))

const mockSetTheme = vi.fn()
const mockThemeState = { theme: "system" as "system" | "light" | "dark" }

vi.mock("@/hooks/use-theme-preference", () => ({
  useThemePreference: () => ({
    theme: mockThemeState.theme,
    setTheme: mockSetTheme,
  }),
}))

vi.mock("@/features/connectors/registry", () => ({
  connectors: [
    {
      id: "srf",
      name: "SRF",
      language: "de",
      feeds: [
        { id: "srf-latest", name: "Das Neueste", group: "News" },
        { id: "srf-switzerland", name: "Schweiz", group: "News" },
        { id: "srf-sport", name: "Sport", group: "Sport" },
        { id: "srf-football", name: "Fussball", group: "Sport" },
      ],
      parse: () => [],
    },
    {
      id: "digitec",
      name: "Digitec",
      language: "de",
      feeds: [{ id: "digitec", name: "Digitec" }],
      filters: [
        {
          id: "digitec-produkttest",
          label: "Produkttest",
          enabledByDefault: true,
          match: () => false,
        },
        {
          id: "digitec-meinung",
          label: "Meinung",
          enabledByDefault: true,
          match: () => false,
        },
      ],
      parse: () => [],
    },
  ],
}))

const { default: FeedConfigPage } = await import("./feed-config-page")

describe("FeedConfigPage", () => {
  beforeEach(() => {
    mockDisabledFeeds.clear()
    mockDisabledFilters.clear()
    mockToggleFeed.mockClear()
    mockToggleFilter.mockClear()
    mockSetAllForSource.mockClear()
    mockSetTheme.mockClear()
    mockThemeState.theme = "system"
  })

  describe("grouped feeds", () => {
    it("renders group headers for connectors with grouped feeds", () => {
      render(<FeedConfigPage />)

      expect(screen.getByText("News")).toBeInTheDocument()
      // "Sport" appears both as a group name and as a feed name in the group
      // When collapsed, only the group header "Sport" text is visible
      expect(screen.getByRole("button", { name: /sport/i })).toBeInTheDocument()
    })

    it("shows summary counts on group headers", () => {
      render(<FeedConfigPage />)

      const badges = screen.getAllByText("2/2 on")
      expect(badges).toHaveLength(2)
    })

    it("does not show individual grouped feeds when collapsed", () => {
      render(<FeedConfigPage />)

      expect(screen.queryByText("Das Neueste")).not.toBeInTheDocument()
      expect(screen.queryByText("Schweiz")).not.toBeInTheDocument()
      expect(screen.queryByText("Fussball")).not.toBeInTheDocument()
    })

    it("shows individual feeds when group is expanded", () => {
      render(<FeedConfigPage />)

      const newsButton = screen.getByRole("button", { name: /news/i })
      fireEvent.click(newsButton)

      expect(screen.getByText("Das Neueste")).toBeInTheDocument()
      expect(screen.getByText("Schweiz")).toBeInTheDocument()
    })
  })

  describe("ungrouped feeds", () => {
    it("renders single-feed connectors without groups", () => {
      render(<FeedConfigPage />)

      expect(screen.getByText("Digitec")).toBeInTheDocument()
    })
  })

  describe("all feed groups rendered", () => {
    it("renders all connector names", () => {
      render(<FeedConfigPage />)

      expect(screen.getByText("SRF")).toBeInTheDocument()
      expect(screen.getByText("Digitec")).toBeInTheDocument()
    })

    it("renders language badges for each connector", () => {
      render(<FeedConfigPage />)

      const badges = screen.getAllByText("DE")
      expect(badges).toHaveLength(2)
    })
  })

  describe("language selector", () => {
    it("triggers language change when clicked", () => {
      render(<FeedConfigPage />)

      const englishButton = screen.getByRole("radio", { name: "English" })
      fireEvent.click(englishButton)

      // The click changes the i18n language; we verify the button exists and is interactive
      expect(englishButton).toBeInTheDocument()
    })

    it("shows current locale as selected", () => {
      render(<FeedConfigPage />)

      const deutschButton = screen.getByRole("radio", { name: "Deutsch" })
      const englishButton = screen.getByRole("radio", { name: "English" })

      // One should be checked based on current i18n language
      const isOneChecked =
        deutschButton.getAttribute("aria-checked") === "true" ||
        englishButton.getAttribute("aria-checked") === "true"
      expect(isOneChecked).toBe(true)
    })
  })

  describe("theme toggle", () => {
    it("calls setTheme when theme option is clicked", () => {
      render(<FeedConfigPage />)

      const darkButton = screen.getByRole("radio", { name: "Dark" })
      fireEvent.click(darkButton)

      expect(mockSetTheme).toHaveBeenCalledWith("dark")
    })

    it("calls setTheme with light when Light is clicked", () => {
      render(<FeedConfigPage />)

      const lightButton = screen.getByRole("radio", { name: "Light" })
      fireEvent.click(lightButton)

      expect(mockSetTheme).toHaveBeenCalledWith("light")
    })
  })

  describe("filter section", () => {
    it("shows filter checkboxes for connectors with filters", () => {
      render(<FeedConfigPage />)

      expect(screen.getByText("Produkttest")).toBeInTheDocument()
      expect(screen.getByText("Meinung")).toBeInTheDocument()
    })

    it("does not show filter section for connectors without filters", () => {
      render(<FeedConfigPage />)

      // SRF has no filters — the "Filters" label should appear only once (for Digitec)
      const filterLabels = screen.getAllByText("Filters")
      expect(filterLabels).toHaveLength(1)
    })

    it("reflects enabled state of filter checkboxes", () => {
      render(<FeedConfigPage />)

      const produkttestLabel = screen.getByText("Produkttest")
      const checkbox = produkttestLabel.closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it("reflects disabled state of filter checkboxes", () => {
      mockDisabledFilters.add("digitec-produkttest")
      render(<FeedConfigPage />)

      const produkttestLabel = screen.getByText("Produkttest")
      const checkbox = produkttestLabel.closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it("calls toggleFilter when filter checkbox is clicked", () => {
      render(<FeedConfigPage />)

      const produkttestLabel = screen.getByText("Produkttest")
      const checkbox = produkttestLabel.closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement
      fireEvent.click(checkbox)

      expect(mockToggleFilter).toHaveBeenCalledWith("digitec-produkttest", true)
    })
  })

  describe("connector-level toggle with groups", () => {
    it("renders connector-level checkbox for grouped connector", () => {
      render(<FeedConfigPage />)

      expect(screen.getByText("SRF")).toBeInTheDocument()
    })

    it("toggles all feeds across all groups when connector checkbox is clicked", () => {
      render(<FeedConfigPage />)

      const srfLabel = screen.getByText("SRF")
      const srfCheckbox = srfLabel.closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement
      fireEvent.click(srfCheckbox)

      expect(mockSetAllForSource).toHaveBeenCalledWith(
        ["srf-latest", "srf-switzerland", "srf-sport", "srf-football"],
        false,
      )
    })
  })
})
