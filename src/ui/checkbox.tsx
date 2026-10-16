import type { ReactNode } from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  hint?: string
  disabled?: boolean
}

export function Checkbox({ checked, onChange, label, hint, disabled }: CheckboxProps) {
  return (
    <label className={['checkbox', disabled ? 'checkbox--disabled' : ''].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="checkbox__text">
        <span>{label}</span>
        {hint && <span className="field__hint">{hint}</span>}
      </span>
    </label>
  )
}
