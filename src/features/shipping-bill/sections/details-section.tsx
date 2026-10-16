import { portCountry } from '../../../domain/shipping-bill/calculations.ts'
import { getMarksAndNumbersOptions } from '../../../services/reference-data-service.ts'
import { AsyncCombobox, AsyncSelect, Card, Collapsible, Field, Input, SectionHeading, Select } from '../../../ui/index.ts'
import { useAsyncOptions } from '../../../ui/use-async-options.ts'
import { useBillForm } from '../bill-form-context.tsx'
import { PartyFields } from '../party-fields.tsx'
import {
  loadDestinationPortOptions,
  loadLoadingPortOptions,
  resolvePortOption
} from '../party-options.ts'
import { quickAddConsignee, quickAddExporter } from '../quick-add.ts'
import type { QuickAddTarget } from '../quick-add.ts'
import { useReferenceData } from '../reference-data-context.tsx'

interface DetailsSectionProps {
  onQuickAdd: (target: QuickAddTarget) => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: string, branchPath: string) => void
}

/**
 * Tab 1 — parties, route, regulatory exceptions and package detail.
 *
 * Everything here is a plain field bound to a dot path; the interesting
 * relationships are the branch reset (see PartyFields), the exporter-driven
 * marks & numbers list, and the country codes derived from the port values.
 */
export function DetailsSection({ onQuickAdd, onAddBranch }: DetailsSectionProps) {
  const form = useBillForm()
  const { cargoOptions, weightUnits, sealTypes, stateOptions, nfeiCategories, ports } = useReferenceData()

  const exporterId = form.valueAt('exporterId')
  const loadingPort = form.valueAt('loadingPort')
  const destinationPort = form.valueAt('finalDestinationPort')
  const hasContainers = form.values.containers.length > 0

  const marks = useAsyncOptions(() => getMarksAndNumbersOptions(exporterId), [exporterId])

  return (
    <Card title="Shipment basics" description="Parties and route are the core details for this bill.">
      <div className="details-grid">
        <PartyFields
          label="Exporter"
          ownerPath="exporterId"
          branchPath="exporterBranchId"
          kind="exporter"
          required
          onQuickAdd={() => onQuickAdd(quickAddExporter())}
          onAddBranch={(ownerId) => onAddBranch('exporter', ownerId, 'exporterBranchId')}
          // Marks & numbers belong to the exporter, so they reset with it.
          afterOwnerChange={() => form.setValue('marksAndNumbers', '')}
        />
        <PartyFields
          label="Consignee"
          ownerPath="consigneeId"
          branchPath="consigneeBranchId"
          kind="business"
          role="consignee"
          required
          onQuickAdd={() => onQuickAdd(quickAddConsignee())}
          onAddBranch={(ownerId) => onAddBranch('business', ownerId, 'consigneeBranchId')}
        />
      </div>

      <div className="section">
        <SectionHeading title="Route" />
        <div className="details-grid">
          <Field label="Port of loading" required error={form.errorAt('loadingPort')}>
            <AsyncCombobox
              value={loadingPort}
              onChange={(value) => form.setValue('loadingPort', value)}
              loadOptions={loadLoadingPortOptions}
              resolveValue={resolvePortOption}
              placeholder="Select Indian port"
            />
          </Field>
          <Field label="Final destination port" required error={form.errorAt('finalDestinationPort')}>
            <AsyncCombobox
              value={destinationPort}
              onChange={(value) => form.setValue('finalDestinationPort', value)}
              loadOptions={loadDestinationPortOptions}
              resolveValue={resolvePortOption}
              placeholder="Select destination"
            />
          </Field>
        </div>
        <p className="faint" style={{ marginTop: '0.5rem' }}>
          Countries are derived from the port codes when saved: {portCountry(loadingPort, ports) || '—'} →{' '}
          {portCountry(destinationPort, ports) || '—'}.
        </p>

        <div style={{ marginTop: '0.9rem' }}>
          <Collapsible title="Regulatory and route exceptions">
            <div className="details-grid">
              <Field label="Discharge port">
                <Select
                  value={form.valueAt('dischargePort')}
                  onChange={(value) => form.setValue('dischargePort', value)}
                  options={ports.map((port) => ({ value: port.code, label: `${port.name} (${port.code})` }))}
                  placeholder="Defaults to destination"
                />
              </Field>
              <Field label="Origin state" hint="Defaults to the branch state code">
                <Select
                  value={form.valueAt('originStateCode')}
                  onChange={(value) => form.setValue('originStateCode', value)}
                  options={stateOptions}
                  placeholder="Select state"
                />
              </Field>
              <Field label="NFEI category">
                <Select
                  value={form.valueAt('nfeiCategory')}
                  onChange={(value) => form.setValue('nfeiCategory', value)}
                  options={nfeiCategories}
                  placeholder="Not applicable"
                />
              </Field>
              <Field label="RBI waiver number">
                <Input
                  value={form.valueAt('rbiWaiverNumber')}
                  onChange={(value) => form.setValue('rbiWaiverNumber', value)}
                />
              </Field>
              <Field label="RBI waiver date">
                <Input
                  type="date"
                  value={form.valueAt('rbiWaiverDate')}
                  onChange={(value) => form.setValue('rbiWaiverDate', value)}
                />
              </Field>
            </div>
          </Collapsible>
        </div>
      </div>

      <div className="section">
        <SectionHeading title="Package Detail" />
        <div className="details-grid">
          <Field label="Nature of cargo">
            <Select
              value={form.valueAt('natureOfCargo')}
              onChange={(value) => form.setValue('natureOfCargo', value)}
              options={cargoOptions}
            />
          </Field>
          <Field label="Gross weight">
            <Input
              type="number"
              inputMode="decimal"
              value={form.valueAt('grossWeight')}
              onChange={(value) => form.setValue('grossWeight', value)}
            />
          </Field>
          <Field label="Net weight" error={form.errorAt('netWeight')}>
            <Input
              type="number"
              inputMode="decimal"
              value={form.valueAt('netWeight')}
              onChange={(value) => form.setValue('netWeight', value)}
            />
          </Field>
          <Field label="Weight unit">
            <Select
              value={form.valueAt('measurementUnit')}
              onChange={(value) => form.setValue('measurementUnit', value)}
              options={weightUnits}
            />
          </Field>
          <Field label="Total packages">
            <Input
              type="number"
              value={form.valueAt('totalPackages')}
              onChange={(value) => form.setValue('totalPackages', value)}
            />
          </Field>
          <Field
            label="Marks and numbers"
            hint={
              exporterId
                ? marks.error
                  ? 'Could not load marks for this exporter'
                  : undefined
                : 'Select an exporter first'
            }>
            <AsyncSelect
              value={form.valueAt('marksAndNumbers')}
              onChange={(value) => form.setValue('marksAndNumbers', value)}
              load={() => getMarksAndNumbersOptions(exporterId)}
              dependencyKey={exporterId}
              disabled={!exporterId}
              placeholder="Select marks and numbers"
              emptyHint="No marks configured for this exporter"
              disabledHint="Select an exporter first"
            />
          </Field>
        </div>

        <div style={{ marginTop: '0.9rem' }}>
          <Collapsible title="Additional Details">
            <div className="details-grid">
              <Field label="Seal type">
                <Select
                  value={form.valueAt('sealType')}
                  onChange={(value) => form.setValue('sealType', value)}
                  options={sealTypes}
                  placeholder="Select if relevant"
                />
              </Field>
              {!hasContainers && (
                <Field label="Number of containers" hint="Hidden once container rows exist">
                  <Input
                    type="number"
                    value={form.valueAt('numberOfContainers')}
                    onChange={(value) => form.setValue('numberOfContainers', value)}
                  />
                </Field>
              )}
              <Field label="Loose packets">
                <Input
                  type="number"
                  value={form.valueAt('loosePackets')}
                  onChange={(value) => form.setValue('loosePackets', value)}
                />
              </Field>
              <Field label="MAWB number">
                <Input value={form.valueAt('mawbNumber')} onChange={(value) => form.setValue('mawbNumber', value)} />
              </Field>
              <Field label="HAWB number">
                <Input value={form.valueAt('hawbNumber')} onChange={(value) => form.setValue('hawbNumber', value)} />
              </Field>
            </div>
          </Collapsible>
        </div>
      </div>
    </Card>
  )
}
