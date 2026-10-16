import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Button } from './button.tsx'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

interface AsyncComboboxProps {
  value: string
  onChange: (value: string) => void
  /** Called with the typed query; the service owns filtering. */
  loadOptions: (query: string) => Promise<ComboboxOption[]>
  /**
   * Resolves the label for a value that came from saved data (the starter's
   * "initial label" fetch). Optional — without it the raw value is shown.
   */
  resolveValue?: (value: string) => Promise<ComboboxOption | undefined>
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  emptyMessage?: string
  id?: string
}

const DEBOUNCE_MS = 200

/**
 * Type-to-search combobox backed by an async service.
 *
 * Handles every state an async field can be in: debounced searching, loading,
 * empty results, request failures with retry, and echoing the label of a
 * previously saved value. `loadOptions`/`resolveValue` are read through refs,
 * so callers can pass inline functions freely.
 */
export function AsyncCombobox({
  value,
  onChange,
  loadOptions,
  resolveValue,
  placeholder = 'Search…',
  disabled,
  clearable = true,
  emptyMessage = 'No matching results found',
  id
}: AsyncComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<ComboboxOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [highlight, setHighlight] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(null)

  const loadRef = useRef(loadOptions)
  loadRef.current = loadOptions
  const resolveRef = useRef(resolveValue)
  resolveRef.current = resolveValue

  const wrapperRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const inputId = id ?? generatedId

  /* Echo the label of a saved value that is not in the list yet. */
  useEffect(() => {
    if (!value) {
      setResolvedLabel(null)
      return
    }
    const resolver = resolveRef.current
    if (!resolver) {
      setResolvedLabel(value)
      return
    }
    let active = true
    resolver(value)
      .then((option) => {
        if (active) setResolvedLabel(option ? option.label : value)
      })
      .catch(() => {
        if (active) setResolvedLabel(value)
      })
    return () => {
      active = false
    }
  }, [value])

  /* Debounced search while the menu is open. */
  useEffect(() => {
    if (!open) return
    let active = true
    const timer = setTimeout(
      () => {
        setLoading(true)
        setError(null)
        loadRef
          .current(query)
          .then((result) => {
            if (!active) return
            setOptions(result)
            setHighlight(0)
          })
          .catch((cause: unknown) => {
            if (!active) return
            setOptions([])
            setError(cause instanceof Error ? cause : new Error(String(cause)))
          })
          .finally(() => {
            if (active) setLoading(false)
          })
      },
      query === '' ? 0 : DEBOUNCE_MS
    )
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [open, query, attempt])

  /* Close when clicking anywhere outside. */
  useEffect(() => {
    if (!open) return
    const onMouseDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const select = (option: ComboboxOption) => {
    onChange(option.value)
    setResolvedLabel(option.label)
    close()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      setHighlight((current) => {
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1
        if (next < 0) return options.length - 1
        if (next >= options.length) return 0
        return next
      })
      return
    }
    if (event.key === 'Enter' && open && options.length > 0) {
      event.preventDefault()
      select(options[highlight] ?? options[0])
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  }

  const displayValue = open ? query : resolvedLabel ?? value

  return (
    <div className="combobox" ref={wrapperRef}>
      <div className="combobox__control">
        <input
          id={inputId}
          className="input combobox__input"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          value={displayValue}
          placeholder={disabled ? 'Select a value first' : placeholder}
          onFocus={() => {
            setOpen(true)
            setQuery('')
          }}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />
        {clearable && value && !disabled && (
          <button
            type="button"
            className="combobox__clear"
            aria-label="Clear selection"
            onClick={() => {
              onChange('')
              setResolvedLabel(null)
              setQuery('')
              setOpen(true)
            }}>
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="combobox__menu" role="listbox">
          {loading && (
            <p className="combobox__status">
              <span className="spinner" aria-hidden="true" /> Searching
            </p>
          )}
          {!loading && error && (
            <p className="combobox__status combobox__status--error">
              Could not load options.{' '}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAttempt((current) => current + 1)
                }}>
                Retry
              </Button>
            </p>
          )}
          {!loading && !error && options.length === 0 && <p className="combobox__status">{emptyMessage}</p>}
          {!loading &&
            !error &&
            options.map((option, index) => (
              <div
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={['combobox__option', index === highlight ? 'combobox__option--highlighted' : '']
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(event) => {
                  event.preventDefault()
                  select(option)
                }}>
                <span className="combobox__option-label">{option.label}</span>
                {option.description && <span className="combobox__option-meta">{option.description}</span>}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
