/**
 * Network simulation for the mock services.
 *
 * Every service call goes through `simulateNetwork`, which adds realistic
 * latency and can fail on demand. Because all UI code only ever sees
 * `Promise<T>`, swapping the mock for `fetch` later changes nothing above
 * the service layer.
 *
 * Failure injection: include the token `//fail` in a search query (for
 * example type `aarav //fail` in any combobox) to exercise error states.
 */

export const FAILURE_TOKEN = '//fail'

/** Artificial round-trip window in milliseconds. */
const MIN_LATENCY_MS = 140
const MAX_LATENCY_MS = 380

/** Fast path for "resolve a label by id" style lookups. */
export const QUICK_LATENCY_MS = 90

export class ServiceError extends Error {
  code: string

  constructor(message: string, code = 'SERVICE_ERROR') {
    super(message)
    this.name = 'ServiceError'
    this.code = code
  }
}

function randomLatency(): number {
  return MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS)
}

export interface SimulateOptions {
  /** Search text, scanned for the failure token. */
  query?: string
  /** Fixed latency instead of the random window. */
  delayMs?: number
}

/**
 * Resolve `produce()` after a simulated round trip, or reject with a
 * `ServiceError` when the query asked for a failure.
 */
export function simulateNetwork<T>(produce: () => T, options: SimulateOptions = {}): Promise<T> {
  const { query = '', delayMs } = options
  const shouldFail = query.includes(FAILURE_TOKEN)
  const delay = delayMs ?? randomLatency()

  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(
          new ServiceError(
            `Simulated service failure (query contained "${FAILURE_TOKEN}"). Remove it and retry.`,
            'SIMULATED_FAILURE'
          )
        )
        return
      }
      try {
        resolve(produce())
      } catch (error) {
        reject(error instanceof Error ? error : new ServiceError(String(error)))
      }
    }, delay)
  })
}
