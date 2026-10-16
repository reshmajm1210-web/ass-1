import { useState } from 'react'

import { useToast } from '../../../app/toast.tsx'
import { createBranch } from '../../../services/party-service.ts'
import { Button, Collapsible, Dialog, Field, Input, Select } from '../../../ui/index.ts'
import { useReferenceData } from '../reference-data-context.tsx'
import type { QuickBranchTarget } from '../quick-add.ts'
import { optionalText, textError } from './dialog-validation.ts'
import type { DialogErrors } from './dialog-validation.ts'

interface BranchDialogProps {
  target: QuickBranchTarget
  onClose: () => void
  /** Called with the new branch id so the form can select it. */
  onSaved: (target: QuickBranchTarget, branchId: number) => void
}

/** Quick-add dialog for one more branch of an existing party. */
export function BranchDialog({ target, onClose, onSaved }: BranchDialogProps) {
  const toast = useToast()
  const { countries } = useReferenceData()
  const isExporter = target.kind === 'exporter'

  const [branchName, setBranchName] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [countryCode, setCountryCode] = useState(isExporter ? 'IN' : '')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [gstnId, setGstnId] = useState('')
  const [adCode, setAdCode] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [ifscCode, setIfscCode] = useState('')

  const [errors, setErrors] = useState<DialogErrors>({})
  const [saving, setSaving] = useState(false)

  const validate = (): DialogErrors => {
    const found: DialogErrors = {}
    const nameError = textError(branchName, 2)
    if (nameError) found.branchName = nameError
    const addressError = textError(address1, 2)
    if (addressError) found.address1 = addressError
    const cityError = textError(city, 2)
    if (cityError) found.city = cityError
    return found
  }

  const handleSave = async () => {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      const branch = await createBranch(target.kind, Number(target.ownerId), {
        branchName: branchName.trim(),
        address1: address1.trim(),
        address2: optionalText(address2),
        city: city.trim(),
        state: optionalText(state),
        pincode: optionalText(pincode),
        countryCode,
        email: optionalText(email),
        mobile: optionalText(mobile),
        gstnId: optionalText(gstnId),
        adCode: optionalText(adCode),
        accountNo: optionalText(accountNo),
        ifscCode: optionalText(ifscCode)
      })
      toast.success(`${branch.branchName} added`)
      onSaved(target, branch.id)
    } catch {
      toast.error('Could not save the branch')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open
      title={target.title}
      description="The branch is saved to the mock service and selected in the form."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save branch'}
          </Button>
        </>
      }>
      <div className="details-grid">
        <Field label="Branch name" required error={errors.branchName}>
          <Input value={branchName} onChange={setBranchName} />
        </Field>
        <Field label="Address line 1" required error={errors.address1}>
          <Input value={address1} onChange={setAddress1} />
        </Field>
        <Field label="Address line 2">
          <Input value={address2} onChange={setAddress2} />
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
        <Field label="Country">
          <Select value={countryCode} onChange={setCountryCode} options={countries} placeholder="Select country" />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={setEmail} />
        </Field>
        <Field label="Mobile">
          <Input value={mobile} onChange={setMobile} />
        </Field>
        <Field label="GSTN id">
          <Input value={gstnId} onChange={setGstnId} />
        </Field>
      </div>

      {isExporter && (
        <Collapsible title="Exporter banking details">
          <div className="details-grid">
            <Field label="AD code">
              <Input value={adCode} onChange={setAdCode} />
            </Field>
            <Field label="Account number">
              <Input value={accountNo} onChange={setAccountNo} />
            </Field>
            <Field label="IFSC code">
              <Input value={ifscCode} onChange={setIfscCode} />
            </Field>
          </div>
        </Collapsible>
      )}
    </Dialog>
  )
}
