import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../../components/dashboard/AdminDashboard'
import { z } from 'zod'

const searchSchema = z.object({
  plano: z.enum(['inicial', 'padrao', 'premium', 'paroquia', 'diocese']).optional(),
})

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardRoute,
  validateSearch: searchSchema,
})

function DashboardRoute() {
  const search = Route.useSearch()

  return <Dashboard plano={search.plano} />
}
