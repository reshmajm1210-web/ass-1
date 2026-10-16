import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  wide?: boolean
  /** Close handler — also fired by Escape, the × button and a backdrop click. */
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}

/**
 * Modal shell: Escape closes, background scroll is locked while open, and the
 * first form control receives focus. Content is provided by the caller, so the
 * same shell serves the party and branch dialogs.
 */
export function Dialog({ open, title, description, wide, onClose, footer, children }: DialogProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="dialog__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}>
      <div className={wide ? 'dialog dialog--wide' : 'dialog'} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="dialog__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p className="card__description">{description}</p>}
          </div>
          <button type="button" className="dialog__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="dialog__body">{children}</div>
        {footer && <div className="dialog__footer">{footer}</div>}
      </div>
    </div>
  )
}
