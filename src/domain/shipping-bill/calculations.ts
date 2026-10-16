/**
 * Pure calculations over form values: number parsing, line/invoice totals and
 * port → country resolution. No React, no services — trivially unit-testable.
 */
import type { BillInvoiceForm, BillItemForm, PortOption } from './types.ts'

/** `true` when the value carries no information (undefined, null or blank). */
export function isBlank(value: unknown): boolean {
  return value == null || String(value).trim() === ''
}

/** Parse a numeric input; blank/invalid values become `undefined`. */
export function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (isBlank(value)) return undefined
  const parsed = Number(String(value).trim())
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Parse a numeric input; blank/invalid values become `0`. */
export function parseNumberOrZero(value: unknown): number {
  return parseOptionalNumber(value) ?? 0
}

/**
 * Line total for an item: an explicit `lineTotal` override wins, otherwise
 * quantity × unit price. Mirrors the starter's behaviour.
 */
export function lineTotal(item: BillItemForm): number {
  const override = parseOptionalNumber(item.lineTotal)
  if (override !== undefined) return override
  return parseNumberOrZero(item.quantity) * parseNumberOrZero(item.unitPrice)
}

/** Sum of all item line totals on an invoice. */
export function invoiceTotal(invoice: BillInvoiceForm): number {
  return invoice.items.reduce((sum, item) => sum + lineTotal(item), 0)
}

/**
 * Invoice total as it should be persisted: an explicit override wins,
 * otherwise the computed sum of items.
 */
export function effectiveInvoiceTotal(invoice: BillInvoiceForm): number {
  const override = parseOptionalNumber(invoice.invoiceTotal)
  return override !== undefined ? override : invoiceTotal(invoice)
}

/** Sum across every invoice of a bill (used by the dashboard list). */
export function billItemsTotal(invoices: BillInvoiceForm[]): number {
  return invoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)
}

/**
 * Resolve the country code of a port: exact match in the known ports first,
 * then fall back to the two-letter prefix of the UN/LOCODE-style code.
 */
export function portCountry(code: string | undefined, knownPorts: PortOption[]): string {
  if (isBlank(code)) return ''
  const match = knownPorts.find((port) => port.code === code)
  if (match) return match.countryCode
  return code?.match(/^[A-Z]{2}/)?.[0] ?? ''
}

/** Convert "days since Unix epoch" (backend date format) to `YYYY-MM-DD`. */
export function epochDaysToIsoDate(days: unknown): string {
  if (typeof days !== 'number' || !Number.isFinite(days)) return ''
  const date = new Date(days * 86_400_000)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

/** Convert "seconds (or ms) since Unix epoch" to a full ISO timestamp. */
export function epochToIsoString(value: unknown): string {
  const fallback = new Date().toISOString()
  if (!value) return fallback
  if (typeof value === 'number') {
    const ms = value < 10_000_000_000 ? value * 1000 : value
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
  }
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? fallback : fallback
}
