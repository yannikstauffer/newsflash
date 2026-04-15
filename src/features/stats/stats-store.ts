export interface SourceDayStats {
  appeared: number
  hidden: number
  saved: number
}

export interface FilterDayStats {
  appeared: number
  hidden: number
  saved: number
}

export interface DayStats {
  sources: Record<string, SourceDayStats>
  filters: Record<string, FilterDayStats>
}

export interface StatsStore {
  version: 1
  days: Record<string, DayStats>
}

export type StatCounter = "appeared" | "hidden" | "saved"

const STATS_KEY = "newsflash:stats"
const EVICTION_DAYS = 90

function todayIso(date?: Date): string {
  const d = date ?? new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function evictOldDays(days: Record<string, DayStats>): Record<string, DayStats> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - EVICTION_DAYS)
  const cutoffString = todayIso(cutoff)
  const evicted: Record<string, DayStats> = {}
  for (const [date, stats] of Object.entries(days)) {
    if (date >= cutoffString) {
      // eslint-disable-next-line security/detect-object-injection -- date comes from our own stored data
      evicted[date] = stats
    }
  }
  return evicted
}

function isValidDaysRecord(value: unknown): value is Record<string, DayStats> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Parses and validates an unknown value as a StatsStore.
 * Returns null if the value is missing or structurally invalid so callers can
 * treat bad remote data as "no remote" rather than crashing.
 */
export function parseStatsStore(data: unknown): StatsStore | null {
  if (
    typeof data === "object" &&
    data !== null &&
    (data as StatsStore).version === 1 &&
    isValidDaysRecord((data as StatsStore).days)
  ) {
    return data as StatsStore
  }
  return null
}

export function readStats(): StatsStore {
  try {
    const raw = globalThis.localStorage.getItem(STATS_KEY)
    if (!raw) return { version: 1, days: {} }
    const parsed = JSON.parse(raw) as StatsStore
    if (parsed.version !== 1 || !isValidDaysRecord(parsed.days)) {
      return { version: 1, days: {} }
    }
    return parsed
  } catch {
    return { version: 1, days: {} }
  }
}

export function writeStats(store: StatsStore): void {
  const evicted: StatsStore = {
    ...store,
    days: evictOldDays(store.days),
  }
  try {
    globalThis.localStorage.setItem(STATS_KEY, JSON.stringify(evicted))
  } catch {
    // localStorage full or unavailable
  }
}

function ensureSourceBucket(day: DayStats, sourceId: string): void {
  // eslint-disable-next-line security/detect-object-injection -- sourceId comes from our connector registry
  if (!day.sources[sourceId]) {
    // eslint-disable-next-line security/detect-object-injection
    day.sources[sourceId] = { appeared: 0, hidden: 0, saved: 0 }
  }
}

function ensureFilterBucket(day: DayStats, filterId: string): void {
  // eslint-disable-next-line security/detect-object-injection -- filterId comes from our connector registry
  if (!day.filters[filterId]) {
    // eslint-disable-next-line security/detect-object-injection
    day.filters[filterId] = { appeared: 0, hidden: 0, saved: 0 }
  }
}

function getOrCreateDay(store: StatsStore, key: string): DayStats {
  // eslint-disable-next-line security/detect-object-injection -- key is YYYY-MM-DD from our own code
  if (!store.days[key]) {
    // eslint-disable-next-line security/detect-object-injection
    store.days[key] = { sources: {}, filters: {} }
  }
  // eslint-disable-next-line security/detect-object-injection
  return store.days[key]
}

export function incrementSourceStat(
  sourceId: string,
  counter: StatCounter,
  date?: Date,
): void {
  const store = readStats()
  const day = getOrCreateDay(store, todayIso(date))
  ensureSourceBucket(day, sourceId)
  // eslint-disable-next-line security/detect-object-injection
  day.sources[sourceId][counter]++
  writeStats(store)
}

export function incrementFilterStat(
  filterId: string,
  counter: StatCounter,
  date?: Date,
): void {
  const store = readStats()
  const day = getOrCreateDay(store, todayIso(date))
  ensureFilterBucket(day, filterId)
  // eslint-disable-next-line security/detect-object-injection
  day.filters[filterId][counter]++
  writeStats(store)
}

/**
 * Applies multiple stat increments in a single localStorage read+write.
 * Maps sourceId/filterId → counter → amount to add.
 * More efficient than individual incrementSourceStat/incrementFilterStat calls
 * when tracking a batch of articles at once.
 */
export function batchIncrementStats(
  sourceCounts: Record<string, Partial<Record<StatCounter, number>>>,
  filterCounts: Record<string, Partial<Record<StatCounter, number>>>,
  date?: Date,
): void {
  if (Object.keys(sourceCounts).length === 0 && Object.keys(filterCounts).length === 0) return
  const store = readStats()
  const day = getOrCreateDay(store, todayIso(date))

  for (const [sourceId, counts] of Object.entries(sourceCounts)) {
    ensureSourceBucket(day, sourceId)
    for (const [counter, amount] of Object.entries(counts) as Array<[StatCounter, number]>) {
      if (amount > 0) {
        // eslint-disable-next-line security/detect-object-injection
        day.sources[sourceId][counter] += amount
      }
    }
  }

  for (const [filterId, counts] of Object.entries(filterCounts)) {
    ensureFilterBucket(day, filterId)
    for (const [counter, amount] of Object.entries(counts) as Array<[StatCounter, number]>) {
      if (amount > 0) {
        // eslint-disable-next-line security/detect-object-injection
        day.filters[filterId][counter] += amount
      }
    }
  }

  writeStats(store)
}
