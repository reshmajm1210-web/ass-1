/**
 * Bill validation — one pure function over the whole form.
 *
 * Error keys are dot paths into `ShippingBillFormValues`
 * (e.g. `invoices.0.items.1.quantity`), which lets any field component look
 * up "its" error and lets the form jump to the first tab with problems.
 *
 * Rules marked (assumption) go beyond the starter's schema; they encode
 * sensible shipping-bill relationships and are documented in the README.
 */
import { isBlank, parseOptionalNumber } from './calculations.ts'
import type { FieldErrors } from './validation-types.ts'
import type { BillInvoiceForm, BillItemForm, ShippingBillFormValues } from './types.ts'

export type { FieldErrors } from './validation-types.ts'

const REQUIRED = 'Required'
const POSITIVE = 'Enter a number above zero'

/** Fields whose errors live on the first tab ("Details"). */
const DETAILS_FIELDS = [
  'jobDate',
  'exporterId',
  'exporterBranchId',
  'consigneeId',
  'consigneeBranchId',
  'loadingPort',
  'finalDestinationPort',
  'grossWeight',
  'netWeight'
] as const

function validateItem(item: BillItemForm, prefix: string, errors: FieldErrors): void {
  if (isBlank(item.ritcCode)) errors[`${prefix}.ritcCode`] = REQUIRED
  if (isBlank(item.goodsDescription1)) errors[`${prefix}.goodsDescription1`] = REQUIRED

  const quantity = parseOptionalNumber(item.quantity)
  if (quantity === undefined || quantity <= 0) errors[`${prefix}.quantity`] = POSITIVE

  const unitPrice = parseOptionalNumber(item.unitPrice)
  if (unitPrice === undefined || unitPrice <= 0) errors[`${prefix}.unitPrice`] = POSITIVE

  if (isBlank(item.unitOfMeasurement)) errors[`${prefix}.unitOfMeasurement`] = REQUIRED

  // (assumption) A third-party item must say which third party supplies it.
  if (item.thirdPartyItem) {
    if (isBlank(item.itemThirdPartyId)) errors[`${prefix}.itemThirdPartyId`] = REQUIRED
    if (isBlank(item.itemThirdPartyBranchId)) errors[`${prefix}.itemThirdPartyBranchId`] = REQUIRED
  }
}

function validateInvoice(invoice: BillInvoiceForm, index: number, errors: FieldErrors): void {
  const prefix = `invoices.${index}`
  if (isBlank(invoice.invoiceNumber)) errors[`${prefix}.invoiceNumber`] = REQUIRED
  if (isBlank(invoice.invoiceDate)) errors[`${prefix}.invoiceDate`] = REQUIRED
  if (isBlank(invoice.currency)) errors[`${prefix}.currency`] = REQUIRED
  if (isBlank(invoice.contractType)) errors[`${prefix}.contractType`] = REQUIRED

  if (!isBlank(invoice.invoiceTotal)) {
    const total = parseOptionalNumber(invoice.invoiceTotal)
    if (total === undefined || total < 0) errors[`${prefix}.invoiceTotal`] = 'Total cannot be negative'
  }

  // (assumption) When the buyer differs from the consignee, both buyer fields
  // must be filled — the invoice needs a billing party.
  if (!invoice.buyerSameAsConsignee) {
    if (isBlank(invoice.buyerId)) errors[`${prefix}.buyerId`] = REQUIRED
    if (isBlank(invoice.buyerBranchId)) errors[`${prefix}.buyerBranchId`] = REQUIRED
  }

  // (assumption) An invoice without goods is not a valid shipping-bill invoice.
  if (invoice.items.length === 0) {
    errors[`${prefix}.items`] = 'Add at least one item'
  }
  invoice.items.forEach((item, itemIndex) => validateItem(item, `${prefix}.items.${itemIndex}`, errors))
}

export function validateBill(values: ShippingBillFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (isBlank(values.jobDate)) errors.jobDate = REQUIRED
  if (isBlank(values.exporterId)) errors.exporterId = REQUIRED
  if (isBlank(values.exporterBranchId)) errors.exporterBranchId = REQUIRED
  if (isBlank(values.consigneeId)) errors.consigneeId = REQUIRED
  if (isBlank(values.consigneeBranchId)) errors.consigneeBranchId = REQUIRED
  if (isBlank(values.loadingPort)) errors.loadingPort = REQUIRED
  if (isBlank(values.finalDestinationPort)) errors.finalDestinationPort = REQUIRED

  // (assumption) Net weight may not exceed gross weight when both are given.
  const gross = parseOptionalNumber(values.grossWeight)
  const net = parseOptionalNumber(values.netWeight)
  if (gross !== undefined && net !== undefined && net > gross) {
    errors.netWeight = 'Net weight cannot exceed gross weight'
  }

  values.invoices.forEach((invoice, index) => validateInvoice(invoice, index, errors))

  // (assumption) A container row must at least identify the container.
  values.containers.forEach((container, index) => {
    if (isBlank(container.containerNumber)) errors[`containers.${index}.containerNumber`] = REQUIRED
  })

  // (assumption) A packing range must be complete and ordered.
  values.packingRanges.forEach((range, index) => {
    const prefix = `packingRanges.${index}`
    const from = parseOptionalNumber(range.packingNumberFrom)
    const to = parseOptionalNumber(range.packingNumberTo)
    if (from === undefined) errors[`${prefix}.packingNumberFrom`] = REQUIRED
    if (to === undefined) errors[`${prefix}.packingNumberTo`] = REQUIRED
    if (from !== undefined && to !== undefined && to < from) {
      errors[`${prefix}.packingNumberTo`] = 'To must be greater than or equal to From'
    }
  })

  // (assumption) A document row must identify type + reference to be useful.
  values.documents.forEach((document, index) => {
    if (isBlank(document.documentTypeCode)) errors[`documents.${index}.documentTypeCode`] = REQUIRED
    if (isBlank(document.documentReferenceNumber)) {
      errors[`documents.${index}.documentReferenceNumber`] = REQUIRED
    }
  })

  // (assumption) A licence row must carry its registration number.
  values.licenses.forEach((license, index) => {
    if (isBlank(license.registrationNumber)) errors[`licenses.${index}.registrationNumber`] = REQUIRED
  })

  return errors
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export type BillTabId = 'details' | 'invoices' | 'documents'

/**
 * Map an error path to the tab that owns it. Used after a failed submit to
 * bring the user to the first tab that needs attention (starter behaviour).
 */
export function tabForErrorPath(path: string): BillTabId {
  if (path.startsWith('invoices.')) return 'invoices'
  if (
    path.startsWith('containers.') ||
    path.startsWith('packingRanges.') ||
    path.startsWith('documents.') ||
    path.startsWith('licenses.')
  ) {
    return 'documents'
  }
  return 'details'
}

/**
 * The tab to jump to when submission failed: details-tab fields first, then
 * invoices, then the "Others" tab — same priority the starter used.
 */
export function firstTabWithErrors(errors: FieldErrors): BillTabId | null {
  const paths = Object.keys(errors)
  if (paths.length === 0) return null
  if (paths.some((path) => (DETAILS_FIELDS as readonly string[]).includes(path))) return 'details'
  if (paths.some((path) => tabForErrorPath(path) === 'invoices')) return 'invoices'
  if (paths.some((path) => tabForErrorPath(path) === 'documents')) return 'documents'
  return 'details'
}
