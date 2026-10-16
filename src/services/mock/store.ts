/**
 * The mock database: a single in-memory store, persisted to localStorage,
 * with a framework-free subscribe/getSnapshot API (consumed through
 * `useAsyncData` in `src/state/use-async-data.ts`).
 *
 * The starter kept TWO bill collections (demo-store + service-internal seed)
 * that never agreed with each other. This store is the single source of
 * truth for parties and bills; every service reads and writes through it.
 */
import type { Branch, Business, Exporter, SavedBill } from '../../domain/shipping-bill/types.ts'
import { legacyBills } from './api-seed.ts'
import { seedBills, seedBusinesses, seedExporters } from './seed-data.ts'

export interface StoreData {
  exporters: Exporter[]
  businesses: Business[]
  bills: SavedBill[]
}

const STORAGE_KEY = 'shipping-bill-studio:store:v1'

function readStorage(): Partial<StoreData> | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<StoreData>) : null
  } catch {
    return null // Storage unavailable or corrupt — fall back to seeds.
  }
}

function writeStorage(data: StoreData): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // The in-memory store keeps working when storage is disabled.
  }
}

/**
 * Merge seeds into whatever was persisted: records already in storage win,
 * missing seeds are added. This keeps saved user data across reloads while
 * still introducing new seed records after an app update.
 */
function withSeeds(stored: Partial<StoreData> | null): StoreData {
  const storedExporters = Array.isArray(stored?.exporters) ? stored!.exporters : []
  const storedBusinesses = Array.isArray(stored?.businesses) ? stored!.businesses : []
  const storedBills = Array.isArray(stored?.bills) ? stored!.bills : []

  const byId = <T extends { id: number }>(primary: T[], extra: T[]): T[] => {
    const seen = new Set(primary.map((record) => record.id))
    return [...primary, ...extra.filter((record) => !seen.has(record.id))]
  }

  return {
    exporters: byId(storedExporters, seedExporters),
    businesses: byId(storedBusinesses, seedBusinesses),
    bills: byId(storedBills, [...seedBills, ...legacyBills])
  }
}

let snapshot: StoreData = withSeeds(readStorage())
const listeners = new Set<() => void>()

function publish(next: StoreData): void {
  snapshot = next
  writeStorage(next)
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): StoreData {
  return snapshot
}

/** Next free id — kept above 3000 so it never collides with seed records. */
export function nextId(): number {
  const ids = [
    ...snapshot.exporters.flatMap((record) => [record.id, ...record.branches.map((branch) => branch.id)]),
    ...snapshot.businesses.flatMap((record) => [record.id, ...record.branches.map((branch) => branch.id)]),
    ...snapshot.bills.map((bill) => bill.id)
  ]
  return Math.max(3000, ...ids) + 1
}

export function upsertExporter(record: Exporter): void {
  publish({
    ...snapshot,
    exporters: [...snapshot.exporters.filter((item) => item.id !== record.id), record]
  })
}

export function upsertBusiness(record: Business): void {
  publish({
    ...snapshot,
    businesses: [...snapshot.businesses.filter((item) => item.id !== record.id), record]
  })
}

export function upsertBranch(kind: 'exporter' | 'business', ownerId: number, branch: Branch): void {
  function withBranch<T extends { id: number; branches: Branch[] }>(owner: T): T {
    if (owner.id !== ownerId) return owner
    return { ...owner, branches: [...owner.branches.filter((item) => item.id !== branch.id), branch] }
  }

  if (kind === 'exporter') {
    publish({ ...snapshot, exporters: snapshot.exporters.map(withBranch) })
  } else {
    publish({ ...snapshot, businesses: snapshot.businesses.map(withBranch) })
  }
}

export function upsertBill(record: SavedBill): void {
  // Newest first, mirroring the starter's save behaviour.
  publish({ ...snapshot, bills: [record, ...snapshot.bills.filter((bill) => bill.id !== record.id)] })
}
