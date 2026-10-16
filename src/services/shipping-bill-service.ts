/**
 * Shipping-bill service — list, fetch, save and flat-file download.
 *
 * This is the single data-access boundary for bills. The starter mixed
 * `fetch` calls to a non-existent backend, silent catch-and-fallbacks and a
 * second in-memory bill list into one file; here every operation is a clean
 * Promise against the mock store, ready to be pointed at real endpoints.
 */
import { flatFileFilename, generateFlatFileContent } from '../domain/shipping-bill/flat-file.ts'
import { toShippingBillPayload } from '../domain/shipping-bill/payload.ts'
import type { SavedBill, ShippingBillFormValues } from '../domain/shipping-bill/types.ts'
import { QUICK_LATENCY_MS, simulateNetwork } from './mock/latency.ts'
import { allPorts } from './mock/reference-data.ts'
import { getSnapshot, nextId, upsertBill } from './mock/store.ts'

/** GET /api/shipping-bills — newest first. */
export function listBills(): Promise<SavedBill[]> {
  return simulateNetwork(() => getSnapshot().bills)
}

/** GET /api/shipping-bills/:id */
export function getBillById(id: string | number): Promise<SavedBill | undefined> {
  return simulateNetwork(() => getSnapshot().bills.find((bill) => String(bill.id) === String(id)), {
    delayMs: QUICK_LATENCY_MS
  })
}

/**
 * POST /api/shipping-bills — create (no id) or update (with id).
 * The save payload is assembled here, at the data boundary, so form values
 * never carry parsed numbers or resolved references.
 */
export function saveBill(values: ShippingBillFormValues, id?: number): Promise<SavedBill> {
  return simulateNetwork(() => {
    const now = new Date().toISOString()
    const previous = id !== undefined ? getSnapshot().bills.find((bill) => bill.id === id) : undefined
    const record: SavedBill = {
      id: id ?? nextId(),
      created: previous ? previous.created : now,
      updated: now,
      values: withPartyNames(values),
      payload: toShippingBillPayload(values, allPorts)
    }
    upsertBill(record)
    return record
  })
}

/**
 * Denormalise party display names onto the saved values so list views can
 * render them without joining parties (and legacy records keep their names).
 */
function withPartyNames(values: ShippingBillFormValues): ShippingBillFormValues {
  const snapshot = getSnapshot()
  const exporter = snapshot.exporters.find((item) => String(item.id) === values.exporterId)
  const consignee = snapshot.businesses.find((item) => String(item.id) === values.consigneeId)
  return {
    ...values,
    exporterName: exporter?.name ?? values.exporterName ?? '',
    consigneeName: consignee?.name ?? values.consigneeName ?? ''
  }
}

export interface FlatFileDownload {
  filename: string
  content: string
}

/**
 * GET /api/shipping-bills/:id/flat-file — generate the ICEGATE-style `.sb`
 * flat file for a bill and trigger the browser download.
 */
export function downloadFlatFile(bill: SavedBill): Promise<FlatFileDownload> {
  return simulateNetwork(() => {
    const content = generateFlatFileContent(bill)
    const filename = flatFileFilename(bill)
    triggerBlobDownload(content, filename)
    return { filename, content }
  }, { delayMs: QUICK_LATENCY_MS })
}

function triggerBlobDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}
