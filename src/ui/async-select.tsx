import { Select } from './select.tsx'
import { useAsyncOptions } from './use-async-options.ts'

interface AsyncSelectProps {
  value: string
  onChange: (value: string) => void
  /** Fetches the whole list; re-fetched when `dependencyKey` changes. */
  load: () => Promise<{ value: string; label: string }[]>
  dependencyKey?: unknown
  placeholder?: string
  disabled?: boolean
  /** Placeholder wording when the caller disabled the field. */
  disabledHint?: string
  /** Placeholder wording when the async list came back empty. */
  emptyHint?: string
}

/**
 * Select whose options come from a service. Renders a disabled select while
 * loading, on error, or when the source has no options — so an empty result
 * looks deliberate instead of broken.
 */
export function AsyncSelect({
  value,
  onChange,
  load,
  dependencyKey,
  placeholder = 'Select…',
  disabled,
  disabledHint = 'Select a value first',
  emptyHint = 'No options available for this selection'
}: AsyncSelectProps) {
  const { options, loading, error } = useAsyncOptions(load, [dependencyKey])
  const unavailable = loading || Boolean(error) || options.length === 0

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled || unavailable}
      placeholder={
        disabled
          ? disabledHint
          : loading
            ? 'Loading…'
            : error
              ? 'Could not load options'
              : options.length === 0
                ? emptyHint
                : placeholder
      }
    />
  )
}
