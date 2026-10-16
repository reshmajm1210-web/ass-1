import assert from 'node:assert/strict'
import { test } from 'node:test'

import { emptyBill } from '../domain/shipping-bill/defaults.ts'
import {
  createBranch,
  createBusiness,
  createExporter,
  getBusinessById,
  getExporterById,
  searchBranches,
  searchBusinesses,
  searchExporters
} from './party-service.ts'
import { searchLoadingPorts, searchDestinationPorts, getPortByCode } from './port-service.ts'
import {
  getMarksAndNumbersOptions,
  getReferenceData,
  searchDocumentCodes
} from './reference-data-service.ts'
import { getBillById, listBills, saveBill } from './shipping-bill-service.ts'
import { FAILURE_TOKEN, ServiceError } from './mock/latency.ts'

/* ------------------------------------------------------------------ */
/* Party service                                                       */
/* ------------------------------------------------------------------ */

test('searchExporters matches name and IEC, case-insensitively', async () => {
  const byName = await searchExporters('aarav')
  assert.equal(byName.length, 1)
  assert.equal(byName[0].name, 'Aarav Textiles Pvt Ltd')

  const byIec = await searchExporters('AABCB5678G')
  assert.equal(byIec.length, 1)
  assert.equal(byIec[0].id, 1002)

  const all = await searchExporters('')
  assert.ok(all.length >= 7)
})

test('searchExporters excludes disabled exporters but keeps them resolvable by id', async () => {
  const disabled = await createExporter({ name: 'Disabled Exports', iec: 'AAAAD0000Z', class: 'F', type: 'P' })
  const { upsertExporter } = await import('./mock/store.ts')
  upsertExporter({ ...disabled, disabled: true })

  const results = await searchExporters('Disabled Exports')
  assert.equal(results.length, 0)
  const resolved = await getExporterById(String(disabled.id))
  assert.equal(resolved?.name, 'Disabled Exports')
})

test('searchBusinesses filters by role', async () => {
  const thirdParties = await searchBusinesses('', 'thirdParty')
  assert.ok(thirdParties.every((business) => business.isThirdParty))
  assert.ok(thirdParties.some((business) => business.name === 'Al-Mansoor Trading FZE'))

  const consignees = await searchBusinesses('northstar', 'consignee')
  assert.equal(consignees.length, 1)
  assert.equal(consignees[0].id, 2002)
})

test('getBusinessById resolves a saved value to its record', async () => {
  const business = await getBusinessById('2010')
  assert.equal(business?.name, 'EuroGlobal Fashion GmbH')
  assert.equal(await getBusinessById('999999'), undefined)
})

test('searchBranches scopes to the owner and matches city', async () => {
  const branches = await searchBranches('exporter', '1000', 'tirupur')
  assert.equal(branches.length, 1)
  assert.equal(branches[0].branchName, 'Tirupur Processing Unit')

  assert.deepEqual(await searchBranches('exporter', '', 'x'), [])
  assert.deepEqual(await searchBranches('exporter', '999999', ''), [])
})

test('createExporter assigns ids and stores the first branch', async () => {
  const exporter = await createExporter({
    name: 'Test Exports LLP',
    iec: 'AAAAT1111A',
    class: 'F',
    type: 'P',
    firstBranch: { branchName: 'HQ', address1: '1 Main Rd', city: 'Madurai', countryCode: 'IN' }
  })
  assert.ok(exporter.id > 3000)
  assert.equal(exporter.branches.length, 1)
  assert.ok(exporter.branches[0].id > exporter.id)

  const found = await getExporterById(String(exporter.id))
  assert.equal(found?.name, 'Test Exports LLP')
})

test('createBusiness + createBranch round-trip through the store', async () => {
  const business = await createBusiness({
    name: 'Test Buyers GmbH',
    isConsignee: true,
    isBuyer: true,
    isNotify: false,
    isThirdParty: false,
    firstBranch: { branchName: 'Berlin office', address1: 'Hauptstr 1', city: 'Berlin', countryCode: 'DE' }
  })
  const branch = await createBranch('business', business.id, {
    branchName: 'Munich depot',
    address1: 'Bahnhofstr 2',
    city: 'Munich',
    countryCode: 'DE'
  })
  const branches = await searchBranches('business', String(business.id), '')
  assert.equal(branches.length, 2)
  assert.ok(branches.some((item) => item.id === branch.id))
})

/* ------------------------------------------------------------------ */
/* Port service                                                        */
/* ------------------------------------------------------------------ */

test('loading ports are Indian, destination ports are searchable', async () => {
  const loading = await searchLoadingPorts('')
  assert.ok(loading.length > 0)
  assert.ok(loading.every((port) => port.code.startsWith('IN')))

  const destinations = await searchDestinationPorts('new')
  assert.equal(destinations.length, 1)
  assert.equal(destinations[0].code, 'USMSY')

  const port = await getPortByCode('DEHAM')
  assert.equal(port?.countryCode, 'DE')
})

/* ------------------------------------------------------------------ */
/* Reference data service                                              */
/* ------------------------------------------------------------------ */

test('getReferenceData returns the full bundle and caches it', async () => {
  const first = await getReferenceData()
  assert.ok(first.currencies.some((option) => option.value === 'USD'))
  assert.equal(first.schemeCodes.length, 72)
  assert.ok(first.quantityCodes.every((option, index, list) => list.findIndex((o) => o.value === option.value) === index))

  const second = await getReferenceData()
  assert.equal(first, second) // same cached object
})

test('searchDocumentCodes filters by code and label', async () => {
  const packing = await searchDocumentCodes('packing list')
  assert.ok(packing.some((doc) => doc.value === '271000'))
  const byCode = await searchDocumentCodes('861')
  assert.ok(byCode.some((doc) => doc.value === '861000'))
  assert.deepEqual(await searchDocumentCodes('zzz-no-match'), [])
})

test('marks & numbers are exporter-specific with a clean empty state', async () => {
  const marks = await getMarksAndNumbersOptions('1000')
  assert.equal(marks.length, 2)
  assert.deepEqual(await getMarksAndNumbersOptions('1010'), [])
  assert.deepEqual(await getMarksAndNumbersOptions(''), [])
})

/* ------------------------------------------------------------------ */
/* Failure simulation                                                  */
/* ------------------------------------------------------------------ */

test(`queries containing ${FAILURE_TOKEN} reject with a ServiceError`, async () => {
  await assert.rejects(() => searchExporters(`aarav ${FAILURE_TOKEN}`), (error: unknown) => {
    assert.ok(error instanceof ServiceError)
    assert.equal(error.code, 'SIMULATED_FAILURE')
    return true
  })
})

/* ------------------------------------------------------------------ */
/* Shipping bill service                                               */
/* ------------------------------------------------------------------ */

test('listBills returns the seeded bills (demo + legacy) newest first', async () => {
  const bills = await listBills()
  assert.ok(bills.length >= 22)
  assert.ok(bills.some((bill) => bill.id === 3000)) // demo bill
  assert.ok(bills.some((bill) => bill.id === 1000)) // legacy seed
})

test('saveBill creates, then updates in place, denormalising party names', async () => {
  const values = emptyBill()
  values.exporterId = '1000'
  values.exporterBranchId = '1001'
  values.consigneeId = '2002'
  values.consigneeBranchId = '2003'
  values.loadingPort = 'INMUN1'
  values.finalDestinationPort = 'USMSY'
  values.invoices[0].invoiceNumber = 'EX/TEST/1'
  values.invoices[0].items[0] = {
    ...values.invoices[0].items[0],
    ritcCode: '61091000',
    goodsDescription1: 'Test shirts',
    quantity: '10',
    unitPrice: '5'
  }

  const created = await saveBill(values)
  assert.ok(created.id > 3000)
  assert.equal(created.values.exporterName, 'Aarav Textiles Pvt Ltd')
  assert.equal(created.values.consigneeName, 'Northstar Trading Inc')
  assert.ok(created.payload)

  const updated = await saveBill({ ...values, totalPackages: '3' }, created.id)
  assert.equal(updated.id, created.id)
  assert.equal(updated.values.totalPackages, '3')
  assert.equal(updated.created, created.created)

  const fetched = await getBillById(created.id)
  assert.equal(fetched?.values.totalPackages, '3')

  const bills = await listBills()
  assert.equal(bills.filter((bill) => bill.id === created.id).length, 1) // updated, not duplicated
  assert.equal(bills[0].id, created.id) // newest first
})
