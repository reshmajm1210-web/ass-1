import type { SelectHTMLAttributes } from 'react'

import type { Option } from '../domain/shipping-bill/types.ts'

/** Options may carry a disabled flag; code lists don't need one. */
export type SelectOption = Option & { disabled?: boolean }

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'children'> {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  /** Rendered as a disabled first entry when `value` is empty. */
  placeholder?: string
}

/** Plain select for small, already-loaded option lists. */
export function Select({ value, onChange, options, placeholder, className, ...rest }: SelectProps) {
  const showPlaceholder = Boolean(placeholder) && value === ''
  return (
    <select
      className={['select', showPlaceholder ? 'select--placeholder' : '', className].filter(Boolean).join(' ')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...rest}>
      {placeholder && (
        <option value="" disabled={rest.disabled}>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
