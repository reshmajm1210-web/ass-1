import { useState } from 'react'
import type { ReactNode } from 'react'

interface CollapsibleProps {
  title: string
  /** Start expanded — used when a record already carries advanced values. */
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * Progressive disclosure for the rarely-used field groups ("advanced"
 * sections). Native <details> keeps it accessible without extra JS.
 */
export function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <details className="advanced" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{title}</summary>
      {children}
    </details>
  )
}
