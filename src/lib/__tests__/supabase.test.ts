import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getSupabaseClient, resetSupabaseClient } from "../supabase"

const mockClient = { auth: {}, from: vi.fn() }
const mockCreateClient = vi.fn((..._args: unknown[]) => mockClient)

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}))

describe("getSupabaseClient", () => {
  beforeEach(() => {
    resetSupabaseClient()
    mockCreateClient.mockClear()
    vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co")
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns a Supabase client instance", async () => {
    const client = await getSupabaseClient()

    expect(client).toBe(mockClient)
    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
    )
  })

  it("caches the client across multiple calls", async () => {
    const first = await getSupabaseClient()
    const second = await getSupabaseClient()

    expect(first).toBe(second)
    expect(mockCreateClient).toHaveBeenCalledTimes(1)
  })

  it("creates a new client after reset", async () => {
    await getSupabaseClient()
    resetSupabaseClient()
    await getSupabaseClient()

    expect(mockCreateClient).toHaveBeenCalledTimes(2)
  })

  it("throws when environment variables are missing", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "")
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "")
    resetSupabaseClient()

    await expect(getSupabaseClient()).rejects.toThrow(
      "Supabase environment variables are not configured",
    )
  })
})
