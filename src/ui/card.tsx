import type { ReactNode } from 'react'

import { Button } from './button.tsx'

interface CardProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
  flush?: boolean
  children: ReactNode
}

export function Card({ title, description, actions, className, flush, children }: CardProps) {
  return (
    <section className={['card', className].filter(Boolean).join(' ')}>
      {(title || actions) && (
        <header className="card__header">
          <div>
            {title && <h2 className="card__title">{title}</h2>}
            {description && <p className="card__description">{description}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className={flush ? 'card__body card__body--flush' : 'card__body'}>{children}</div>
    </section>
  )
}

interface BadgeProps {
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

/** Label/value tile used by the dashboard stats row. */
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card">
      <div className="card__body">
        <p className="stat__label">{label}</p>
        <p className="stat__value">{value}</p>
      </div>
    </div>
  )
}

/** Sub-section inside a card, with an optional action on the right. */
export function SectionHeading({
  title,
  description,
  action
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="row row--between section__heading">
      <div>
        <h3>{title}</h3>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/**
 * A removable row in a repeating group (invoice, item, container, document,
 * licence, packing range). One markup shape for all of them.
 */
export function RepeatableRow({
  title,
  onRemove,
  removable = true,
  children
}: {
  title: ReactNode
  onRemove: () => void
  removable?: boolean
  children: ReactNode
}) {
  return (
    <div className="item-card">
      <div className="row row--between row--center repeatable__header">
        <h4>{title}</h4>
        {removable && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}
