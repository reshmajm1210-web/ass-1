import { lineTotal } from '../../../domain/shipping-bill/calculations.ts'
import type { BillItemForm } from '../../../domain/shipping-bill/types.ts'
import { schemeShowsDrawback } from '../../../services/reference-data-service.ts'
import { Checkbox, Collapsible, Field, Input, RepeatableRow, SectionHeading, Select } from '../../../ui/index.ts'
import { useBillForm } from '../bill-form-context.tsx'
import { PartyFields } from '../party-fields.tsx'
import { quickAddItemThirdParty } from '../quick-add.ts'
import type { QuickAddTarget } from '../quick-add.ts'
import { useReferenceData } from '../reference-data-context.tsx'

interface ItemEditorProps {
  invoiceIndex: number
  itemIndex: number
  item: BillItemForm
  invoiceCurrency: string
  canRemove: boolean
  onRemove: () => void
  onQuickAdd: (target: QuickAddTarget) => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: string, branchPath: string) => void
}

/**
 * One goods line: identity, quantity/price, scheme-driven drawback fields and
 * the advanced customs/tax block. Conditional fields are derived from the
 * item's own values (scheme, IGST status, third-party flag).
 */
export function ItemEditor({
  invoiceIndex,
  itemIndex,
  item,
  invoiceCurrency,
  canRemove,
  onRemove,
  onQuickAdd,
  onAddBranch
}: ItemEditorProps) {
  const form = useBillForm()
  const { quantityCodes, schemeCodes, igstPaymentOptions, accessoryStatusOptions, tradeAgreements } = useReferenceData()

  const base = `invoices.${invoiceIndex}.items.${itemIndex}`
  const selectedScheme = schemeCodes.find((scheme) => scheme.value === item.schemeCode)
  const showDrawback = schemeShowsDrawback(selectedScheme)

  return (
    <RepeatableRow title={`Item ${itemIndex + 1}`} onRemove={onRemove} removable={canRemove}>
      <div className="details-grid">
        <Field label="RITC / HS code" required error={form.errorAt(`${base}.ritcCode`)}>
          <Input
            placeholder="e.g. 61091000"
            value={item.ritcCode}
            onChange={(value) => form.setValue(`${base}.ritcCode`, value)}
          />
        </Field>
        <Field label="Scheme code">
          <Select
            value={item.schemeCode ?? ''}
            onChange={(value) => form.setValue(`${base}.schemeCode`, value)}
            options={schemeCodes}
            placeholder="Select scheme"
          />
        </Field>
        <Field label="Goods description" required error={form.errorAt(`${base}.goodsDescription1`)}>
          <Input
            placeholder="e.g. Cotton T-shirts"
            value={item.goodsDescription1}
            onChange={(value) => form.setValue(`${base}.goodsDescription1`, value)}
          />
        </Field>
        <Field label="Quantity" required error={form.errorAt(`${base}.quantity`)}>
          <Input
            type="number"
            inputMode="decimal"
            value={item.quantity}
            onChange={(value) => form.setValue(`${base}.quantity`, value)}
          />
        </Field>
        <Field label="Unit" required error={form.errorAt(`${base}.unitOfMeasurement`)}>
          <Select
            value={item.unitOfMeasurement}
            onChange={(value) => form.setValue(`${base}.unitOfMeasurement`, value)}
            options={quantityCodes}
            placeholder="Select unit"
          />
        </Field>
        <Field label={`Unit price (${invoiceCurrency || 'currency'})`} required error={form.errorAt(`${base}.unitPrice`)}>
          <Input
            type="number"
            inputMode="decimal"
            value={item.unitPrice}
            onChange={(value) => form.setValue(`${base}.unitPrice`, value)}
          />
        </Field>
        <Field
          label="Item total"
          hint="Leave empty to use quantity × unit price"
          error={form.errorAt(`${base}.lineTotal`)}>
          <Input
            type="number"
            placeholder={`${invoiceCurrency} ${lineTotal(item).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            value={item.lineTotal ?? ''}
            onChange={(value) => form.setValue(`${base}.lineTotal`, value)}
          />
        </Field>
        <Field label="IGST payment">
          <Select
            value={item.igstPaymentStatus ?? ''}
            onChange={(value) => form.setValue(`${base}.igstPaymentStatus`, value)}
            options={igstPaymentOptions}
            placeholder="Select if applicable"
          />
        </Field>
      </div>

      <div className="row row--tight" style={{ marginTop: '0.75rem' }}>
        <Checkbox
          checked={Boolean(item.rewardItem)}
          onChange={(checked) => form.setValue(`${base}.rewardItem`, checked)}
          label="Claim reward"
        />
        <Checkbox
          checked={Boolean(item.thirdPartyItem)}
          onChange={(checked) => form.setValue(`${base}.thirdPartyItem`, checked)}
          label="Third-party item"
        />
      </div>

      {showDrawback && (
        <div className="details-grid" style={{ marginTop: '0.75rem' }}>
          <Field label="Drawback serial no." error={form.errorAt(`${base}.drawbackSerialNumber`)}>
            <Input
              value={item.drawbackSerialNumber ?? ''}
              onChange={(value) => form.setValue(`${base}.drawbackSerialNumber`, value)}
            />
          </Field>
          <Field label="Drawback unit">
            <Input
              value={item.drawbackUnit ?? ''}
              onChange={(value) => form.setValue(`${base}.drawbackUnit`, value)}
            />
          </Field>
          <Field label="Drawback quantity">
            <Input
              type="number"
              value={item.drawbackQuantity ?? ''}
              onChange={(value) => form.setValue(`${base}.drawbackQuantity`, value)}
            />
          </Field>
        </div>
      )}

      {item.thirdPartyItem && (
        <div className="details-grid" style={{ marginTop: '0.75rem' }}>
          <PartyFields
            label="Item third party"
            ownerPath={`${base}.itemThirdPartyId`}
            branchPath={`${base}.itemThirdPartyBranchId`}
            kind="business"
            role="thirdParty"
            required
            onQuickAdd={() => onQuickAdd(quickAddItemThirdParty(invoiceIndex, itemIndex))}
            onAddBranch={(ownerId) => onAddBranch('business', ownerId, `${base}.itemThirdPartyBranchId`)}
          />
        </div>
      )}

      <div style={{ marginTop: '0.85rem' }}>
        <Collapsible title="Item customs, taxes and incentives">
          <div className="details-grid">
            <Field label="Unit of rate">
              <Select
                value={item.unitOfRate ?? ''}
                onChange={(value) => form.setValue(`${base}.unitOfRate`, value)}
                options={quantityCodes}
                // Placeholder echoes the item's own unit (the starter read the
                // wrong item index here).
                placeholder={item.unitOfMeasurement || 'Same as item unit'}
              />
            </Field>
            <Field label="Per unit (rate)">
              <Input
                type="number"
                placeholder="1"
                value={item.numberOfUnits ?? ''}
                onChange={(value) => form.setValue(`${base}.numberOfUnits`, value)}
              />
            </Field>
            <Field label="Present market value">
              <Input
                type="number"
                value={item.presentMarketValue ?? ''}
                onChange={(value) => form.setValue(`${base}.presentMarketValue`, value)}
              />
            </Field>
            <Field label="Cess">
              <Input
                type="number"
                value={item.cess ?? ''}
                onChange={(value) => form.setValue(`${base}.cess`, value)}
              />
            </Field>
            <Field label="Accessories description">
              <Input
                value={item.accessoriesDescription ?? ''}
                onChange={(value) => form.setValue(`${base}.accessoriesDescription`, value)}
              />
            </Field>
            <Field label="Accessory status">
              <Select
                value={item.accessoryStatus ?? ''}
                onChange={(value) => form.setValue(`${base}.accessoryStatus`, value)}
                options={accessoryStatusOptions}
                placeholder="Select if relevant"
              />
            </Field>
            {item.igstPaymentStatus === 'P' && (
              <>
                <Field label="Taxable value">
                  <Input
                    type="number"
                    value={item.taxableValue ?? ''}
                    onChange={(value) => form.setValue(`${base}.taxableValue`, value)}
                  />
                </Field>
                <Field label="IGST amount">
                  <Input
                    type="number"
                    value={item.igstAmount ?? ''}
                    onChange={(value) => form.setValue(`${base}.igstAmount`, value)}
                  />
                </Field>
              </>
            )}
            <Field label="Origin district code">
              <Input
                value={item.originDistrictCode ?? ''}
                onChange={(value) => form.setValue(`${base}.originDistrictCode`, value)}
              />
            </Field>
            <Field label="Trade agreement code">
              <Select
                value={item.tradeAgreementsCode ?? ''}
                onChange={(value) => form.setValue(`${base}.tradeAgreementsCode`, value)}
                options={tradeAgreements}
                placeholder="NCPTI"
              />
            </Field>
            <Field label="End use code">
              <Input
                value={item.endUseOfItem ?? ''}
                onChange={(value) => form.setValue(`${base}.endUseOfItem`, value)}
              />
            </Field>
            <Field label="Packages for item">
              <Input
                type="number"
                value={item.totalPackage ?? ''}
                onChange={(value) => form.setValue(`${base}.totalPackage`, value)}
              />
            </Field>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <SectionHeading title="AR4 / excise details" />
            <div className="details-grid">
              <Field label="AR4 number">
                <Input
                  value={item.ar4Number ?? ''}
                  onChange={(value) => form.setValue(`${base}.ar4Number`, value)}
                />
              </Field>
              <Field label="AR4 date">
                <Input
                  type="date"
                  value={item.ar4Date ?? ''}
                  onChange={(value) => form.setValue(`${base}.ar4Date`, value)}
                />
              </Field>
            </div>
          </div>
        </Collapsible>
      </div>
    </RepeatableRow>
  )
}
