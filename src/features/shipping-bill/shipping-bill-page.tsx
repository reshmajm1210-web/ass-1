import { useCallback, useMemo } from 'react'

import { Link } from '../../app/router.tsx'
import { routes } from '../../app/routes.ts'
import { emptyBill } from '../../domain/shipping-bill/defaults.ts'
import type { SavedBill, ShippingBillFormValues } from '../../domain/shipping-bill/types.ts'
import { getReferenceData } from '../../services/reference-data-service.ts'
import type { ReferenceData } from '../../services/reference-data-service.ts'
import { getBillById, saveBill } from '../../services/shipping-bill-service.ts'
import { AsyncState, Card } from '../../ui/index.ts'
import { useAsyncData } from '../../state/use-async-data.ts'
import { BillFormProvider } from './bill-form-context.tsx'
import { ReferenceDataProvider } from './reference-data-context.tsx'
import { ShippingBillForm } from './shipping-bill-form.tsx'

interface ShippingBillPageProps {
  /** Present when editing an existing bill; undefined for `/shipping-bills/new`. */
  billId?: string
}

/**
 * Loads everything the form needs — the bill (when editing) and the code
 * lists — and owns the save call. The form itself only receives callbacks,
 * so it stays free of data access.
 */
export function ShippingBillPage({ billId }: ShippingBillPageProps) {
  const bill = useAsyncData<SavedBill | undefined>(
    () => (billId ? getBillById(billId) : Promise.resolve(undefined)),
    undefined,
    [billId]
  )
  const reference = useAsyncData<ReferenceData | null>(() => getReferenceData(), null)

  const initialValues = useMemo(() => bill.data?.values ?? emptyBill(), [bill.data])

  /** Persist values; `id` is undefined for a first save, then the bill id. */
  const persist = useCallback(
    (values: ShippingBillFormValues, id?: number): Promise<SavedBill> => saveBill(values, id),
    []
  )

  const loading = bill.loading || reference.loading
  const error = bill.error ?? reference.error
  const missing = Boolean(billId) && !bill.loading && !bill.data && !bill.error

  return (
    <AsyncState
      loading={loading}
      error={error}
      onRetry={() => {
        bill.retry()
        reference.retry()
      }}
      loadingLabel="Loading shipping bill…"
      isEmpty={missing}
      emptyTitle="Shipping bill not found"
      emptyDescription="It may have been removed, or the link may be wrong."
      emptyAction={
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          <Link to={routes.dashboard}>Back to shipping bills</Link>
        </p>
      }>
      {reference.data ? (
        <ReferenceDataProvider data={reference.data}>
          <BillFormProvider initialValues={initialValues}>
            <ShippingBillForm
              heading={bill.data ? `Edit shipping bill #${bill.data.id}` : 'New shipping bill'}
              initialDraftId={bill.data?.id}
              save={persist}
            />
          </BillFormProvider>
        </ReferenceDataProvider>
      ) : (
        <Card title="Reference data unavailable">
          <p className="muted">Code lists could not be loaded, so the form cannot be rendered.</p>
        </Card>
      )}
    </AsyncState>
  )
}
