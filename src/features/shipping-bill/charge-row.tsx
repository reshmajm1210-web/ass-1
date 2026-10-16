import { Field, Input, Select } from '../../ui/index.ts'
import { useBillForm } from './bill-form-context.tsx'
import { useReferenceData } from './reference-data-context.tsx'

export type ChargeField = 'freight' | 'insurance' | 'commission' | 'discount' | 'otherDeductions'

interface ChargeRowProps {
  label: string
  /** Invoice dot path, e.g. `invoices.0`. */
  basePath: string
  field: ChargeField
}

/**
 * One invoice charge (freight, insurance, commission, discount, other
 * deductions). Rate and amount disable each other — a charge is entered one
 * way or the other — and the currency select falls back to the invoice
 * currency via its placeholder, exactly like the starter.
 */
export function ChargeRow({ label, basePath, field }: ChargeRowProps) {
  const { valueAt, setValue } = useBillForm()
  const { currencies } = useReferenceData()

  const ratePath = `${basePath}.${field}Rate`
  const amountPath = `${basePath}.${field}Amount`
  const currencyPath = `${basePath}.${field}Currency`
  const invoiceCurrency = valueAt(`${basePath}.currency`)

  const rate = valueAt(ratePath)
  const amount = valueAt(amountPath)

  return (
    <>
      <Field label={`${label} rate %`}>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Rate"
          value={rate}
          disabled={amount !== ''}
          onChange={(value) => setValue(ratePath, value)}
        />
      </Field>
      <Field label={`${label} amount`}>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Amount"
          value={amount}
          disabled={rate !== ''}
          onChange={(value) => setValue(amountPath, value)}
        />
      </Field>
      <Field label={`${label} currency`}>
        <Select
          value={valueAt(currencyPath)}
          onChange={(value) => setValue(currencyPath, value)}
          options={currencies}
          placeholder={invoiceCurrency || 'Invoice currency'}
        />
      </Field>
    </>
  )
}
