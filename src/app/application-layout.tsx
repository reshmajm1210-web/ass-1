import type { ReactNode } from 'react'

import { Link, usePathname } from './router.tsx'
import { routes } from './routes.ts'
import { ThemeToggle } from './theme-toggle.tsx'

interface ApplicationLayoutProps {
  children: ReactNode
  /** Content width; the form asks for a wider canvas than the dashboard. */
  maxWidth?: string
}

/** App chrome: brand, dashboard link and the theme switch. */
export function ApplicationLayout({ children, maxWidth }: ApplicationLayoutProps) {
  const pathname = usePathname()
  const onDashboard = pathname === routes.dashboard

  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__inner shell__inner--header">
          <Link to={routes.dashboard} className="brand">
            <span className="brand__mark" aria-hidden="true">
              SB
            </span>
            <span className="brand__text">
              <strong>Shipping Bill Studio</strong>
              <small>Export documentation workspace</small>
            </span>
          </Link>
          <nav className="shell__nav">
            {!onDashboard && (
              <Link to={routes.dashboard} className="nav-link">
                ← All shipping bills
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="shell__main">
        <div className="shell__inner" style={{ maxWidth: maxWidth ?? '72rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
