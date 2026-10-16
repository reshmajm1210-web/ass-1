import { Button, Card, Collapsible, Field, Input, RepeatableRow, SectionHeading, Select } from '../../../ui/index.ts'
import { useBillForm } from '../bill-form-context.tsx'
import { useReferenceData } from '../reference-data-context.tsx'
import { DocumentEditor } from './document-editor.tsx'

/**
 * Tab 3 — containers, packing list ranges, supporting documents and licences.
 * Each group is a repeating list with an add button and per-row remove.
 */
export function OthersSection() {
  const form = useBillForm()
  const { containerSizes, containerSealTypes, goodsSourceOptions } = useReferenceData()

  const { containers, packingRanges, documents, licenses } = form.values

  return (
    <div className="stack">
      <Card title="Cargo & Package Detail" description="Add only when the cargo is containerized.">
        <SectionHeading
          title={`Containers (${containers.length})`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => form.appendRow('containers', { containerNumber: '' })}>
              + Add container
            </Button>
          }
        />
        <div className="stack stack--sm">
          {containers.length === 0 && <p className="muted">No containers added.</p>}
          {containers.map((container, index) => (
            <RepeatableRow
              key={index}
              title={`Container ${index + 1}`}
              onRemove={() => form.removeRow('containers', index)}>
              <div className="details-grid">
                <Field label="Container number" error={form.errorAt(`containers.${index}.containerNumber`)}>
                  <Input
                    value={container.containerNumber}
                    onChange={(value) => form.setValue(`containers.${index}.containerNumber`, value)}
                  />
                </Field>
                <Field label="Size">
                  <Select
                    value={container.containerSize ?? ''}
                    onChange={(value) => form.setValue(`containers.${index}.containerSize`, value)}
                    options={containerSizes}
                    placeholder="Select size"
                  />
                </Field>
                <Field label="Seal number">
                  <Input
                    value={container.exciseSealNumber ?? ''}
                    onChange={(value) => form.setValue(`containers.${index}.exciseSealNumber`, value)}
                  />
                </Field>
                <Field label="Seal date">
                  <Input
                    type="date"
                    value={container.sealDate ?? ''}
                    onChange={(value) => form.setValue(`containers.${index}.sealDate`, value)}
                  />
                </Field>
                <Field label="Seal type">
                  <Select
                    value={container.sealType ?? ''}
                    onChange={(value) => form.setValue(`containers.${index}.sealType`, value)}
                    options={containerSealTypes}
                    placeholder="Select if needed"
                  />
                </Field>
                <Field label="Seal device ID">
                  <Input
                    value={container.sealDeviceId ?? ''}
                    onChange={(value) => form.setValue(`containers.${index}.sealDeviceId`, value)}
                  />
                </Field>
                <Field label="Movement document type">
                  <Input
                    value={container.movementDocumentType ?? ''}
                    onChange={(value) => form.setValue(`containers.${index}.movementDocumentType`, value)}
                  />
                </Field>
                <Field label="Movement document number">
                  <Input
                    value={container.movementDocumentNumber ?? ''}
                    onChange={(value) => form.setValue(`containers.${index}.movementDocumentNumber`, value)}
                  />
                </Field>
              </div>
            </RepeatableRow>
          ))}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <Collapsible title={`Packing list ranges (${packingRanges.length})`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => form.appendRow('packingRanges', { packingNumberFrom: '', packingNumberTo: '' })}>
              + Add packing range
            </Button>
            <div className="stack stack--sm" style={{ marginTop: '0.6rem' }}>
              {packingRanges.map((range, index) => (
                <RepeatableRow
                  key={index}
                  title={`Range ${index + 1}`}
                  onRemove={() => form.removeRow('packingRanges', index)}>
                  <div className="details-grid">
                    <Field
                      label="Package from"
                      error={form.errorAt(`packingRanges.${index}.packingNumberFrom`)}>
                      <Input
                        type="number"
                        value={range.packingNumberFrom}
                        onChange={(value) => form.setValue(`packingRanges.${index}.packingNumberFrom`, value)}
                      />
                    </Field>
                    <Field label="Package to" error={form.errorAt(`packingRanges.${index}.packingNumberTo`)}>
                      <Input
                        type="number"
                        value={range.packingNumberTo}
                        onChange={(value) => form.setValue(`packingRanges.${index}.packingNumberTo`, value)}
                      />
                    </Field>
                    <Field label="Packing code">
                      <Input
                        value={range.packingCode ?? ''}
                        onChange={(value) => form.setValue(`packingRanges.${index}.packingCode`, value)}
                      />
                    </Field>
                  </div>
                </RepeatableRow>
              ))}
            </div>
          </Collapsible>
        </div>
      </Card>

      <Card
        title="Supporting documents"
        description="Add references when required for this shipment."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => form.appendRow('documents', { documentTypeCode: '', documentReferenceNumber: '' })}>
            + Add document
          </Button>
        }>
        <div className="stack stack--sm">
          {documents.length === 0 && <p className="muted">No supporting documents added.</p>}
          {documents.map((document, index) => (
            <DocumentEditor
              key={index}
              index={index}
              document={document}
              onRemove={() => form.removeRow('documents', index)}
            />
          ))}
        </div>
      </Card>

      <Card
        title="Licences"
        description="Only enter these for schemes that require a licence."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => form.appendRow('licenses', { registrationNumber: '' })}>
            + Add licence
          </Button>
        }>
        <div className="stack stack--sm">
          {licenses.length === 0 && <p className="muted">No licences added.</p>}
          {licenses.map((license, index) => (
            <RepeatableRow
              key={index}
              title={`Licence ${index + 1}`}
              onRemove={() => form.removeRow('licenses', index)}>
              <div className="details-grid">
                <Field label="Registration number" error={form.errorAt(`licenses.${index}.registrationNumber`)}>
                  <Input
                    value={license.registrationNumber}
                    onChange={(value) => form.setValue(`licenses.${index}.registrationNumber`, value)}
                  />
                </Field>
                <Field label="Registration date">
                  <Input
                    type="date"
                    value={license.registrationDate ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.registrationDate`, value)}
                  />
                </Field>
                <Field label="Invoice serial number">
                  <Input
                    type="number"
                    value={license.invoiceSerialNumber ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.invoiceSerialNumber`, value)}
                  />
                </Field>
                <Field label="Item serial number">
                  <Input
                    type="number"
                    value={license.itemSerialNumber ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.itemSerialNumber`, value)}
                  />
                </Field>
                <Field label="Licence serial number">
                  <Input
                    type="number"
                    value={license.licenseSerialNumber ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.licenseSerialNumber`, value)}
                  />
                </Field>
                <Field label="Item serial, Part E">
                  <Input
                    value={license.itemSerialNumberPartE ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.itemSerialNumberPartE`, value)}
                  />
                </Field>
                <Field label="Item serial, Part C">
                  <Input
                    value={license.itemSerialNumberPartC ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.itemSerialNumberPartC`, value)}
                  />
                </Field>
                <Field label="Licence quantity">
                  <Input
                    type="number"
                    value={license.licenseQuantity ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.licenseQuantity`, value)}
                  />
                </Field>
                <Field label="Export quantity">
                  <Input
                    type="number"
                    value={license.licenseExportQuantity ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.licenseExportQuantity`, value)}
                  />
                </Field>
                <Field label="Goods source">
                  <Select
                    value={license.indigenousOrImported ?? ''}
                    onChange={(value) => form.setValue(`licenses.${index}.indigenousOrImported`, value)}
                    options={goodsSourceOptions}
                    placeholder="Select if needed"
                  />
                </Field>
              </div>
            </RepeatableRow>
          ))}
        </div>
      </Card>
    </div>
  )
}
