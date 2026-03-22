import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FeedGroup } from "./feed-group"

import type { FeedConfig } from "@/features/connectors/types"

const SPORT_FEEDS: FeedConfig[] = [
  { id: "srf-sport", name: "Sport", group: "Sport" },
  { id: "srf-football", name: "Fussball", group: "Sport" },
  { id: "srf-tennis", name: "Tennis", group: "Sport" },
]

function renderFeedGroup(overrides: {
  isExpanded?: boolean
  enabledIds?: Set<string>
  onToggleExpand?: () => void
  onToggleFeed?: (feedId: string) => void
  onToggleGroup?: (feedIds: string[], enable: boolean) => void
} = {}) {
  const enabledIds = overrides.enabledIds ?? new Set(SPORT_FEEDS.map((f) => f.id))

  return render(
    <FeedGroup
      connectorId="srf"
      groupName="Sport"
      feeds={SPORT_FEEDS}
      isExpanded={overrides.isExpanded ?? false}
      isFeedEnabled={(id) => enabledIds.has(id)}
      onToggleExpand={overrides.onToggleExpand ?? vi.fn()}
      onToggleFeed={overrides.onToggleFeed ?? vi.fn()}
      onToggleGroup={overrides.onToggleGroup ?? vi.fn()}
    />,
  )
}

describe("FeedGroup", () => {
  describe("collapsed rendering", () => {
    it("shows group name and summary count", () => {
      renderFeedGroup()

      expect(screen.getByText("Sport")).toBeInTheDocument()
      expect(screen.getByText("3/3 on")).toBeInTheDocument()
    })

    it("does not show individual feeds when collapsed", () => {
      renderFeedGroup()

      expect(screen.queryByText("Fussball")).not.toBeInTheDocument()
      expect(screen.queryByText("Tennis")).not.toBeInTheDocument()
    })

    it("has aria-expanded set to false", () => {
      renderFeedGroup()

      const button = screen.getByRole("button", { expanded: false })
      expect(button).toBeInTheDocument()
    })
  })

  describe("expanded rendering", () => {
    it("shows individual feeds when expanded", () => {
      renderFeedGroup({ isExpanded: true })

      expect(screen.getByText("Fussball")).toBeInTheDocument()
      expect(screen.getByText("Tennis")).toBeInTheDocument()
    })

    it("has aria-expanded set to true", () => {
      renderFeedGroup({ isExpanded: true })

      const button = screen.getByRole("button", { expanded: true })
      expect(button).toBeInTheDocument()
    })

    it("renders group content with role=group", () => {
      renderFeedGroup({ isExpanded: true })

      const group = screen.getByRole("group")
      expect(group).toBeInTheDocument()
    })
  })

  describe("summary count", () => {
    it("shows 0/3 when no feeds are enabled", () => {
      renderFeedGroup({ enabledIds: new Set() })

      expect(screen.getByText("0/3 on")).toBeInTheDocument()
    })

    it("shows 1/3 when one feed is enabled", () => {
      renderFeedGroup({ enabledIds: new Set(["srf-sport"]) })

      expect(screen.getByText("1/3 on")).toBeInTheDocument()
    })

    it("shows 3/3 when all feeds are enabled", () => {
      renderFeedGroup({ enabledIds: new Set(["srf-sport", "srf-football", "srf-tennis"]) })

      expect(screen.getByText("3/3 on")).toBeInTheDocument()
    })
  })

  describe("group checkbox toggle", () => {
    it("calls onToggleGroup with all feed IDs when clicked", () => {
      const onToggleGroup = vi.fn()

      renderFeedGroup({ onToggleGroup, enabledIds: new Set(["srf-sport"]) })

      const checkbox = screen.getByRole("checkbox", { name: /toggle all sport/i })
      fireEvent.click(checkbox)

      expect(onToggleGroup).toHaveBeenCalledWith(
        ["srf-sport", "srf-football", "srf-tennis"],
        true,
      )
    })

    it("disables all when all are enabled", () => {
      const onToggleGroup = vi.fn()

      renderFeedGroup({ onToggleGroup })

      const checkbox = screen.getByRole("checkbox", { name: /toggle all sport/i })
      fireEvent.click(checkbox)

      expect(onToggleGroup).toHaveBeenCalledWith(
        ["srf-sport", "srf-football", "srf-tennis"],
        false,
      )
    })
  })

  describe("indeterminate state", () => {
    it("sets indeterminate when some feeds are enabled", () => {
      renderFeedGroup({ enabledIds: new Set(["srf-sport"]) })

      const checkbox = screen.getByRole("checkbox", { name: /toggle all sport/i }) as HTMLInputElement
      expect(checkbox.indeterminate).toBe(true)
    })

    it("is not indeterminate when all feeds are enabled", () => {
      renderFeedGroup()

      const checkbox = screen.getByRole("checkbox", { name: /toggle all sport/i }) as HTMLInputElement
      expect(checkbox.indeterminate).toBe(false)
    })

    it("is not indeterminate when no feeds are enabled", () => {
      renderFeedGroup({ enabledIds: new Set() })

      const checkbox = screen.getByRole("checkbox", { name: /toggle all sport/i }) as HTMLInputElement
      expect(checkbox.indeterminate).toBe(false)
    })
  })

  describe("expand/collapse toggle", () => {
    it("calls onToggleExpand when header button is clicked", () => {
      const onToggleExpand = vi.fn()

      renderFeedGroup({ onToggleExpand })

      const button = screen.getByRole("button")
      fireEvent.click(button)

      expect(onToggleExpand).toHaveBeenCalledOnce()
    })
  })

  describe("individual feed toggle", () => {
    it("calls onToggleFeed when individual feed checkbox is clicked", () => {
      const onToggleFeed = vi.fn()

      renderFeedGroup({ isExpanded: true, onToggleFeed })

      const checkboxes = screen.getAllByRole("checkbox")
      // First checkbox is the group checkbox, rest are individual feeds
      fireEvent.click(checkboxes[1])

      expect(onToggleFeed).toHaveBeenCalledWith("srf-sport")
    })
  })
})
