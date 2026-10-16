import { useState } from 'react'

import { Button, Checkbox, Collapsible, Dialog, Field, Input, Select } from '../../../ui/index.ts'
import { createBusiness, createExporter } from '../../../services/party-service.ts'
import { useToast } from '../../../app/toast.tsx'
import { useReferenceData } from '../reference-data-context.tsx'
import type { QuickAddTarget } from '../quick-add.ts'
import { optionalText, REQUIRED, textError } from './dialog-validation.ts'
import type { DialogErrors } from './dialog-validation.ts'

interface PartyDialogProps {
  target: QuickAddTarget
  onClose: () => void
  /** Called with the new party id and, when entered, its first branch id. */
  onSaved: (target: QuickAddTarget, ownerId: number, firstBranchId?: number) => void
}

type Role = 'consignee' | 'buyer' | 'notify' | 'thirdParty'

/**
 * Quick-add dialog for an exporter or business (with an optional first
 * branch). The role checkboxes are pre-ticked with the role that triggered
 * the dialog, so the new party is immediately findable in that field.
 */
export function PartyDialog({ target, onClose, onSaved }: PartyDialogProps) {
  const toast = useToast()
  const { countries, exporterClassOptions, exporterTypeOptions } = useReferenceData()
  const isExporter = target.kind === 'exporter'

  const [name, setName] = useState('')
  const [iec, setIec] = useState('')
  const [exporterClass, setExporterClass] = useState('')
  const [exporterType, setExporterType] = useState('')
  const [roles, setRoles] = useState<Record<Role, boolean>>({
    consignee: target.role === 'consignee',
    buyer: target.role === 'buyer',
    notify: false,
    thirdParty: target.role === 'thirdParty'
  })
  const [pan, setPan] = useState('')
  const [tan, setTan] = useState('')
  const [aeoNumber, setAeoNumber] = useState('')
  const [website, setWebsite] = useState('')
  const [notes, setNotes] = useState('')

  const [branchName, setBranchName] = useState('')
  const [address1, setAddress1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [countryCode, setCountryCode] = useState(isExporter ? 'IN' : '')

  const [errors, setErrors] = useState<DialogErrors>({})
  const [saving, setSaving] = useState(false)

  const validate = (): DialogErrors => {
    const found: DialogErrors = {}
    const nameError = textError(name, 2)
    if (nameError) found.name = nameError

    // (assumption) A business with no role can never be found again, so at
    // least one role is required.
    if (!isExporter && !roles.consignee && !roles.buyer && !roles.notify && !roles.thirdParty) {
      found.roles = 'Select at least one role'
    }

    const branchNameError = textError(branchName, 1)
    if (branchNameError) found.branchName = branchNameError
    const addressError = textError(address1, 1)
    if (addressError) found.address1 = addressError
    const cityError = textError(city, 1)
    if (cityError) found.city = cityError
    if (!countryCode) found.countryCode = REQUIRED

    return found
  }

  const handleSave = async () => {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    const firstBranch = {
      branchName: branchName.trim(),
      address1: address1.trim(),
      city: city.trim(),
      state: optionalText(state),
      pincode: optionalText(pincode),
      countryCode
    }

    try {
      if (isExporter) {
        const created = await createExporter({
          name: name.trim(),
          iec: iec.trim(),
          class: exporterClass || 'F',
          type: exporterType || 'P',
          pan: optionalText(pan),
          tan: optionalText(tan),
          aeoNumber: optionalText(aeoNumber),
          website: optionalText(website),
          notes: optionalText(notes),
          firstBranch
        })
        toast.success(`${created.name} added`)
        onSaved(target, created.id, created.branches[0]?.id)
      } else {
        const created = await createBusiness({
          name: name.trim(),
          iec: optionalText(iec),
          isConsignee: roles.consignee,
          isBuyer: roles.buyer,
          isNotify: roles.notify,
          isThirdParty: roles.thirdParty,
          firstBranch
        })
        toast.success(`${created.name} added`)
        onSaved(target, created.id, created.branches[0]?.id)
      }
    } catch {
      toast.error('Could not save the party')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open
      title={target.title}
      description="The party is saved to the mock service and selected in the form."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save party'}
          </Button>
        </>
      }>
      <div className="details-grid">
        <Field label="Name" required error={errors.name}>
          <Input value={name} onChange={setName} placeholder={isExporter ? 'Exporter name' : 'Business name'} />
        </Field>
        <Field label="IEC code" hint="Importer–Exporter Code">
          <Input value={iec} onChange={setIec} />
        </Field>
      </div>

      {isExporter ? (
        <div className="details-grid">
          <Field label="Exporter class">
            <Select
              value={exporterClass}
              onChange={setExporterClass}
              options={exporterClassOptions}
              placeholder="Select class"
            />
          </Field>
          <Field label="Exporter type">
            <Select
              value={exporterType}
              onChange={setExporterType}
              options={exporterTypeOptions}
              placeholder="Select type"
            />
          </Field>
        </div>
      ) : (
        <div className="section">
          <p className="field__label">Roles</p>
          <div className="row row--tight">
            <Checkbox
              checked={roles.consignee}
              onChange={(checked) => setRoles((current) => ({ ...current, consignee: checked }))}
              label="Consignee"
            />
            <Checkbox
              checked={roles.buyer}
              onChange={(checked) => setRoles((current) => ({ ...current, buyer: checked }))}
              label="Buyer"
            />
            <Checkbox
              checked={roles.notify}
              onChange={(checked) => setRoles((current) => ({ ...current, notify: checked }))}
              label="Notify party"
            />
            <Checkbox
              checked={roles.thirdParty}
              onChange={(checked) => setRoles((current) => ({ ...current, thirdParty: checked }))}
              label="Third party"
            />
          </div>
          {errors.roles && (
            <p className="field__error" role="alert">
              {errors.roles}
            </p>
          )}
        </div>
      )}

      <Collapsible title="Advanced details">
        <div className="details-grid">
          {isExporter && (
            <>
              <Field label="PAN">
                <Input value={pan} onChange={setPan} />
              </Field>
              <Field label="TAN">
                <Input value={tan} onChange={setTan} />
              </Field>
            </>
          )}
          <Field label="AEO number">
            <Input value={aeoNumber} onChange={setAeoNumber} />
          </Field>
          <Field label="Website">
            <Input value={website} onChange={setWebsite} />
          </Field>
          <Field label="Notes">
            <Input value={notes} onChange={setNotes} />
          </Field>
        </div>
      </Collapsible>

      <div className="section">
        <h3>First branch</h3>
        <p className="muted">A branch is required so the bill can print an address.</p>
        <div className="details-grid" style={{ marginTop: '0.6rem' }}>
          <Field label="Branch name" required error={errors.branchName}>
            <Input value={branchName} onChange={setBranchName} />
          </Field>
          <Field label="Address line 1" required error={errors.address1}>
            <Input value={address1} onChange={setAddress1} />
          </Field>
          <Field label="City" required error={errors.city}>
            <Input value={city} onChange={setCity} />
          </Field>
          <Field label="State">
            <Input value={state} onChange={setState} />
          </Field>
          <Field label="Pincode">
            <Input value={pincode} onChange={setPincode} />
          </Field>
          <Field label="Country" required error={errors.countryCode}>
            <Select value={countryCode} onChange={setCountryCode} options={countries} placeholder="Select country" />
          </Field>
        </div>
      </div>
    </Dialog>
  )
}
