import type { SupportingDocForm } from '../../../domain/shipping-bill/types.ts'
import { getDocumentCodeLabel, searchDocumentCodes, searchFileTypeOptions } from '../../../services/reference-data-service.ts'
import { AsyncCombobox, Collapsible, Field, Input, RepeatableRow, SectionHeading } from '../../../ui/index.ts'
import { useBillForm } from '../bill-form-context.tsx'

interface DocumentEditorProps {
  index: number
  document: SupportingDocForm
  onRemove: () => void
}

/** Any advanced value already saved on the row keeps its section expanded. */
function hasAdvancedValues(document: SupportingDocForm): boolean {
  return Boolean(
    document.placeOfIssue ||
      document.invoiceSerialNumber ||
      document.itemSerialNumber ||
      document.imageReferenceNumber ||
      document.documentExpiryDate ||
      document.icegateId ||
      document.issuingPartyCode ||
      document.issuingPartyName ||
      document.issuingPartyAddress1 ||
      document.issuingPartyAddress2 ||
      document.issuingPartyCity ||
      document.issuingPartyPin ||
      document.beneficiaryPartyCode ||
      document.beneficiaryPartyName ||
      document.beneficiaryPartyAddress1 ||
      document.beneficiaryPartyAddress2 ||
      document.beneficiaryPartyCity ||
      document.beneficiaryPartyPin ||
      document.fileType
  )
}

/**
 * One supporting document (e-Sanchit). The type code and file type are
 * searched through the reference-data service; the issuing/beneficiary blocks
 * only take space when they carry values.
 */
export function DocumentEditor({ index, document, onRemove }: DocumentEditorProps) {
  const form = useBillForm()
  const base = `documents.${index}`

  return (
    <RepeatableRow title={`Document ${index + 1}`} onRemove={onRemove}>
      <div className="details-grid">
        <Field label="Document type code" required error={form.errorAt(`${base}.documentTypeCode`)}>
          <AsyncCombobox
            value={document.documentTypeCode}
            onChange={(value) => form.setValue(`${base}.documentTypeCode`, value)}
            loadOptions={searchDocumentCodes}
            resolveValue={async (value) => ({ value, label: await getDocumentCodeLabel(value) })}
            placeholder="Search document type…"
          />
        </Field>
        <Field label="Reference number" required error={form.errorAt(`${base}.documentReferenceNumber`)}>
          <Input
            value={document.documentReferenceNumber}
            onChange={(value) => form.setValue(`${base}.documentReferenceNumber`, value)}
          />
        </Field>
        <Field label="Image reference number">
          <Input
            value={document.imageReferenceNumber ?? ''}
            onChange={(value) => form.setValue(`${base}.imageReferenceNumber`, value)}
          />
        </Field>
        <Field label="Issue date">
          <Input
            type="date"
            value={document.documentIssueDate ?? ''}
            onChange={(value) => form.setValue(`${base}.documentIssueDate`, value)}
          />
        </Field>
      </div>

      <div style={{ marginTop: '0.85rem' }}>
        <Collapsible title="Issuing party and ICEGATE details" defaultOpen={hasAdvancedValues(document)}>
          <div className="details-grid">
            <Field label="Expiry date">
              <Input
                type="date"
                value={document.documentExpiryDate ?? ''}
                onChange={(value) => form.setValue(`${base}.documentExpiryDate`, value)}
              />
            </Field>
            <Field label="Invoice serial number">
              <Input
                type="number"
                value={document.invoiceSerialNumber ?? ''}
                onChange={(value) => form.setValue(`${base}.invoiceSerialNumber`, value)}
              />
            </Field>
            <Field label="Item serial number">
              <Input
                type="number"
                value={document.itemSerialNumber ?? ''}
                onChange={(value) => form.setValue(`${base}.itemSerialNumber`, value)}
              />
            </Field>
            <Field label="File type" hint="Only PDF is accepted by e-Sanchit">
              <AsyncCombobox
                value={document.fileType ?? ''}
                onChange={(value) => form.setValue(`${base}.fileType`, value)}
                loadOptions={searchFileTypeOptions}
                resolveValue={async (value) => ({ value, label: value.toUpperCase() })}
                placeholder="Search file type…"
                emptyMessage="Only PDF is supported"
              />
            </Field>
            <Field label="Place of issue">
              <Input
                value={document.placeOfIssue ?? ''}
                onChange={(value) => form.setValue(`${base}.placeOfIssue`, value)}
              />
            </Field>
            <Field label="ICEGATE id">
              <Input value={document.icegateId ?? ''} onChange={(value) => form.setValue(`${base}.icegateId`, value)} />
            </Field>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <Collapsible title="Issuing & beneficiary details">
              <SectionHeading title="Issuing details" />
              <div className="details-grid">
                {ISSUING_FIELDS.map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      value={(document[key] as string | undefined) ?? ''}
                      onChange={(value) => form.setValue(`${base}.${key}`, value)}
                    />
                  </Field>
                ))}
              </div>

              <div style={{ marginTop: '0.85rem' }}>
                <SectionHeading title="Beneficiary details" />
                <div className="details-grid">
                  {BENEFICIARY_FIELDS.map(([key, label]) => (
                    <Field key={key} label={label}>
                      <Input
                        value={(document[key] as string | undefined) ?? ''}
                        onChange={(value) => form.setValue(`${base}.${key}`, value)}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            </Collapsible>
          </div>
        </Collapsible>
      </div>
    </RepeatableRow>
  )
}

/** Field lists for the two party blocks — data, not markup. */
const ISSUING_FIELDS: Array<[keyof SupportingDocForm, string]> = [
  ['issuingPartyCode', 'Issuing party code'],
  ['issuingPartyName', 'Issuing party name'],
  ['issuingPartyAddress1', 'Issuing address line 1'],
  ['issuingPartyAddress2', 'Issuing address line 2'],
  ['issuingPartyCity', 'Issuing city'],
  ['issuingPartyPin', 'Issuing postal code']
]

const BENEFICIARY_FIELDS: Array<[keyof SupportingDocForm, string]> = [
  ['beneficiaryPartyCode', 'Beneficiary code'],
  ['beneficiaryPartyName', 'Beneficiary name'],
  ['beneficiaryPartyAddress1', 'Beneficiary address line 1'],
  ['beneficiaryPartyAddress2', 'Beneficiary address line 2'],
  ['beneficiaryPartyCity', 'Beneficiary city'],
  ['beneficiaryPartyPin', 'Beneficiary postal code']
]
