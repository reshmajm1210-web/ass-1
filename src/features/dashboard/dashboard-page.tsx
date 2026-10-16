import { useMemo, useState } from 'react'

import { useNavigate } from '../../app/router.tsx'
import { routes } from '../../app/routes.ts'
import { useToast } from '../../app/toast.tsx'
import { invoiceTotal } from '../../domain/shipping-bill/calculations.ts'
import type { SavedBill } from '../../domain/shipping-bill/types.ts'
import { downloadFlatFile, listBills } from '../../services/shipping-bill-service.ts'
import { useAsyncData } from '../../state/use-async-data.ts'
import { AsyncState, Badge, Button, Card, Input, Stat } from '../../ui/index.ts'

/** Bills matching the search box, newest first. */
function matchesSearch(bill: SavedBill, search: string): boolean {
  const haystack = [
    bill.id,
    bill.values.jobNumber,
    bill.values.exporterName,
    bill.values.consigneeName,
    ...bill.values.invoices.map((invoice) => invoice.invoiceNumber)
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search.trim().toLowerCase())
}

function updatedAt(bill: SavedBill): number {
  const time = bill.updated ? new Date(bill.updated).getTime() : 0
  return Number.isNaN(time) ? 0 : time
}

function formatUpdated(bill: SavedBill): string {
  return updatedAt(bill) ? new Date(bill.updated).toLocaleDateString() : '—'
}

export function DashboardPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { data: bills, loading, error, retry } = useAsyncData<SavedBill[]>(() => listBills(), [], [])
  const [search, setSearch] = useState('')
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const visibleBills = useMemo(
    () => bills.filter((bill) => matchesSearch(bill, search)).sort((a, b) => updatedAt(b) - updatedAt(a)),
    [bills, search]
  )

  const exporterCount = useMemo(
    () => new Set(bills.map((bill) => bill.values.exporterName).filter(Boolean)).size,
    [bills]
  )
  const consigneeCount = useMemo(
    () => new Set(bills.map((bill) => bill.values.consigneeName).filter(Boolean)).size,
    [bills]
  )

  const handleFlatFile = async (bill: SavedBill) => {
    setDownloadingId(bill.id)
    try {
      await downloadFlatFile(bill)
      toast.success(`Flat file (.sb) generated and downloaded for #${bill.values.jobNumber || bill.id}`)
    } catch {
      toast.error('Failed to generate flat file')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleRefresh = () => {
    retry()
    toast.info('Refreshing shipping bills…')
  }

  return (
    <div className="stack stack--lg">
      <div className="page-header">
        <div>
          <h1>Shipping bills</h1>
          <p className="muted">Create and continue the shipping bill step of each export job.</p>
        </div>
        <div className="page-header__actions">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button onClick={() => navigate(routes.shippingBillNew)}>+ New shipping bill</Button>
        </div>
      </div>

      <div className="grid grid--stats">
        <Stat label="Shipping bills" value={bills.length} />
        <Stat label="Exporters" value={exporterCount || 1} />
        <Stat label="Businesses / Consignees" value={consigneeCount || 1} />
      </div>

      <Card>
        <div className="stack">
          <div className="row row--between">
            <div className="grow" style={{ maxWidth: '24rem' }}>
              <Input
                type="search"
                placeholder="Job, invoice, exporter or consignee"
                aria-label="Search bills"
                value={search}
                onChange={setSearch}
              />
            </div>
            <span className="muted">
              {visibleBills.length} {visibleBills.length === 1 ? 'bill' : 'bills'}
            </span>
          </div>

          <AsyncState
            loading={loading}
            error={error}
            onRetry={retry}
            isEmpty={visibleBills.length === 0}
            loadingLabel="Loading shipping bills…"
            emptyTitle={search ? 'No matching shipping bills' : 'No shipping bills yet'}
            emptyDescription={search ? 'Try another job number or party name.' : 'Create a bill to start an export job.'}
            emptyAction={
              search ? undefined : (
                <Button className="mt-2" onClick={() => navigate(routes.shippingBillNew)}>
                  Create shipping bill
                </Button>
              )
            }>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Exporter → Consignee</th>
                    <th>Route</th>
                    <th>Invoices</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBills.map((bill) => {
                    const total = bill.values.invoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)
                    return (
                      <tr key={bill.id}>
                        <td className="strong">
                          {bill.values.jobNumber ? `#${bill.values.jobNumber}` : `Bill #${bill.id}`}
                          <span className="faint" style={{ display: 'block', fontWeight: 400 }}>
                            {bill.values.jobDate}
                          </span>
                        </td>
                        <td>
                          {bill.values.exporterName || '—'}
                          <span className="faint" style={{ display: 'block' }}>
                            to {bill.values.consigneeName || '—'}
                          </span>
                        </td>
                        <td>
                          {bill.values.loadingPort || '—'} → {bill.values.finalDestinationPort || '—'}
                        </td>
                        <td>
                          {bill.values.invoices.length}
                          <span className="faint" style={{ display: 'block' }}>
                            {total.toLocaleString(undefined, { maximumFractionDigits: 2 })} across items
                          </span>
                        </td>
                        <td>
                          <Badge tone="neutral">Draft</Badge>
                        </td>
                        <td>{formatUpdated(bill)}</td>
                        <td className="text-right">
                          <div className="row row--tight" style={{ justifyContent: 'flex-end' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={downloadingId === bill.id}
                              onClick={() => void handleFlatFile(bill)}>
                              {downloadingId === bill.id ? 'Downloading…' : 'Flat File'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(routes.toShippingBillEdit(bill.id))}>
                              Open
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </AsyncState>
        </div>
      </Card>
    </div>
  )
}
