import { useState } from 'react'
import type { FormEvent } from 'react'

import { useNavigate } from '../../app/router.tsx'
import { routes } from '../../app/routes.ts'
import { useToast } from '../../app/toast.tsx'
import type { SavedBill, ShippingBillFormValues } from '../../domain/shipping-bill/types.ts'
import { firstTabWithErrors, hasErrors } from '../../domain/shipping-bill/validation.ts'
import { Button, TabList, TabPanel } from '../../ui/index.ts'
import type { TabDefinition } from '../../ui/index.ts'
import { useBillForm } from './bill-form-context.tsx'
import { DetailsSection } from './sections/details-section.tsx'
import { InvoicesSection } from './sections/invoices-section.tsx'
import { OthersSection } from './sections/others-section.tsx'
import { BranchDialog } from './dialogs/branch-dialog.tsx'
import { PartyDialog } from './dialogs/party-dialog.tsx'
import { quickAddBranch } from './quick-add.ts'
import type { QuickAddTarget, QuickBranchTarget } from './quick-add.ts'
import { WorkflowStrip } from './workflow-strip.tsx'

const TABS: TabDefinition[] = [
  { id: 'details', label: '1. Details' },
  { id: 'invoices', label: '2. Invoices & goods' },
  { id: 'documents', label: '3. Others' }
]

interface ShippingBillFormProps {
  heading: string
  /** The id of the bill being edited, when the page loaded one. */
  initialDraftId?: number
  /** Persists the values; resolves with the saved bill. */
  save: (values: ShippingBillFormValues, id?: number) => Promise<SavedBill>
}

/**
 * The form shell: tabs, workflow strip and the action footer.
 *
 * Owns tab state, the draft id created by the intermediate save buttons, the
 * submit flow (validate → jump to the first tab with problems → save) and the
 * quick-add dialogs. Section components own their fields.
 */
export function ShippingBillForm({ heading, initialDraftId, save }: ShippingBillFormProps) {
  const form = useBillForm()
  const toast = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [draftId, setDraftId] = useState<number | undefined>(initialDraftId)
  const [quickAdd, setQuickAdd] = useState<QuickAddTarget | null>(null)
  const [quickBranch, setQuickBranch] = useState<QuickBranchTarget | null>(null)

  /** Intermediate save used by Previous / Save & Next. */
  const persistDraft = async (): Promise<number | undefined> => {
    try {
      const saved = await save(form.values, draftId)
      setDraftId(saved.id)
      return saved.id
    } catch {
      toast.error('Failed to save shipping bill')
      return undefined
    }
  }

  const handlePrevious = async () => {
    await persistDraft()
    setActiveTab(activeTab === 'documents' ? 'invoices' : 'details')
  }

  const handleSaveAndNext = async () => {
    const savedId = await persistDraft()
    if (savedId !== undefined) toast.success('Details saved')
    setActiveTab(activeTab === 'details' ? 'invoices' : 'documents')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = form.validate()
    if (hasErrors(errors)) {
      toast.error('Please check the required fields')
      const tab = firstTabWithErrors(errors)
      if (tab) setActiveTab(tab)
      return
    }

    form.setSaving(true)
    try {
      const wasNew = draftId === undefined
      const saved = await save(form.values, draftId)
      setDraftId(saved.id)
      toast.success(wasNew ? 'Shipping bill created' : 'Shipping bill updated')
      navigate(routes.toShippingBillEdit(saved.id))
    } catch {
      toast.error('Failed to save shipping bill')
    } finally {
      form.setSaving(false)
    }
  }

  /* Writing a newly created party (and its first branch) back into the form. */
  const handlePartySaved = (target: QuickAddTarget, ownerId: number, firstBranchId?: number) => {
    form.setValue(target.ownerPath, String(ownerId))
    form.setValue(target.branchPath, firstBranchId === undefined ? '' : String(firstBranchId))
    setQuickAdd(null)
  }

  const handleBranchSaved = (target: QuickBranchTarget, branchId: number) => {
    form.setValue(target.branchPath, String(branchId))
    setQuickBranch(null)
  }

  return (
    <div className="stack stack--lg">
      <div className="page-header">
        <div>
          <h1>{heading}</h1>
          <p className="muted">Enter the everyday details first. Open advanced sections only when needed.</p>
        </div>
      </div>

      <WorkflowStrip />

      <form className="stack" onSubmit={handleSubmit} noValidate>
        <TabList tabs={TABS} value={activeTab} onChange={setActiveTab} />

        <TabPanel id="details" activeId={activeTab}>
          <DetailsSection
            onQuickAdd={setQuickAdd}
            onAddBranch={(kind, ownerId, branchPath) => setQuickBranch(quickAddBranch(kind, ownerId, branchPath))}
          />
        </TabPanel>

        <TabPanel id="invoices" activeId={activeTab}>
          <InvoicesSection
            onQuickAdd={setQuickAdd}
            onAddBranch={(kind, ownerId, branchPath) => setQuickBranch(quickAddBranch(kind, ownerId, branchPath))}
          />
        </TabPanel>

        <TabPanel id="documents" activeId={activeTab}>
          <OthersSection />
        </TabPanel>

        <div className="form-footer">
          <Button variant="outline" onClick={() => navigate(routes.dashboard)}>
            Cancel
          </Button>
          <div className="form-footer__actions">
            {activeTab !== 'details' && (
              <Button variant="outline" disabled={form.saving} onClick={() => void handlePrevious()}>
                Previous
              </Button>
            )}
            {activeTab !== 'documents' ? (
              <Button disabled={form.saving} onClick={() => void handleSaveAndNext()}>
                {form.saving ? 'Saving…' : 'Save & Next'}
              </Button>
            ) : (
              <Button type="submit" disabled={form.saving}>
                {form.saving ? 'Saving…' : 'Save changes'}
              </Button>
            )}
          </div>
        </div>
      </form>

      {quickAdd && (
        <PartyDialog
          key={`${quickAdd.kind}-${quickAdd.role}-${quickAdd.ownerPath}`}
          target={quickAdd}
          onClose={() => setQuickAdd(null)}
          onSaved={handlePartySaved}
        />
      )}

      {quickBranch && (
        <BranchDialog
          key={`${quickBranch.kind}-${quickBranch.ownerId}-${quickBranch.branchPath}`}
          target={quickBranch}
          onClose={() => setQuickBranch(null)}
          onSaved={handleBranchSaved}
        />
      )}
    </div>
  )
}
