/**
 * Validation for the quick-add dialogs.
 *
 * These create parties/branches, not shipping bills, so they use their own
 * small rules rather than the bill validator. Messages use the same dotted
 * shape so the Field component can render them the same way.
 */
export type DialogErrors = Record<string, string>

export const REQUIRED = 'Required'

/** Required text with a minimum length (party and branch names need ≥ 2). */
export function textError(value: string, minLength = 1): string | undefined {
  const trimmed = value.trim()
  if (trimmed.length === 0) return REQUIRED
  if (trimmed.length < minLength) return `Enter at least ${minLength} characters`
  return undefined
}

/** Empty strings are dropped before hitting the service. */
export function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}
