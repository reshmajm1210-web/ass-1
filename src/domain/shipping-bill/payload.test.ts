import assert from 'node:assert/strict'
import { test } from 'node:test'

import { emptyBill, emptyItem } from './defaults.ts'
import { toShippingBillPayload } from './payload.ts'
import type { PortOption, ShippingBillFormValues } from './types.ts'

const ports: PortOption[] = [
  { code: 'INMUN1', name: 'Mundra', countryCode: 'IN' },
  { code: 'USMSY', name: 'New Orleans', countryCode: 'US' }
]

function sampleBill(): ShippingBillFormValues {
  const bill = emptyBill()
  bill.jobNumber = '2081'
  bill.jobDate = '2026-09-18'
  bill.exporterId = '1000'
  bill.exporterBranchId = '1001'
  bill.consigneeId = '2002'
  bill.consigneeBranchId = '2003'
  bill.loadingPort = 'INMUN1'
  bill.finalDestinationPort = 'USMSY'
  bill.grossWeight = '34.6'
  bill.netWeight = '23.5'
  bill.totalPackages = '12'
  const invoice = bill.invoices[0]
  invoice.invoiceNumber = 'EX/2081/2026'
  invoice.invoiceDate = '2026-09-17'
  invoice.items = [
    { ...emptyItem(), ritcCode: '61091000', goodsDescription1: 'Cotton T-shirts', quantity: '51', unitPrice: '3.831' }
  ]
  return bill
}

test('maps header fields to snake_case and derives countries from ports', () => {
  const payload = toShippingBillPayload(sampleBill(), ports)
  assert.equal(payload.shipping_bill.job_number, 2081)
  assert.equal(payload.shipping_bill.exporter, 1000)
  assert.equal(payload.shipping_bill.consignee_address, 2003)
  assert.equal(payload.shipping_bill.loading_country_code, 'IN')
  assert.equal(payload.shipping_bill.final_destination_country_code, 'US')
  assert.equal(payload.shipping_bill.grossweight, 34.6)
})

test('discharge port defaults to the final destination', () => {
  const bill = sampleBill()
  const payload = toShippingBillPayload(bill, ports)
  assert.equal(payload.shipping_bill.discharge_port, 'USMSY')
  assert.equal(payload.shipping_bill.discharge_country_code, 'US')

  bill.dischargePort = 'DEHAM'
  const withDischarge = toShippingBillPayload(bill, ports)
  assert.equal(withDischarge.shipping_bill.discharge_port, 'DEHAM')
  assert.equal(withDischarge.shipping_bill.discharge_country_code, 'DE') // prefix fallback
})

test('container rows take precedence over the free-text counter', () => {
  const bill = sampleBill()
  bill.numberOfContainers = '7'
  assert.equal(toShippingBillPayload(bill, ports).shipping_bill.number_of_containers, 7)
  bill.containers = [{ containerNumber: 'MSKU123' }, { containerNumber: 'MSKU456' }]
  assert.equal(toShippingBillPayload(bill, ports).shipping_bill.number_of_containers, 2)
})

test('buyer resolves to consignee when "same as consignee" is checked', () => {
  const bill = sampleBill()
  const payload = toShippingBillPayload(bill, ports)
  assert.equal(payload.invoices[0].buyer, 2002)
  assert.equal(payload.invoices[0].buyer_address, 2003)

  bill.invoices[0].buyerSameAsConsignee = false
  bill.invoices[0].buyerId = '2010'
  bill.invoices[0].buyerBranchId = '2011'
  const separate = toShippingBillPayload(bill, ports)
  assert.equal(separate.invoices[0].buyer, 2010)
  assert.equal(separate.invoices[0].buyer_address, 2011)
})

test('charge currencies fall back to the invoice currency', () => {
  const bill = sampleBill()
  bill.invoices[0].currency = 'EUR'
  const payload = toShippingBillPayload(bill, ports)
  assert.equal(payload.invoices[0].freight_currency, 'EUR')
  assert.equal(payload.invoices[0].insurance_currency, 'EUR')

  bill.invoices[0].freightCurrency = 'USD'
  assert.equal(toShippingBillPayload(bill, ports).invoices[0].freight_currency, 'USD')
})

test('invoice total: override wins, otherwise sum of items', () => {
  const bill = sampleBill()
  const computed = toShippingBillPayload(bill, ports)
  assert.ok(Math.abs(computed.invoices[0].invoice_total - 51 * 3.831) < 1e-9)

  bill.invoices[0].invoiceTotal = '500'
  assert.equal(toShippingBillPayload(bill, ports).invoices[0].invoice_total, 500)
})

test('IGST taxable value and amount are only sent when IGST was paid', () => {
  const bill = sampleBill()
  bill.invoices[0].items[0].igstPaymentStatus = 'LUT'
  bill.invoices[0].items[0].taxableValue = '100'
  bill.invoices[0].items[0].igstAmount = '18'
  let item = toShippingBillPayload(bill, ports).invoices[0].items[0]
  assert.equal(item.taxable_value, undefined)
  assert.equal(item.igst_amount, undefined)

  bill.invoices[0].items[0].igstPaymentStatus = 'P'
  item = toShippingBillPayload(bill, ports).invoices[0].items[0]
  assert.equal(item.taxable_value, 100)
  assert.equal(item.igst_amount, 18)
})

test('third-party items and AR4 details flatten into their own collections', () => {
  const bill = sampleBill()
  const item = bill.invoices[0].items[0]
  item.thirdPartyItem = true
  item.itemThirdPartyId = '2030'
  item.itemThirdPartyBranchId = '2031'
  item.ar4Number = 'AR4-99'
  item.ar4Date = '2026-09-10'

  const payload = toShippingBillPayload(bill, ports)
  assert.deepEqual(payload.invoice_item_third_parties, [
    { invoice_serial_number: 1, item_serial_number: 1, third_party: 2030, third_party_address: 2031 }
  ])
  assert.equal(payload.ar4_details.length, 1)
  assert.equal(payload.ar4_details[0].ar4_number, 'AR4-99')
})

test('document issue date is converted to epoch days', () => {
  const bill = sampleBill()
  bill.documents = [
    { documentTypeCode: '271000', documentReferenceNumber: 'PKL-1', documentIssueDate: '1970-01-11' }
  ]
  const payload = toShippingBillPayload(bill, ports)
  assert.equal(payload.supporting_docs[0].document_issue_date, 10)
})
