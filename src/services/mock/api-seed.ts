/**
 * Legacy "backend" seed records.
 *
 * The starter dashboard began life showing bills that a real backend used to
 * serve (summary records with epoch-day dates and numeric ids). There is no
 * backend for this exercise, so those records are normalised into `SavedBill`
 * objects here — a trimmed port of the starter's `normalizeApiBill` — to keep
 * the seeded dashboard realistic.
 */
import { epochDaysToIsoDate, epochToIsoString } from '../../domain/shipping-bill/calculations.ts'
import { emptyBill } from '../../domain/shipping-bill/defaults.ts'
import type { SavedBill } from '../../domain/shipping-bill/types.ts'

interface LegacyBillRecord {
  id: number
  jobNumber: number
  /** Days since Unix epoch. */
  jobDate: number
  exporterName: string
  consigneeName: string
  loadingPort: string
  dischargePort: string
  destinationPort: string
  /** Seconds since Unix epoch. */
  updated: number
}

export const legacyBillRecords: LegacyBillRecord[] = [
  { id: 1000, jobNumber: 150011, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1790967817 },
  { id: 1001, jobNumber: 150012, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1790968385 },
  { id: 1002, jobNumber: 150013, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1790969061 },
  { id: 1003, jobNumber: 150014, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1790969592 },
  { id: 1004, jobNumber: 150015, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791003787 },
  { id: 1005, jobNumber: 150016, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791010527 },
  { id: 1006, jobNumber: 150017, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791138507 },
  { id: 1007, jobNumber: 150018, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791139137 },
  { id: 1008, jobNumber: 150019, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791139150 },
  { id: 1009, jobNumber: 150020, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791139885 },
  { id: 1010, jobNumber: 150021, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791140799 },
  { id: 1011, jobNumber: 150022, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791140811 },
  { id: 1012, jobNumber: 150023, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791141353 },
  { id: 1013, jobNumber: 150024, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791141776 },
  { id: 1014, jobNumber: 150025, jobDate: 20728, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'KRBUS', destinationPort: 'KRBUS', updated: 1791143087 },
  { id: 1021, jobNumber: 150026, jobDate: 20714, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'INMUN1', destinationPort: 'USMSY', updated: 1791183194 },
  { id: 1023, jobNumber: 150028, jobDate: 20714, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'INMUN1', destinationPort: 'USMSY', updated: 1791449123 },
  { id: 1024, jobNumber: 150029, jobDate: 20714, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'INMUN1', destinationPort: 'USMSY', updated: 1791449142 },
  { id: 1025, jobNumber: 150030, jobDate: 20714, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'INMUN1', destinationPort: 'USMSY', updated: 1791449171 },
  { id: 1026, jobNumber: 150031, jobDate: 20714, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'INMUN1', destinationPort: 'USMSY', updated: 1791449252 },
  { id: 1027, jobNumber: 150032, jobDate: 20714, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'INMUN1', destinationPort: 'USMSY', updated: 1791449308 },
  { id: 1028, jobNumber: 150033, jobDate: 20714, exporterName: 'Amit Exports', consigneeName: 'H&M HENNES & MAURITZ LTD', loadingPort: 'INMUN1', dischargePort: 'INMUN1', destinationPort: 'USMSY', updated: 1791452556 }
]

/**
 * Normalise one legacy summary record into the app's `SavedBill` shape.
 * Summary records carry display names only (no party ids) and no invoices,
 * so the editable form opens with the defaults filled in around them.
 */
export function normalizeLegacyBill(raw: LegacyBillRecord): SavedBill {
  const values = emptyBill()
  values.jobNumber = String(raw.jobNumber)
  values.jobDate = epochDaysToIsoDate(raw.jobDate)
  values.exporterName = raw.exporterName
  values.consigneeName = raw.consigneeName
  values.loadingPort = raw.loadingPort
  values.finalDestinationPort = raw.destinationPort
  values.dischargePort = raw.dischargePort || raw.destinationPort
  values.natureOfCargo = 'P'
  values.measurementUnit = 'KGS'
  values.loosePackets = '0'
  values.numberOfContainers = '0'
  // Legacy summaries have no invoice detail; the form starts one empty invoice.
  values.invoices = [
    {
      ...values.invoices[0],
      invoiceNumber: `INV-${raw.id}`
    }
  ]

  const updated = epochToIsoString(raw.updated)
  return { id: raw.id, created: updated, updated, values }
}

export const legacyBills: SavedBill[] = legacyBillRecords.map(normalizeLegacyBill)
