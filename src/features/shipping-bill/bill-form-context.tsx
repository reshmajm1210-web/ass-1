import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { appendRow, errorAt as lookupError, getPath, removeRow, setPath } from '../../forms/paths.ts'
import type { ShippingBillFormValues } from '../../domain/shipping-bill/types.ts'
import { validateBill } from '../../domain/shipping-bill/validation.ts'
import type { FieldErrors } from '../../domain/shipping-bill/validation.ts'

interface BillFormApi {
  values: ShippingBillFormValues
  /** Dot-path → message, populated after the first submit attempt. */
  errors: FieldErrors
  errorAt: (path: string) => string | undefined
  /** Text value at a dot path ('' when unset) — what inputs bind to. */
  valueAt: (path: string) => string
  setValue: (path: string, value: unknown) => void
  appendRow: (path: string, row: unknown) => void
  removeRow: (path: string, index: number) => void
  /** Validate now, remember that the user tried to submit, return the errors. */
  validate: () => FieldErrors
  saving: boolean
  setSaving: (saving: boolean) => void
}

const BillFormContext = createContext<BillFormApi | null>(null)

function readString(values: ShippingBillFormValues, path: string): string {
  const raw = getPath<unknown>(values, path)
  return typeof raw === 'string' ? raw : ''
}

/**
 * Owns the form's values.
 *
 * Values live in one object; edits go through the immutable path helpers, and
 * validation is derived from the current values once the user has attempted a
 * submit — so a fixed field clears its error immediately while a pristine form
 * never shows red. Saving state lives here too, so every action that talks to
 * a service can disable itself consistently.
 */
export function BillFormProvider({
  initialValues,
  children
}: {
  initialValues: ShippingBillFormValues
  children: ReactNode
}) {
  const [values, setValues] = useState<ShippingBillFormValues>(initialValues)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [saving, setSaving] = useState(false)

  const errors = useMemo(() => (submitAttempted ? validateBill(values) : {}), [submitAttempted, values])

  const setValue = useCallback((path: string, value: unknown) => {
    setValues((current) => setPath(current, path, value))
  }, [])

  const append = useCallback((path: string, row: unknown) => {
    setValues((current) => appendRow(current, path, row))
  }, [])

  const remove = useCallback((path: string, index: number) => {
    setValues((current) => removeRow(current, path, index))
  }, [])

  const validate = useCallback(() => {
    setSubmitAttempted(true)
    return validateBill(values)
  }, [values])

  const api = useMemo<BillFormApi>(
    () => ({
      values,
      errors,
      errorAt: (path) => lookupError(errors, path),
      valueAt: (path) => readString(values, path),
      setValue,
      appendRow: append,
      removeRow: remove,
      validate,
      saving,
      setSaving
    }),
    [values, errors, setValue, append, remove, validate, saving]
  )

  return <BillFormContext.Provider value={api}>{children}</BillFormContext.Provider>
}

export function useBillForm(): BillFormApi {
  const api = useContext(BillFormContext)
  if (!api) throw new Error('useBillForm must be used inside <BillFormProvider>')
  return api
}
