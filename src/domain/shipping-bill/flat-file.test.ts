import assert from 'node:assert/strict'
import { test } from 'node:test'

import { emptyBill, emptyItem } from './defaults.ts'
import { flatFileFilename, generateFlatFileContent } from './flat-file.ts'
import type { SavedBill } from './types.ts'

function savedBill(): SavedBill {
  const values = emptyBill()
  values.jobNumber = '2081'
  values.jobDate = '2026-09-18'
  values.exporterId = '1000'
  values.exporterBranchId = '1001'
  values.consigneeId = '2002'
  values.consigneeBranchId = '2003'
  values.loadingPort = 'INMUN1'
  values.finalDestinationPort = 'USMSY'
  values.marksAndNumbers = 'AARAV TEXTILES / MADE^IN INDIA'
  values.invoices[0].invoiceNumber = 'EX/2081/2026'
  values.invoices[0].invoiceDate = '2026-09-18'
  values.invoices[0].items = [
    { ...emptyItem(), ritcCode: '61091000', goodsDescription1: 'Cotton T-shirts', quantity: '51', unitPrice: '3.831' }
  ]
  return { id: 3001, created: '2026-09-18T08:00:00.000Z', updated: '2026-09-18T08:00:00.000Z', values }
}

test('flat file is framed by HREC/TREC lines and uses CRLF separators', () => {
  const content = generateFlatFileContent(savedBill())
  const lines = content.split('\r\n')
  assert.equal(lines[0], 'HREC**ZZ*INMUN1*ZZ*ICEGATE*01*SB*1.0*')
  assert.equal(lines[lines.length - 1], 'TREC**ZZ*INMUN1*ZZ*ICEGATE*01*SB*1.0*')
})

test('header row carries the bill fields', () => {
  const content = generateFlatFileContent(savedBill())
  const row = content.split('\r\n').find((line) => line.startsWith('<R>F^1000^'))
  assert.ok(row)
  const cells = row.slice(3).split('^')
  assert.equal(cells[1], '1000') // cha id
  assert.equal(cells[2], '2081') // job number
  assert.equal(cells[3], '2026-09-18') // job date
  assert.equal(cells[7], 'INMUN1') // loading port
  assert.equal(cells[8], 'USMSY') // destination port
  assert.equal(cells[9], 'USMSY') // discharge defaults to destination
})

test('caret characters and newlines are sanitized from free text', () => {
  const content = generateFlatFileContent(savedBill())
  assert.ok(content.includes('AARAV TEXTILES / MADE IN INDIA'))
  assert.ok(!content.includes('MADE^IN'))
})

test('invoice and item tables contain computed line totals', () => {
  const content = generateFlatFileContent(savedBill())
  assert.ok(content.includes('<TABLE>INVOICE'))
  assert.ok(content.includes('<R>1^EX/2081/2026^2026-09-18^USD^FOB^2002^0^0'))
  assert.ok(content.includes('<TABLE>ITEM'))
  assert.ok(content.includes('^51^PCS^3.831^195.38^')) // 51 × 3.831 = 195.381 → 195.38
})

test('packing table only appears when ranges exist', () => {
  const bill = savedBill()
  assert.ok(!generateFlatFileContent(bill).includes('<TABLE>PACKING'))
  bill.values.packingRanges = [{ packingNumberFrom: '1', packingNumberTo: '12', packingCode: 'CTN' }]
  const content = generateFlatFileContent(bill)
  assert.ok(content.includes('<TABLE>PACKING'))
  assert.ok(content.includes('<R>1^12^CTN'))
})

test('filename falls back to the bill id when there is no job number', () => {
  const bill = savedBill()
  assert.equal(flatFileFilename(bill), 'shipping_bill_2081.sb')
  bill.values.jobNumber = undefined
  assert.equal(flatFileFilename(bill), 'shipping_bill_3001.sb')
})
