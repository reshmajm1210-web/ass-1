import type { ReactNode } from 'react'

import { Button } from './button.tsx'

interface AsyncStateProps {
  loading: boolean
  error?: Error | null
  /** Called by the Try again button; omit to hide it. */
  onRetry?: () => void
  /** Only considered once loading finished and there is no error. */
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  loadingLabel?: string
  children: ReactNode
}

/**
 * One place to render the four states of any async read: loading, error,
 * empty and success. Keeps pages free of repeated if/else markup.
 */
export function AsyncState({
  loading,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  loadingLabel = 'Loading…',
  children
}: AsyncStateProps) {
  if (loading) {
    return (
      <div className="async-state" aria-busy="true">
        <p className="muted row--center row">
          <span className="spinner" aria-hidden="true" /> {loadingLabel}
        </p>
        <div className="skeleton" style={{ width: '70%' }} />
        <div className="skeleton" style={{ width: '45%' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="async-state__panel async-state__error">
        <p className="strong">Could not load this data</p>
        <p className="muted">{error.message || 'The mock service rejected the request.'}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="async-state__panel">
        <p className="strong">{emptyTitle}</p>
        {emptyDescription && <p className="muted">{emptyDescription}</p>}
        {emptyAction}
      </div>
    )
  }

  return <>{children}</>
}
