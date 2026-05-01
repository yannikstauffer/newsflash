import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import InsightsPage from "./insights-page"

import type { FeedInsight, FilterInsight } from "../hooks/use-insights-data"

// Mock i18n to return keys so test assertions are key-stable
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Default mock — no data
let mockSourceInsights: FeedInsight[] = []
let mockFilterInsights: FilterInsight[] = []
let mockHasData = false

vi.mock("../hooks/use-insights-data", () => ({
  useInsightsData: () => ({
    sources: mockSourceInsights,
    filters: mockFilterInsights,
    hasData: mockHasData,
  }),
}))

function makeSource(overrides: Partial<FeedInsight> = {}): FeedInsight {
  return {
    feedId: "heise",
    feedName: "Heise Online",
    sourceName: "Heise",
    appeared: 10,
    hidden: 2,
    saved: 1,
    hideRate: 0.2,
    hasEnoughData: true,
    recommendDisable: false,
    noRecentArticles: false,
    ...overrides,
  }
}

function makeFilter(overrides: Partial<FilterInsight> = {}): FilterInsight {
  return {
    filterId: "heise-plus",
    filterLabel: "heise+",
    sourceName: "Heise",
    appeared: 5,
    hidden: 2,
    saved: 0,
    hideRate: 0.4,
    hasEnoughData: true,
    isEnabled: true,
    recommendEnable: false,
    recommendDisable: false,
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
  mockSourceInsights = []
  mockFilterInsights = []
  mockHasData = false
  vi.restoreAllMocks()
})

describe("InsightsPage — empty state", () => {
  it("renders empty state when hasData=false", () => {
    render(<InsightsPage />)
    expect(screen.getByTestId("insights-empty-state")).toBeInTheDocument()
  })

  it("does not render empty state when hasData=true", () => {
    mockHasData = true
    mockSourceInsights = [makeSource()]
    render(<InsightsPage />)
    expect(screen.queryByTestId("insights-empty-state")).not.toBeInTheDocument()
  })
})

describe("InsightsPage — source cards", () => {
  it("renders a source card for each source", () => {
    mockHasData = true
    mockSourceInsights = [makeSource({ feedId: "heise", feedName: "Heise Online", sourceName: "Heise" }), makeSource({ feedId: "srf", feedName: "SRF", sourceName: "SRF" })]
    render(<InsightsPage />)
    expect(screen.getAllByTestId("source-insight-card")).toHaveLength(2)
  })

  it("shows appeared/hidden/saved counts when hasEnoughData=true", () => {
    mockHasData = true
    mockSourceInsights = [makeSource({ appeared: 15, hidden: 3, saved: 2, hasEnoughData: true })]
    render(<InsightsPage />)
    expect(screen.getByTestId("source-appeared").textContent).toBe("15")
    expect(screen.getByTestId("source-hidden").textContent).toBe("3")
    expect(screen.getByTestId("source-saved").textContent).toBe("2")
  })

  it("shows not-enough-data indicator when hasEnoughData=false", () => {
    mockHasData = true
    mockSourceInsights = [makeSource({ appeared: 2, hasEnoughData: false })]
    render(<InsightsPage />)
    expect(screen.getByTestId("not-enough-data")).toBeInTheDocument()
    expect(screen.queryByTestId("source-appeared")).not.toBeInTheDocument()
  })
})

describe("InsightsPage — recommendation badges", () => {
  it("shows disable recommendation badge when recommendDisable=true", () => {
    mockHasData = true
    mockSourceInsights = [makeSource({ recommendDisable: true, hasEnoughData: true })]
    render(<InsightsPage />)
    expect(screen.getByTestId("recommendation-badge")).toBeInTheDocument()
  })

  it("does not show badge when no recommendation", () => {
    mockHasData = true
    mockSourceInsights = [makeSource({ recommendDisable: false })]
    render(<InsightsPage />)
    expect(screen.queryByTestId("recommendation-badge")).not.toBeInTheDocument()
  })

  it("shows no-recent-articles badge when noRecentArticles=true", () => {
    mockHasData = true
    mockSourceInsights = [makeSource({ noRecentArticles: true })]
    render(<InsightsPage />)
    expect(screen.getByTestId("no-recent-articles-badge")).toBeInTheDocument()
  })

  it("shows enable recommendation badge on filter card when recommendEnable=true", () => {
    mockHasData = true
    mockFilterInsights = [makeFilter({ recommendEnable: true })]
    render(<InsightsPage />)
    expect(screen.getByTestId("recommendation-badge")).toBeInTheDocument()
  })
})

describe("InsightsPage — filter cards", () => {
  it("shows matched/hidden/saved for enabled filter with enough data", () => {
    mockHasData = true
    mockFilterInsights = [makeFilter({ appeared: 8, hidden: 3, saved: 1, isEnabled: true, hasEnoughData: true })]
    render(<InsightsPage />)
    expect(screen.getByTestId("filter-appeared").textContent).toBe("8")
    expect(screen.getByTestId("filter-hidden").textContent).toBe("3")
    expect(screen.getByTestId("filter-saved").textContent).toBe("1")
  })

  it("shows only blocked count for disabled filter (no hidden/saved columns)", () => {
    mockHasData = true
    mockFilterInsights = [makeFilter({ appeared: 8, hidden: 0, saved: 0, isEnabled: false, hasEnoughData: true })]
    render(<InsightsPage />)
    expect(screen.getByTestId("filter-appeared").textContent).toBe("8")
    expect(screen.queryByTestId("filter-hidden")).not.toBeInTheDocument()
    expect(screen.queryByTestId("filter-saved")).not.toBeInTheDocument()
  })

  it("shows not-enough-data indicator when hasEnoughData=false", () => {
    mockHasData = true
    mockFilterInsights = [makeFilter({ hasEnoughData: false })]
    render(<InsightsPage />)
    expect(screen.getByTestId("not-enough-data")).toBeInTheDocument()
    expect(screen.queryByTestId("filter-appeared")).not.toBeInTheDocument()
  })
})
