import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncDataState<T> {
  data: T
  loading: boolean
  error: Error | null
  /** Re-run the request after a failure (or to refresh). */
  retry: () => void
}

/**
 * Single hook for reading anything from the service layer.
 *
 * The loader is kept in a ref, so passing an inline arrow function does not
 * restart the request on every render; re-fetching is driven by `deps` and by
 * `retry()`. Every async screen in the app shares this logic, which is why the
 * loading / error / retry behaviour is identical everywhere.
 */
export function useAsyncData<T>(load: () => Promise<T>, initial: T, deps: unknown[] = []): AsyncDataState<T> {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)

  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    loadRef
      .current()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause : new Error(String(cause)))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])
  return { data, loading, error, retry }
}
