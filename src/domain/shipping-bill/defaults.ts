/**
 * Factory defaults for new bills and their nested rows.
 * Keeping them in one place means the UI never hardcodes "what a new
 * invoice/item looks like" — it just asks the domain.
 */
import type {
  BillInvoiceForm,
  BillItemForm,
  ContainerForm,
  LicenseForm,
  PackingRangeForm,
  ShippingBillFormValues,
  SupportingDocForm
} from './types.ts'

/** Today's date as `YYYY-MM-DD` (local time), the format `<input type="date">` uses. */
export function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function emptyItem(): BillItemForm {
  return {
    ritcCode: '',
    goodsDescription1: '',
    quantity: '',
    unitOfMeasurement: 'PCS',
    unitPrice: '',
    lineTotal: '',
    // "Preferential trade benefit not claimed" is the sensible default.
    tradeAgreementsCode: 'NCPTI'
  }
}

export function emptyInvoice(): BillInvoiceForm {
  return {
    invoiceNumber: '',
    invoiceDate: todayIsoDate(),
    currency: 'USD',
    contractType: 'FOB',
    buyerSameAsConsignee: true,
    buyerId: '',
    buyerBranchId: '',
    items: [emptyItem()]
  }
}

export function emptyContainer(): ContainerForm {
  return { containerNumber: '' }
}

export function emptyPackingRange(): PackingRangeForm {
  return { packingNumberFrom: '', packingNumberTo: '' }
}

export function emptyDocument(): SupportingDocForm {
  return {
    documentTypeCode: '',
    documentReferenceNumber: '',
    documentIssueDate: todayIsoDate()
  }
}

export function emptyLicense(): LicenseForm {
  return { registrationNumber: '' }
}

export function emptyBill(): ShippingBillFormValues {
  return {
    jobDate: todayIsoDate(),
    exporterId: '',
    exporterBranchId: '',
    consigneeId: '',
    consigneeBranchId: '',
    loadingPort: '',
    finalDestinationPort: '',
    natureOfCargo: 'P',
    measurementUnit: 'KG',
    invoices: [emptyInvoice()],
    containers: [],
    packingRanges: [],
    documents: [],
    licenses: []
  }
}
