import { effectiveInvoiceTotal, invoiceTotal } from '../../../domain/shipping-bill/calculations.ts'
import { emptyItem } from '../../../domain/shipping-bill/defaults.ts'
import type { BillInvoiceForm } from '../../../domain/shipping-bill/types.ts'
import { Button, Card, Checkbox, Field, Input, SectionHeading, Select } from '../../../ui/index.ts'
import { useBillForm } from '../bill-form-context.tsx'
import { ChargeRow } from '../charge-row.tsx'
import { PartyFields } from '../party-fields.tsx'
import { quickAddBuyer, quickAddThirdParty } from '../quick-add.ts'
import type { QuickAddTarget } from '../quick-add.ts'
import { useReferenceData } from '../reference-data-context.tsx'
import { ItemEditor } from './item-editor.tsx'

interface InvoiceEditorProps {
  index: number
  invoice: BillInvoiceForm
  canRemove: boolean
  onRemove: () => void
  onQuickAdd: (target: QuickAddTarget) => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: string, branchPath: string) => void
}

/**
 * One invoice: header, buyer, charges, payment terms and its goods.
 * All paths are relative to `invoices.<index>`, so the component is reusable
 * for any number of invoices.
 */
export function InvoiceEditor({
  index,
  invoice,
  canRemove,
  onRemove,
  onQuickAdd,
  onAddBranch
}: InvoiceEditorProps) {
  const form = useBillForm()
  const { currencies, contractTypes, priceInclusionTypes, paymentTypes } = useReferenceData()
  const base = `invoices.${index}`
  const buyerSameAsConsignee = invoice.buyerSameAsConsignee

  return (
    <Card
      title={`Invoice ${index + 1}`}
      actions={
        canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove invoice
          </Button>
        )
      }>
      <div className="details-grid">
        <Field label="Invoice number" required error={form.errorAt(`${base}.invoiceNumber`)}>
          <Input
            value={form.valueAt(`${base}.invoiceNumber`)}
            onChange={(value) => form.setValue(`${base}.invoiceNumber`, value)}
          />
        </Field>
        <Field label="Invoice date" required error={form.errorAt(`${base}.invoiceDate`)}>
          <Input
            type="date"
            value={form.valueAt(`${base}.invoiceDate`)}
            onChange={(value) => form.setValue(`${base}.invoiceDate`, value)}
          />
        </Field>
        <Field label="Currency" required error={form.errorAt(`${base}.currency`)}>
          <Select
            value={form.valueAt(`${base}.currency`)}
            onChange={(value) => form.setValue(`${base}.currency`, value)}
            options={currencies}
            placeholder="Select currency"
          />
        </Field>
        <Field
          label="Total override"
          error={form.errorAt(`${base}.invoiceTotal`)}
          hint={`Computed: ${invoiceTotal(invoice).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}>
          <Input
            type="number"
            placeholder="0.00"
            value={form.valueAt(`${base}.invoiceTotal`)}
            onChange={(value) => form.setValue(`${base}.invoiceTotal`, value)}
          />
        </Field>
        <Field label="Contract" required error={form.errorAt(`${base}.contractType`)}>
          <Select
            value={form.valueAt(`${base}.contractType`)}
            onChange={(value) => form.setValue(`${base}.contractType`, value)}
            options={contractTypes}
            placeholder="Select contract type"
          />
        </Field>
      </div>

      <div style={{ marginTop: '0.9rem' }}>
        <Checkbox
          checked={buyerSameAsConsignee}
          onChange={(checked) => form.setValue(`${base}.buyerSameAsConsignee`, checked)}
          label="Buyer & consignee are same"
        />
      </div>

      {!buyerSameAsConsignee && (
        <div className="details-grid" style={{ marginTop: '0.9rem' }}>
          <PartyFields
            label="Buyer"
            ownerPath={`${base}.buyerId`}
            branchPath={`${base}.buyerBranchId`}
            kind="business"
            role="buyer"
            required
            onQuickAdd={() => onQuickAdd(quickAddBuyer(index))}
            onAddBranch={(ownerId) => onAddBranch('business', ownerId, `${base}.buyerBranchId`)}
          />
        </div>
      )}

      <div className="section">
        <SectionHeading title="Charges and deductions" description="Enter a rate or an amount for each charge." />
        <div className="details-grid">
          <ChargeRow label="Freight" basePath={base} field="freight" />
          <ChargeRow label="Insurance" basePath={base} field="insurance" />
          <ChargeRow label="Commission" basePath={base} field="commission" />
          <ChargeRow label="Discount" basePath={base} field="discount" />
          <ChargeRow label="Other deductions" basePath={base} field="otherDeductions" />
          <Field label="Packing charges">
            <Input
              type="number"
              placeholder="Amount"
              value={form.valueAt(`${base}.packingCharges`)}
              onChange={(value) => form.setValue(`${base}.packingCharges`, value)}
            />
          </Field>
        </div>
      </div>

      <div className="section">
        <SectionHeading title="Payment and contract" />
        <div className="details-grid">
          <Field label="Price includes">
            <Select
              value={form.valueAt(`${base}.freightInsuranceIncluded`)}
              onChange={(value) => form.setValue(`${base}.freightInsuranceIncluded`, value)}
              options={priceInclusionTypes}
              placeholder="Select if applicable"
            />
          </Field>
          <Field label="Contract / order number">
            <Input
              value={form.valueAt(`${base}.contractNumber`)}
              onChange={(value) => form.setValue(`${base}.contractNumber`, value)}
            />
          </Field>
          <Field label="Payment type">
            <Select
              value={form.valueAt(`${base}.natureOfPayment`)}
              onChange={(value) => form.setValue(`${base}.natureOfPayment`, value)}
              options={paymentTypes}
              placeholder="Select if applicable"
            />
          </Field>
          <Field label="Payment period (days)">
            <Input
              type="number"
              value={form.valueAt(`${base}.periodOfPayment`)}
              onChange={(value) => form.setValue(`${base}.periodOfPayment`, value)}
            />
          </Field>
        </div>
      </div>

      <div className="section">
        <SectionHeading
          title="Third party (optional)"
          description="Only when a party other than the exporter or buyer is involved."
        />
        <div className="details-grid">
          <PartyFields
            label="Third party"
            ownerPath={`${base}.thirdPartyId`}
            branchPath={`${base}.thirdPartyBranchId`}
            kind="business"
            role="thirdParty"
            onQuickAdd={() => onQuickAdd(quickAddThirdParty(index))}
            onAddBranch={(ownerId) => onAddBranch('business', ownerId, `${base}.thirdPartyBranchId`)}
          />
        </div>
      </div>

      <div className="section">
        <SectionHeading
          title="Goods"
          action={
            <Button variant="outline" size="sm" onClick={() => form.appendRow(`${base}.items`, emptyItem())}>
              + Add item
            </Button>
          }
        />
        {form.errorAt(`${base}.items`) && (
          <p className="field__error" role="alert">
            {form.errorAt(`${base}.items`)}
          </p>
        )}
        <div className="stack">
          {invoice.items.map((item, itemIndex) => (
            <ItemEditor
              key={itemIndex}
              invoiceIndex={index}
              itemIndex={itemIndex}
              item={item}
              invoiceCurrency={invoice.currency}
              canRemove={invoice.items.length > 1}
              onRemove={() => form.removeRow(`${base}.items`, itemIndex)}
              onQuickAdd={onQuickAdd}
              onAddBranch={onAddBranch}
            />
          ))}
        </div>
      </div>

      {/* Shows the saved total: the override when present, else the item sum. */}
      <div className="text-right strong" style={{ marginTop: '1rem' }}>
        Invoice total: {invoice.currency || '—'}{' '}
        {effectiveInvoiceTotal(invoice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </Card>
  )
}
