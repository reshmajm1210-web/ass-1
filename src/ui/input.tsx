import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string
  /** Receives the new text directly — callers never read `event.target`. */
  onChange: (value: string) => void
}

/** Text-ish input (text, date, number-as-text, search). */
export function Input({ value, onChange, className, ...rest }: InputProps) {
  return (
    <input
      className={['input', className].filter(Boolean).join(' ')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...rest}
    />
  )
}

interface TextareaProps extends Omit<InputHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  rows?: number
  children?: ReactNode
}

export function Textarea({ value, onChange, className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={['textarea', className].filter(Boolean).join(' ')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...rest}
    />
  )
}
