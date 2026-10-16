/**
 * Port service — loading ports (Indian), destination ports and lookups.
 * Promise-based like every other service; swap the bodies for `fetch` later.
 */
import type { PortOption } from '../domain/shipping-bill/types.ts'
import { QUICK_LATENCY_MS, simulateNetwork } from './mock/latency.ts'
import { allPorts, destinationPorts, loadingPorts } from './mock/reference-data.ts'

function matches(query: string, port: PortOption): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return port.name.toLowerCase().includes(q) || port.code.toLowerCase().includes(q)
}

/** Ports of loading: Indian ports only (codes start with `IN`). */
export function searchLoadingPorts(query: string): Promise<PortOption[]> {
  return simulateNetwork(() => loadingPorts.filter((port) => port.code.startsWith('IN') && matches(query, port)), {
    query
  })
}

/** Final destination ports. */
export function searchDestinationPorts(query: string): Promise<PortOption[]> {
  return simulateNetwork(() => destinationPorts.filter((port) => matches(query, port)), { query })
}

/** Resolve one port by code (label rendering for saved values). */
export function getPortByCode(code: string): Promise<PortOption | undefined> {
  return simulateNetwork(() => allPorts.find((port) => port.code === code), { delayMs: QUICK_LATENCY_MS })
}

/** Every known port — feeds plain selects such as "discharge port". */
export function listAllPorts(): Promise<PortOption[]> {
  return simulateNetwork(() => allPorts, { delayMs: QUICK_LATENCY_MS })
}
