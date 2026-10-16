import assert from 'node:assert/strict'
import { test } from 'node:test'

import { emptyBill, emptyInvoice, emptyItem } from './defaults.ts'
import type { ShippingBillFormValues } from './types.ts'
import { firstTabWithErrors, hasErrors, tabForErrorPath, validateBill } from './validation.ts'

/** A bill with every required field filled — the baseline for the tests. */
function validBill(): ShippingBillFormValues {
  const bill = emptyBill()
  bill.exporterId = '1000'
  bill.exporterBranchId = '1001'
  bill.consigneeId = '2002'
  bill.consigneeBranchId = '2003'
  bill.loadingPort = 'INMUN1'
  bill.finalDestinationPort = 'USMSY'
  const invoice = bill.invoices[0]
  invoice.invoiceNumber = 'EX/1/2026'
  invoice.items = [{ ...emptyItem(), ritcCode: '61091000', goodsDescription1: 'Shirts', quantity: '10', unitPrice: '2' }]
  return bill
}

test('a fully filled bill has no errors', () => {
  assert.deepEqual(validateBill(validBill()), {})
})

test('an empty bill reports every required field', () => {
  const errors = validateBill(emptyBill())
  for (const path of [
    'exporterId',
    'exporterBranchId',
    'consigneeId',
    'consigneeBranchId',
    'loadingPort',
    'finalDestinationPort',
    'invoices.0.invoiceNumber',
    'invoices.0.items.0.ritcCode',
    'invoices.0.items.0.goodsDescription1',
    'invoices.0.items.0.quantity',
    'invoices.0.items.0.unitPrice'
  ]) {
    assert.ok(errors[path], `expected an error at ${path}`)
  }
})

test('quantity and unit price must be above zero', () => {
  const bill = validBill()
  bill.invoices[0].items[0].quantity = '0'
  bill.invoices[0].items[0].unitPrice = '-3'
  const errors = validateBill(bill)
  assert.equal(errors['invoices.0.items.0.quantity'], 'Enter a number above zero')
  assert.equal(errors['invoices.0.items.0.unitPrice'], 'Enter a number above zero')
})

test('invoice total override cannot be negative', () => {
  const bill = validBill()
  bill.invoices[0].invoiceTotal = '-5'
  assert.equal(validateBill(bill)['invoices.0.invoiceTotal'], 'Total cannot be negative')
})

test('buyer fields become required when buyer differs from consignee', () => {
  const bill = validBill()
  bill.invoices[0].buyerSameAsConsignee = false
  const errors = validateBill(bill)
  assert.equal(errors['invoices.0.buyerId'], 'Required')
  assert.equal(errors['invoices.0.buyerBranchId'], 'Required')

  bill.invoices[0].buyerId = '2010'
  bill.invoices[0].buyerBranchId = '2011'
  assert.equal(hasErrors(validateBill(bill)), false)
})

test('net weight may not exceed gross weight', () => {
  const bill = validBill()
  bill.grossWeight = '100'
  bill.netWeight = '120'
  assert.equal(validateBill(bill).netWeight, 'Net weight cannot exceed gross weight')
  bill.netWeight = '80'
  assert.equal(validateBill(bill).netWeight, undefined)
})

test('an invoice must contain at least one item', () => {
  const bill = validBill()
  bill.invoices[0].items = []
  assert.equal(validateBill(bill)['invoices.0.items'], 'Add at least one item')
})

test('third-party items require a third party and branch', () => {
  const bill = validBill()
  bill.invoices[0].items[0].thirdPartyItem = true
  const errors = validateBill(bill)
  assert.equal(errors['invoices.0.items.0.itemThirdPartyId'], 'Required')
  assert.equal(errors['invoices.0.items.0.itemThirdPartyBranchId'], 'Required')
})

test('packing ranges must be complete and ordered', () => {
  const bill = validBill()
  bill.packingRanges = [{ packingNumberFrom: '10', packingNumberTo: '4' }]
  assert.equal(
    validateBill(bill)['packingRanges.0.packingNumberTo'],
    'To must be greater than or equal to From'
  )
  bill.packingRanges = [{ packingNumberFrom: '', packingNumberTo: '' }]
  const errors = validateBill(bill)
  assert.equal(errors['packingRanges.0.packingNumberFrom'], 'Required')
  assert.equal(errors['packingRanges.0.packingNumberTo'], 'Required')
})

test('container, document and licence rows must carry their key fields', () => {
  const bill = validBill()
  bill.containers = [{ containerNumber: '' }]
  bill.documents = [{ documentTypeCode: '', documentReferenceNumber: '' }]
  bill.licenses = [{ registrationNumber: '' }]
  const errors = validateBill(bill)
  assert.equal(errors['containers.0.containerNumber'], 'Required')
  assert.equal(errors['documents.0.documentTypeCode'], 'Required')
  assert.equal(errors['documents.0.documentReferenceNumber'], 'Required')
  assert.equal(errors['licenses.0.registrationNumber'], 'Required')
})

test('error paths map to the owning tab', () => {
  assert.equal(tabForErrorPath('exporterId'), 'details')
  assert.equal(tabForErrorPath('invoices.2.items.0.quantity'), 'invoices')
  assert.equal(tabForErrorPath('documents.0.documentTypeCode'), 'documents')
  assert.equal(tabForErrorPath('packingRanges.0.packingNumberTo'), 'documents')
})

test('firstTabWithErrors prefers details, then invoices, then others', () => {
  assert.equal(firstTabWithErrors({}), null)
  assert.equal(firstTabWithErrors({ 'documents.0.documentTypeCode': 'Required' }), 'documents')
  assert.equal(
    firstTabWithErrors({ 'invoices.0.invoiceNumber': 'Required', 'documents.0.fileType': 'Required' }),
    'invoices'
  )
  assert.equal(firstTabWithErrors({ exporterId: 'Required', 'invoices.0.invoiceNumber': 'Required' }), 'details')
})

test('multiple invoices are validated independently', () => {
  const bill = validBill()
  const second = emptyInvoice() // missing invoice number and valid items
  bill.invoices.push(second)
  const errors = validateBill(bill)
  assert.equal(errors['invoices.1.invoiceNumber'], 'Required')
  assert.equal(errors['invoices.0.invoiceNumber'], undefined)
})
