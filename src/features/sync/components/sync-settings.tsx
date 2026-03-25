import { Check, Loader2 } from "lucide-react"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { useSyncContext } from "../sync-context"
import { getLastSyncedTimestamp } from "../sync-service"

import { Button } from "@/components/ui/button"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatRelativeTime(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime()
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return "just now"
  if (minutes === 1) return "1 minute ago"
  if (minutes < 60) return `${minutes} minutes ago`

  const hours = Math.floor(minutes / 60)
  if (hours === 1) return "1 hour ago"
  if (hours < 24) return `${hours} hours ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export function SyncSettings() {
  const { isAuthenticated } = useSyncContext()

  if (isAuthenticated) {
    return <AuthenticatedView />
  }

  return <UnauthenticatedView />
}

function AuthenticatedView() {
  const { t } = useTranslation()
  const { syncStatus, userEmail, triggerSync, signOut } = useSyncContext()

  const lastSynced = getLastSyncedTimestamp()
  const lastSyncedDisplay = lastSynced
    ? t("sync.lastSynced", { time: formatRelativeTime(lastSynced) })
    : t("sync.neverSynced")

  function handleSignOut() {
    signOut()
  }

  return (
    <section
      className="space-y-3 rounded-lg border border-border p-6"
      aria-label={t("sync.heading")}
      data-testid="sync-settings"
    >
      <div>
        <h3 className="text-base font-semibold text-foreground">{t("sync.heading")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("sync.signedInAs", { email: userEmail })}
        </p>
      </div>

      <p className="text-sm text-muted-foreground" data-testid="last-synced">
        {lastSyncedDisplay}
      </p>

      <div className="flex gap-2">
        <Button
          onClick={triggerSync}
          disabled={syncStatus === "SYNCING"}
          data-testid="sync-now-button"
        >
          {syncStatus === "SYNCING" && (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          )}
          {syncStatus === "SUCCESS" && (
            <Check className="mr-2 size-4" aria-hidden="true" />
          )}
          {syncStatus === "SYNCING" && t("sync.syncing")}
          {syncStatus === "SUCCESS" && t("sync.synced")}
          {syncStatus !== "SYNCING" && syncStatus !== "SUCCESS" && t("sync.syncNow")}
        </Button>

        <Button variant="ghost" onClick={handleSignOut} data-testid="sign-out-button">
          {t("sync.signOut")}
        </Button>
      </div>
    </section>
  )
}

function UnauthenticatedView() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setError("")

      if (!EMAIL_REGEX.test(email)) {
        setError(t("sync.invalidEmail"))
        return
      }

      setSending(true)
      try {
        const { getSupabaseClient } = await import("@/lib/supabase")
        const supabase = await getSupabaseClient()
        const { error: authError } = await supabase.auth.signInWithOtp({ email })

        if (authError) {
          setError(t("sync.sendError"))
        } else {
          setSent(true)
        }
      } catch {
        setError(t("sync.sendError"))
      } finally {
        setSending(false)
      }
    },
    [email, t],
  )

  return (
    <section
      className="space-y-3 rounded-lg border border-border p-6"
      aria-label={t("sync.heading")}
      data-testid="sync-settings"
    >
      <div>
        <h3 className="text-base font-semibold text-foreground">{t("sync.heading")}</h3>
        <p className="text-sm text-muted-foreground">{t("sync.description")}</p>
      </div>

      {sent ? (
        <p className="text-sm text-muted-foreground" data-testid="magic-link-sent">
          {t("sync.magicLinkSent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="sync-email" className="mb-1 block text-sm font-medium text-foreground">
              {t("sync.emailLabel")}
            </label>
            <input
              id="sync-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("sync.emailPlaceholder")}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring"
              autoComplete="email"
              required
              data-testid="sync-email-input"
            />
            {error && (
              <p className="mt-1 text-sm text-destructive" role="alert" data-testid="sync-email-error">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" disabled={sending} data-testid="send-magic-link-button">
            {sending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
            {t("sync.sendMagicLink")}
          </Button>
        </form>
      )}
    </section>
  )
}
