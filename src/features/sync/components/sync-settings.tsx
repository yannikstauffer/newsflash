import { Check, Loader2 } from "lucide-react"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { useSyncContext } from "../sync-context"
import { getLastSyncedTimestamp } from "../sync-service"

import { SettingsSection } from "@/components/settings-section"
import { Button } from "@/components/ui/button"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_REGEX = /^\d{6}$/

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
    <SettingsSection
      title={t("sync.heading")}
      description={t("sync.signedInAs", { email: userEmail })}
      aria-label={t("sync.heading")}
      data-testid="sync-settings"
    >
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
    </SettingsSection>
  )
}

function UnauthenticatedView() {
  const { t } = useTranslation()
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleEmailSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setError("")

      if (!EMAIL_REGEX.test(email)) {
        setError(t("sync.invalidEmail"))
        return
      }

      setSubmitting(true)
      try {
        const { getSupabaseClient } = await import("@/lib/supabase")
        const supabase = await getSupabaseClient()
        const { error: authError } = await supabase.auth.signInWithOtp({ email })

        if (authError) {
          setError(t("sync.sendError"))
        } else {
          setStep("code")
        }
      } catch {
        setError(t("sync.sendError"))
      } finally {
        setSubmitting(false)
      }
    },
    [email, t],
  )

  const handleCodeSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setError("")

      if (!CODE_REGEX.test(code)) {
        setError(t("sync.verifyError"))
        return
      }

      setSubmitting(true)
      try {
        const { getSupabaseClient } = await import("@/lib/supabase")
        const supabase = await getSupabaseClient()
        const { error: authError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "email",
        })

        if (authError) {
          setError(t("sync.verifyError"))
        }
      } catch {
        setError(t("sync.verifyError"))
      } finally {
        setSubmitting(false)
      }
    },
    [code, email, t],
  )

  const handleUseDifferentEmail = useCallback(() => {
    setStep("email")
    setCode("")
    setError("")
  }, [])

  return (
    <SettingsSection
      title={t("sync.heading")}
      description={t("sync.description")}
      aria-label={t("sync.heading")}
      data-testid="sync-settings"
    >
      {step === "email" ? (
        <form
          onSubmit={handleEmailSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
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
              className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring"
              autoComplete="email"
              required
              data-testid="sync-email-input"
            />
            {error && (
              <p
                className="mt-1 text-sm text-destructive"
                role="alert"
                data-testid="sync-email-error"
              >
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="min-h-11"
            data-testid="send-code-button"
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
            {t("sync.sendCode")}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={handleCodeSubmit}
          className="flex flex-col gap-3"
          data-testid="sync-code-form"
        >
          <p className="text-sm text-foreground" data-testid="code-sent-to">
            {t("sync.codeSentTo", { email })}
          </p>
          <div>
            <label htmlFor="sync-code" className="mb-1 block text-sm font-medium text-foreground">
              {t("sync.codeLabel")}
            </label>
            <input
              id="sync-code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value.replaceAll(/\D/g, "").slice(0, 6))}
              placeholder={t("sync.codePlaceholder")}
              className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              aria-label={t("sync.codeLabel")}
              required
              data-testid="sync-code-input"
            />
            {error && (
              <p
                className="mt-1 text-sm text-destructive"
                role="alert"
                data-testid="sync-code-error"
              >
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              disabled={submitting}
              className="min-h-11"
              data-testid="verify-code-button"
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
              {t("sync.verifyCode")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleUseDifferentEmail}
              className="min-h-11"
              data-testid="use-different-email-button"
            >
              {t("sync.useDifferentEmail")}
            </Button>
          </div>
        </form>
      )}
    </SettingsSection>
  )
}
