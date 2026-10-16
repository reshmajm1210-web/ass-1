import { Link } from '../../app/router.tsx'
import { routes } from '../../app/routes.ts'
import { Card } from '../../ui/index.ts'

export function NotFoundPage() {
  return (
    <Card title="Page not found" description="That address does not match any screen in this app.">
      <p className="muted">
        <Link to={routes.dashboard}>Go to shipping bills</Link>
      </p>
    </Card>
  )
}
