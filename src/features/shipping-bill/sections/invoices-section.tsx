import { emptyInvoice } from '../../../domain/shipping-bill/defaults.ts'
import { Button } from '../../../ui/index.ts'
import { useBillForm } from '../bill-form-context.tsx'
import type { QuickAddTarget } from '../quick-add.ts'
import { InvoiceEditor } from './invoice-editor.tsx'

interface InvoicesSectionProps {
  onQuickAdd: (target: QuickAddTarget) => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: string, branchPath: string) => void
}

/** Tab 2 — one editor per invoice, each with its own goods list. */
export function InvoicesSection({ onQuickAdd, onAddBranch }: InvoicesSectionProps) {
  const form = useBillForm()
  const invoices = form.values.invoices

  return (
    <div className="stack">
      <div className="row row--between row--center">
        <div>
          <h2>Invoices &amp; goods</h2>
          <p className="muted">One invoice and one item are ready to fill in.</p>
        </div>
        <Button variant="outline" onClick={() => form.appendRow('invoices', emptyInvoice())}>
          + Add invoice
        </Button>
      </div>

      {invoices.map((invoice, index) => (
        <InvoiceEditor
          key={index}
          index={index}
          invoice={invoice}
          canRemove={invoices.length > 1}
          onRemove={() => form.removeRow('invoices', index)}
          onQuickAdd={onQuickAdd}
          onAddBranch={onAddBranch}
        />
      ))}
    </div>
  )
}
