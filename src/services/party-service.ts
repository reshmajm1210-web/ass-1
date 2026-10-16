/**
 * Party service — exporters, businesses and their branches.
 *
 * Every function returns a Promise and goes through the network simulation,
 * exactly like a real HTTP client would. To move to a real backend, replace
 * the bodies with `fetch` calls; no UI code needs to change.
 */
import type { Branch, Business, BusinessRole, Exporter } from '../domain/shipping-bill/types.ts'
import { QUICK_LATENCY_MS, simulateNetwork } from './mock/latency.ts'
import { getSnapshot, nextId, upsertBranch, upsertBusiness, upsertExporter } from './mock/store.ts'

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return fields.some((field) => (field ?? '').toLowerCase().includes(q))
}

/** Search exporters by name or IEC. Disabled exporters are hidden. */
export function searchExporters(query: string): Promise<Exporter[]> {
  return simulateNetwork(
    () => getSnapshot().exporters.filter((item) => !item.disabled && matches(query, item.name, item.iec)),
    { query }
  )
}

/** Resolve one exporter by id (used to render the label of a saved value). */
export function getExporterById(exporterId: string): Promise<Exporter | undefined> {
  return simulateNetwork(() => getSnapshot().exporters.find((item) => String(item.id) === exporterId), {
    delayMs: QUICK_LATENCY_MS
  })
}

/**
 * Search businesses that may play `role` on a bill. The starter searched
 * consignees for every business field; role filtering is the corrected,
 * generalised behaviour (seed data satisfies all roles, so UX is unchanged).
 */
export function searchBusinesses(query: string, role: BusinessRole = 'consignee'): Promise<Business[]> {
  return simulateNetwork(
    () =>
      getSnapshot().businesses.filter((item) => {
        const playsRole =
          role === 'consignee' ? item.isConsignee : role === 'buyer' ? item.isBuyer : item.isThirdParty
        return playsRole && matches(query, item.name)
      }),
    { query }
  )
}

/** Resolve one business by id (used to render the label of a saved value). */
export function getBusinessById(businessId: string): Promise<Business | undefined> {
  return simulateNetwork(() => getSnapshot().businesses.find((item) => String(item.id) === businessId), {
    delayMs: QUICK_LATENCY_MS
  })
}

/** Search the branches of one party by branch name or city. */
export function searchBranches(
  kind: 'exporter' | 'business',
  ownerId: string,
  query: string
): Promise<Branch[]> {
  return simulateNetwork(() => {
    if (!ownerId) return []
    const parties = kind === 'exporter' ? getSnapshot().exporters : getSnapshot().businesses
    const owner = parties.find((item) => String(item.id) === ownerId)
    if (!owner) return []
    return owner.branches.filter((branch) => matches(query, branch.branchName, branch.city))
  }, { query })
}

/** Resolve one branch by id across all parties (label echo for saved values). */
export function getBranchById(branchId: string): Promise<Branch | undefined> {
  return simulateNetwork(
    () =>
      [...getSnapshot().exporters, ...getSnapshot().businesses]
        .flatMap((party) => party.branches)
        .find((branch) => String(branch.id) === branchId),
    { delayMs: QUICK_LATENCY_MS }
  )
}

/* ------------------------------------------------------------------ */
/* Writes (quick-add dialogs)                                          */
/* ------------------------------------------------------------------ */

export interface ExporterDraft {
  name: string
  iec: string
  class: string
  type: string
  pan?: string
  tan?: string
  aeoNumber?: string
  website?: string
  notes?: string
  firstBranch?: Omit<Branch, 'id'>
}

export interface BusinessDraft {
  name: string
  iec?: string
  isConsignee: boolean
  isBuyer: boolean
  isNotify: boolean
  isThirdParty: boolean
  firstBranch?: Omit<Branch, 'id'>
}

/** Create an exporter (optionally with its first branch). Resolves the record. */
export function createExporter(draft: ExporterDraft): Promise<Exporter> {
  return simulateNetwork(() => {
    const id = nextId()
    const record: Exporter = {
      id,
      name: draft.name,
      iec: draft.iec,
      class: draft.class,
      type: draft.type,
      pan: draft.pan,
      tan: draft.tan,
      aeoNumber: draft.aeoNumber,
      website: draft.website,
      notes: draft.notes,
      branches: draft.firstBranch ? [{ ...draft.firstBranch, id: id + 1 }] : []
    }
    upsertExporter(record)
    return record
  })
}

/** Create a business (optionally with its first branch). Resolves the record. */
export function createBusiness(draft: BusinessDraft): Promise<Business> {
  return simulateNetwork(() => {
    const id = nextId()
    const record: Business = {
      id,
      name: draft.name,
      iec: draft.iec,
      isConsignee: draft.isConsignee,
      isBuyer: draft.isBuyer,
      isNotify: draft.isNotify,
      isThirdParty: draft.isThirdParty,
      branches: draft.firstBranch ? [{ ...draft.firstBranch, id: id + 1 }] : []
    }
    upsertBusiness(record)
    return record
  })
}

/** Add a branch to an existing party. Resolves the branch (with its new id). */
export function createBranch(
  kind: 'exporter' | 'business',
  ownerId: number,
  branch: Omit<Branch, 'id'>
): Promise<Branch> {
  return simulateNetwork(() => {
    const record: Branch = { ...branch, id: nextId() }
    upsertBranch(kind, ownerId, record)
    return record
  })
}
