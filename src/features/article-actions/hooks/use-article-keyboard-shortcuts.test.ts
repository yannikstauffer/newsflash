import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useArticleKeyboardShortcuts } from "./use-article-keyboard-shortcuts"

function fireKey(key: string) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }))
}

describe("useArticleKeyboardShortcuts", () => {
  it("uses focused article ID when available", () => {
    const onHide = vi.fn()
    const onSave = vi.fn()

    renderHook(() =>
      useArticleKeyboardShortcuts({
        onHide,
        onSave,
        getFocusedArticleId: () => "focused-1",
        getHoveredArticleId: () => "hovered-1",
      }),
    )

    fireKey("h")
    expect(onHide).toHaveBeenCalledWith("focused-1")

    fireKey("s")
    expect(onSave).toHaveBeenCalledWith("focused-1")
  })

  it("falls back to hovered article ID when no article is focused", () => {
    const onHide = vi.fn()
    const onSave = vi.fn()

    renderHook(() =>
      useArticleKeyboardShortcuts({
        onHide,
        onSave,
        getFocusedArticleId: () => undefined,
        getHoveredArticleId: () => "hovered-1",
      }),
    )

    fireKey("h")
    expect(onHide).toHaveBeenCalledWith("hovered-1")

    fireKey("s")
    expect(onSave).toHaveBeenCalledWith("hovered-1")
  })

  it("does nothing when neither focused nor hovered article exists", () => {
    const onHide = vi.fn()
    const onSave = vi.fn()

    renderHook(() =>
      useArticleKeyboardShortcuts({
        onHide,
        onSave,
        getFocusedArticleId: () => undefined,
        getHoveredArticleId: () => undefined,
      }),
    )

    fireKey("h")
    fireKey("s")
    expect(onHide).not.toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it("ignores shortcuts when focus is in an input field", () => {
    const onHide = vi.fn()

    renderHook(() =>
      useArticleKeyboardShortcuts({
        onHide,
        onSave: vi.fn(),
        getFocusedArticleId: () => "focused-1",
        getHoveredArticleId: () => undefined,
      }),
    )

    const input = document.createElement("input")
    document.body.append(input)
    input.focus()

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "h", bubbles: true }),
    )
    expect(onHide).not.toHaveBeenCalled()

    input.remove()
  })
})
