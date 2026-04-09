const SYNC_TAG = "feed-refresh"
const MIN_INTERVAL_MS = 4 * 60 * 60 * 1000 // 4 hours

interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval: number }): Promise<void>
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  readonly periodicSync?: PeriodicSyncManager
}

export async function registerPeriodicSync(): Promise<void> {
  if (!navigator.serviceWorker) return

  const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistrationWithSync

  if (!registration.periodicSync) return

  const status = await navigator.permissions.query({
    name: "periodic-background-sync" as PermissionName,
  })

  if (status.state !== "granted") return

  await registration.periodicSync.register(SYNC_TAG, {
    minInterval: MIN_INTERVAL_MS,
  })
}
