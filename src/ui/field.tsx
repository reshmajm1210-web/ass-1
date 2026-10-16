import type { ReactNode } from 'react'

interface FieldProps {
  label?: ReactNode
  /** Validation message for this field (dot-path lookup happens in the form). */
  error?: string
  hint?: string
  required?: boolean
  /** Buttons rendered on the label row, e.g. "+ Add new". */
  actions?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * Label + control + hint/error wrapper. Centralising this keeps every form
 * field's markup (and accessibility wiring) identical.
 */
export function Field({ label, error, hint, required, actions, className, children }: FieldProps) {
  const classes = ['field', error ? 'field--invalid' : '', className].filter(Boolean).join(' ')
  return (
    <div className={classes}>
      {(label || actions) && (
        <div className="field__header">
          {label && (
            <span className="field__label">
              {label}
              {required && (
                <span className="field__required" aria-hidden="true">
                  *
                </span>
              )}
            </span>
          )}
          {actions && <span className="field__actions">{actions}</span>}
        </div>
      )}
      {children}
      {error ? (
        <span className="field__error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="field__hint">{hint}</span>
      )}
    </div>
  )
}

/** Grouped fields with a legend — used for nested party blocks. */
export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="fieldset">
      <legend>{legend}</legend>
      <div className="details-grid">{children}</div>
    </fieldset>
  )
}
