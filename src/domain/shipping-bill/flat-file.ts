/**
 * ICEGATE-style flat file (.sb) generation for a saved bill.
 * Pure string building — the browser download lives in the service layer.
 * Ported 1:1 from the starter so the file format stays unchanged.
 */
import { parseNumberOrZero } from './calculations.ts'
import type { SavedBill } from './types.ts'

/** Characters that would corrupt the `^`-delimited flat-file format. */
function sanitize(text: string): string {
  return text.replace(/[\^\r\n]+/g, ' ')
}

export function generateFlatFileContent(bill: SavedBill): string {
  const v = bill.values
  const lines: string[] = []

  lines.push(`HREC**ZZ*${v.loadingPort || 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)
  lines.push('<TABLE>SHIPPING_BILL')
  lines.push(
    '<F>MESSAGE_TYPE^CHA_ID^JOB_NO^JOB_DATE^EXPORTER_ID^EXPORTER_BRANCH^CONSIGNEE_ID^LOADING_PORT^DEST_PORT^DISCHARGE_PORT^SEAL_TYPE^NATURE_OF_CARGO^GROSS_WEIGHT^NET_WEIGHT^UOM^PACKAGES^MARKS'
  )
  lines.push(
    `<R>F^1000^${v.jobNumber || bill.id}^${v.jobDate || ''}^${v.exporterId || ''}^${v.exporterBranchId || ''}^${v.consigneeId || ''}^${v.loadingPort || ''}^${v.finalDestinationPort || ''}^${v.dischargePort || v.finalDestinationPort || ''}^${v.sealType || ''}^${v.natureOfCargo || ''}^${v.grossWeight || ''}^${v.netWeight || ''}^${v.measurementUnit || 'KGS'}^${v.totalPackages || ''}^${sanitize(v.marksAndNumbers || '')}`
  )

  if (v.invoices.length > 0) {
    lines.push('<TABLE>INVOICE')
    lines.push('<F>INVOICE_SN^INVOICE_NO^INVOICE_DATE^CURRENCY^CONTRACT_TYPE^BUYER_ID^FREIGHT_AMOUNT^INSURANCE_AMOUNT')
    v.invoices.forEach((invoice, index) => {
      lines.push(
        `<R>${index + 1}^${invoice.invoiceNumber}^${invoice.invoiceDate || ''}^${invoice.currency || 'USD'}^${invoice.contractType || '1'}^${invoice.buyerId || v.consigneeId || ''}^${invoice.freightAmount || 0}^${invoice.insuranceAmount || 0}`
      )
    })

    lines.push('<TABLE>ITEM')
    lines.push('<F>INVOICE_SN^ITEM_SN^RITC_CODE^DESCRIPTION^QUANTITY^UOM^UNIT_PRICE^LINE_TOTAL^SCHEME_CODE')
    v.invoices.forEach((invoice, invoiceIndex) => {
      invoice.items.forEach((item, itemIndex) => {
        const total = parseNumberOrZero(item.quantity) * parseNumberOrZero(item.unitPrice)
        lines.push(
          `<R>${invoiceIndex + 1}^${itemIndex + 1}^${item.ritcCode || ''}^${sanitize(item.goodsDescription1 || '')}^${item.quantity || ''}^${item.unitOfMeasurement || 'PCS'}^${item.unitPrice || ''}^${total.toFixed(2)}^${item.schemeCode || ''}`
        )
      })
    })
  }

  if (v.packingRanges.length > 0) {
    lines.push('<TABLE>PACKING')
    lines.push('<F>FROM_PKG^TO_PKG^PKG_CODE')
    v.packingRanges.forEach((range) => {
      lines.push(`<R>${range.packingNumberFrom}^${range.packingNumberTo}^${range.packingCode || 'CTN'}`)
    })
  }

  lines.push(`TREC**ZZ*${v.loadingPort || 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)

  return lines.join('\r\n')
}

export function flatFileFilename(bill: SavedBill): string {
  return `shipping_bill_${bill.values.jobNumber || bill.id}.sb`
}
