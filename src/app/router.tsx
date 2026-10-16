/**
 * Minimal history-API router: a provider that holds the current pathname plus
 * `useNavigate` and `Link`. Enough for the app's two screens, and it keeps
 * routing state in one place instead of threading it through components.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface RouterValue {
  pathname: string
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterValue | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) return
    window.history.pushState(null, '', to)
    setPathname(to)
  }, [])

  const value = useMemo(() => ({ pathname, navigate }), [pathname, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

function useRouter(): RouterValue {
  const value = useContext(RouterContext)
  if (!value) throw new Error('useRouter must be used inside <RouterProvider>')
  return value
}

export function usePathname(): string {
  return useRouter().pathname
}

export function useNavigate(): (to: string) => void {
  return useRouter().navigate
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
  children: ReactNode
}

/** Anchor that navigates through the router but still supports open-in-new-tab. */
export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const navigate = useNavigate()
  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return
        event.preventDefault()
        navigate(to)
      }}
      {...rest}>
      {children}
    </a>
  )
}
