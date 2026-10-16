import assert from 'node:assert/strict'
import { test } from 'node:test'

import { appendRow, errorAt, getPath, getRows, removeRow, setPath, updateRow } from './paths.ts'
import { emptyBill } from '../domain/shipping-bill/defaults.ts'

test('getPath reads nested values through objects and arrays', () => {
  const bill = emptyBill()
  bill.invoices[0].invoiceNumber = 'EX/1'
  assert.equal(getPath(bill, 'invoices.0.invoiceNumber'), 'EX/1')
  assert.equal(getPath(bill, 'invoices.9.invoiceNumber'), undefined)
  assert.equal(getPath(bill, 'nothing.here'), undefined)
})

test('setPath updates immutably, leaving the original untouched', () => {
  const bill = emptyBill()
  const next = setPath(bill, 'invoices.0.items.0.quantity', '7')

  assert.equal(getPath(next, 'invoices.0.items.0.quantity'), '7')
  assert.equal(getPath(bill, 'invoices.0.items.0.quantity'), '')
  // Untouched branches are shared, not cloned.
  assert.equal(bill.exporterId, next.exporterId)
  assert.equal(bill.containers, next.containers)
  assert.notEqual(bill.invoices, next.invoices)
  assert.notEqual(bill.invoices[0].items, next.invoices[0].items)
})

test('setPath writes to plain object paths too', () => {
  const bill = emptyBill()
  const next = setPath(bill, 'exporterId', '1040')
  assert.equal(next.exporterId, '1040')
  assert.equal(bill.exporterId, '')
})

test('appendRow and removeRow add and drop rows by index', () => {
  const bill = emptyBill()
  const withTwo = appendRow(bill, 'containers', { containerNumber: 'ABCD1234567' })

  assert.equal(getRows(withTwo, 'containers').length, 1)
  assert.equal(getRows(bill, 'containers').length, 0)

  const withThree = appendRow(withTwo, 'containers', { containerNumber: 'EFGH7654321' })
  const withoutFirst = removeRow(withThree, 'containers', 0)
  assert.deepEqual(getRows(withoutFirst, 'containers'), [{ containerNumber: 'EFGH7654321' }])
  assert.equal(getRows(withThree, 'containers').length, 2)
})

test('removeRow ignores out-of-range indexes', () => {
  const bill = emptyBill()
  assert.equal(removeRow(bill, 'containers', 3), bill)
  assert.equal(removeRow(bill, 'containers', -1), bill)
})

test('updateRow replaces a single row', () => {
  const bill = appendRow(emptyBill(), 'licenses', { registrationNumber: 'A' })
  const updated = updateRow(bill, 'licenses', 0, (row) => ({
    ...(row as Record<string, unknown>),
    registrationNumber: 'B'
  }))
  assert.equal(getRows<{ registrationNumber: string }>(updated, 'licenses')[0].registrationNumber, 'B')
})

test('getRows tolerates missing paths', () => {
  assert.deepEqual(getRows(emptyBill(), 'does.not.exist'), [])
  assert.deepEqual(getRows(emptyBill(), 'exporterId'), [])
})

test('errorAt looks up a dotted message', () => {
  const errors = { 'invoices.0.items.0.quantity': 'Enter a number above zero' }
  assert.equal(errorAt(errors, 'invoices.0.items.0.quantity'), 'Enter a number above zero')
  assert.equal(errorAt(errors, 'invoices.0.items.0.unitPrice'), undefined)
})
