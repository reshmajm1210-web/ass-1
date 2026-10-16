import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  children: ReactNode
}

/**
 * The only button in the app. Defaults to `type="button"` so a button inside
 * a form never submits by accident — the submit button opts in explicitly.
 */
export function Button({ variant = 'primary', size = 'md', type = 'button', className, ...rest }: ButtonProps) {
  const classes = ['button', `button--${variant}`, size === 'sm' ? 'button--sm' : '', className]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classes} {...rest} />
}
