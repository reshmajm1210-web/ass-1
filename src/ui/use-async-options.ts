import { useAsyncData } from '../state/use-async-data.ts'

export interface AsyncOptionsState<T> {
  options: T[]
  loading: boolean
  error: Error | null
  /** Re-run the loader after a failure. */
  retry: () => void
}

/**
 * Load a list of options from an async source, exposing the loading / error /
 * retry states every async field must handle. Thin wrapper over `useAsyncData`
 * so option lists and page-level reads behave the same way.
 */
export function useAsyncOptions<T>(load: () => Promise<T[]>, deps: unknown[] = []): AsyncOptionsState<T> {
  const { data, ...state } = useAsyncData<T[]>(load, [], deps)
  return { options: data, ...state }
}
