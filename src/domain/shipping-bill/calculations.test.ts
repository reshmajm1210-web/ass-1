import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  billItemsTotal,
  effectiveInvoiceTotal,
  epochDaysToIsoDate,
  invoiceTotal,
  isBlank,
  lineTotal,
  parseOptionalNumber,
  portCountry
} from './calculations.ts'
import { emptyInvoice, emptyItem } from './defaults.ts'
import type { PortOption } from './types.ts'

const ports: PortOption[] = [
  { code: 'INMUN1', name: 'Mundra', countryCode: 'IN' },
  { code: 'USMSY', name: 'New Orleans', countryCode: 'US' }
]

test('isBlank treats undefined, null and whitespace as blank', () => {
  assert.equal(isBlank(undefined), true)
  assert.equal(isBlank(null), true)
  assert.equal(isBlank('   '), true)
  assert.equal(isBlank('0'), false)
})

test('parseOptionalNumber returns undefined for blank input, numbers otherwise', () => {
  assert.equal(parseOptionalNumber(''), undefined)
  assert.equal(parseOptionalNumber('  '), undefined)
  assert.equal(parseOptionalNumber('abc'), undefined)
  assert.equal(parseOptionalNumber('12.5'), 12.5)
  assert.equal(parseOptionalNumber(7), 7)
})

test('lineTotal prefers the explicit override, else quantity × unit price', () => {
  const item = { ...emptyItem(), quantity: '4', unitPrice: '2.5' }
  assert.equal(lineTotal(item), 10)
  assert.equal(lineTotal({ ...item, lineTotal: '99.9' }), 99.9)
  assert.equal(lineTotal({ ...item, lineTotal: '  ' }), 10)
  assert.equal(lineTotal({ ...item, quantity: '' }), 0)
})

test('invoiceTotal sums item line totals, effectiveInvoiceTotal honours the override', () => {
  const invoice = emptyInvoice()
  invoice.items = [
    { ...emptyItem(), quantity: '2', unitPrice: '3' },
    { ...emptyItem(), quantity: '5', unitPrice: '1.5', lineTotal: '10' }
  ]
  assert.equal(invoiceTotal(invoice), 16)
  assert.equal(effectiveInvoiceTotal(invoice), 16)
  assert.equal(effectiveInvoiceTotal({ ...invoice, invoiceTotal: '42' }), 42)
})

test('billItemsTotal adds totals across invoices', () => {
  const a = emptyInvoice()
  a.items = [{ ...emptyItem(), quantity: '2', unitPrice: '2' }]
  const b = emptyInvoice()
  b.items = [{ ...emptyItem(), quantity: '3', unitPrice: '3' }]
  assert.equal(billItemsTotal([a, b]), 13)
})

test('portCountry resolves known ports and falls back to the code prefix', () => {
  assert.equal(portCountry('INMUN1', ports), 'IN')
  assert.equal(portCountry('USMSY', ports), 'US')
  assert.equal(portCountry('DEHAM', ports), 'DE') // unknown port → prefix fallback
  assert.equal(portCountry('', ports), '')
  assert.equal(portCountry(undefined, ports), '')
})

test('epochDaysToIsoDate converts backend day counts', () => {
  assert.equal(epochDaysToIsoDate(0), '1970-01-01')
  assert.equal(epochDaysToIsoDate(20728), '2026-10-02')
  assert.equal(epochDaysToIsoDate('nope'), '')
})
