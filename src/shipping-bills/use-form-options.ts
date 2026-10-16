import { useEffect, useState } from 'react'
import { FormOptions, referenceDataService } from './reference-data-service'

interface FormOptionsState {
  loading: boolean
  error: string | null
  options: FormOptions | null
}

const initial: FormOptionsState = { loading: true, error: null, options: null }

/**
 * Loads all reference/option data through the reference-data service so that
 * UI components never import hardcoded arrays directly.
 */
export function useFormOptions(): FormOptionsState {
  const [state, setState] = useState<FormOptionsState>(initial)

  useEffect(() => {
    let cancelled = false
    referenceDataService
      .getFormOptions()
      .then((options) => {
        if (!cancelled) setState({ loading: false, error: null, options })
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: err?.message ?? 'Failed to load options', options: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
