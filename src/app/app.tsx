import { ApplicationLayout } from './application-layout.tsx'
import { RouterProvider, usePathname } from './router.tsx'
import { matchRoute } from './routes.ts'
import { ToastProvider } from './toast.tsx'
import { DashboardPage } from '../features/dashboard/dashboard-page.tsx'
import { NotFoundPage } from '../features/not-found/not-found-page.tsx'
import { ShippingBillPage } from '../features/shipping-bill/shipping-bill-page.tsx'

/** Renders the screen matching the current URL — the whole route table. */
function CurrentScreen() {
  const pathname = usePathname()
  const match = matchRoute(pathname)

  if (match.name === 'dashboard') {
    return (
      <ApplicationLayout>
        <DashboardPage />
      </ApplicationLayout>
    )
  }

  if (match.name === 'shipping-bill') {
    return (
      <ApplicationLayout maxWidth="90rem">
        {/* `key` remounts the form when moving between bills or to a new one,
            so no draft state leaks across bills. */}
        <ShippingBillPage key={match.billId ?? 'new'} billId={match.billId} />
      </ApplicationLayout>
    )
  }

  return (
    <ApplicationLayout>
      <NotFoundPage />
    </ApplicationLayout>
  )
}

export function App() {
  return (
    <ToastProvider>
      <RouterProvider>
        <CurrentScreen />
      </RouterProvider>
    </ToastProvider>
  )
}
