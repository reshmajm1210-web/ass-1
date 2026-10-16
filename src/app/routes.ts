/**
 * Route table + matcher. Paths are strings (no router dependency), which is
 * all this two-screen app needs.
 */
export const routes = {
  dashboard: '/',
  shippingBillNew: '/shipping-bills/new',
  toShippingBillEdit: (id: number | string) => `/shipping-bills/${id}`
}

export type RouteMatch =
  | { name: 'dashboard' }
  | { name: 'shipping-bill'; billId?: string }
  | { name: 'not-found' }

const EDIT_PATTERN = /^\/shipping-bills\/([^/]+)$/

export function matchRoute(pathname: string): RouteMatch {
  if (pathname === routes.dashboard) return { name: 'dashboard' }
  if (pathname === routes.shippingBillNew) return { name: 'shipping-bill' }
  const edit = EDIT_PATTERN.exec(pathname)
  if (edit) return { name: 'shipping-bill', billId: decodeURIComponent(edit[1]) }
  return { name: 'not-found' }
}

export function pageTitle(match: RouteMatch): string {
  if (match.name === 'dashboard') return 'Shipping Bills'
  if (match.name === 'shipping-bill') return match.billId ? 'Shipping Bill' : 'New Shipping Bill'
  return 'Not Found'
}
