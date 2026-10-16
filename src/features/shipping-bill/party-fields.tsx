import { useMemo } from 'react'

import { Button, Field } from '../../ui/index.ts'
import type { BusinessRole } from '../../domain/shipping-bill/types.ts'
import { AsyncCombobox } from '../../ui/index.ts'
import { useBillForm } from './bill-form-context.tsx'
import {
  loadBranchOptions,
  loadBusinessOptions,
  loadExporterOptions,
  resolveBranchOption,
  resolveBusinessOption,
  resolveExporterOption
} from './party-options.ts'

interface PartyFieldsProps {
  label: string
  /** Dot paths of the party id and its branch id. */
  ownerPath: string
  branchPath: string
  kind: 'exporter' | 'business'
  /** Which role the business is playing (business fields only). */
  role?: BusinessRole
  required?: boolean
  hint?: string
  onQuickAdd?: () => void
  onAddBranch?: (ownerId: string) => void
  /** Runs after the party changes, e.g. to clear now-invalid selections. */
  afterOwnerChange?: () => void
}

/**
 * A party picker: search the owner (exporter or business) then its branch.
 *
 * The branch field stays disabled until an owner is chosen and is cleared
 * whenever the owner changes, so a bill can never point at a branch of a
 * different party.
 */
export function PartyFields({
  label,
  ownerPath,
  branchPath,
  kind,
  role = 'consignee',
  required,
  hint,
  onQuickAdd,
  onAddBranch,
  afterOwnerChange
}: PartyFieldsProps) {
  const { valueAt, setValue, errorAt } = useBillForm()
  const ownerId = valueAt(ownerPath)
  const branchId = valueAt(branchPath)

  const loadOwners = useMemo(
    () => (kind === 'exporter' ? loadExporterOptions : loadBusinessOptions(role)),
    [kind, role]
  )
  const resolveOwner = kind === 'exporter' ? resolveExporterOption : resolveBusinessOption
  const loadBranches = useMemo(() => loadBranchOptions(kind, ownerId), [kind, ownerId])

  const ownerLabel = kind === 'exporter' ? 'exporter' : 'business'

  return (
    <>
      <Field
        label={label}
        required={required}
        error={errorAt(ownerPath)}
        hint={hint}
        actions={
          onQuickAdd && (
            <Button variant="ghost" size="sm" onClick={onQuickAdd}>
              + Add new
            </Button>
          )
        }>
        <AsyncCombobox
          value={ownerId}
          onChange={(next) => {
            setValue(ownerPath, next)
            setValue(branchPath, '')
            afterOwnerChange?.()
          }}
          loadOptions={loadOwners}
          resolveValue={resolveOwner}
          placeholder={`Search & select ${ownerLabel}…`}
        />
      </Field>

      <Field
        label={`${label} branch`}
        required={required}
        error={errorAt(branchPath)}
        hint={ownerId ? undefined : `Choose a${kind === 'exporter' ? 'n exporter' : ' business'} first`}
        actions={
          ownerId &&
          onAddBranch && (
            <Button variant="ghost" size="sm" onClick={() => onAddBranch(ownerId)}>
              + Add branch
            </Button>
          )
        }>
        <AsyncCombobox
          value={branchId}
          onChange={(next) => setValue(branchPath, next)}
          loadOptions={loadBranches}
          resolveValue={resolveBranchOption}
          disabled={!ownerId}
          placeholder="Search & select branch…"
        />
      </Field>
    </>
  )
}
