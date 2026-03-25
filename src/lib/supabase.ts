import type { SupabaseClient } from "@supabase/supabase-js"

let clientPromise: Promise<SupabaseClient> | undefined

export function getSupabaseClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      const url = import.meta.env.VITE_SUPABASE_URL as string
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

      if (!url || !anonKey) {
        throw new Error("Supabase environment variables are not configured")
      }

      return createClient(url, anonKey)
    })
  }

  return clientPromise
}

/** Reset the cached client — useful for testing */
export function resetSupabaseClient(): void {
  clientPromise = undefined
}
