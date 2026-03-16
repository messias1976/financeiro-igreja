import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../../components/dashboard/AdminDashboard'
import { z } from 'zod'

const searchSchema = z.object({
  plano: z.enum(['inicial', 'padrao', 'premium', 'paroquia', 'diocese']).optional(),
})

type SearchPlan = z.infer<typeof searchSchema>['plano']
type ResolvedPlan = Exclude<SearchPlan, undefined>

function normalizePlanFromPrefs(value: unknown): ResolvedPlan | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  if (value === 'inicial' || value === 'padrao' || value === 'premium' || value === 'paroquia' || value === 'diocese') {
    return value
  }

  return undefined
}

export const Route = createFileRoute('/_protected/dashboard')({
  validateSearch: searchSchema,
  component: DashboardRoute,
})

function DashboardRoute() {
  const search = Route.useSearch()
  const { currentUser } = Route.useRouteContext() as {
    currentUser?: { prefs?: Record<string, unknown> }
  }

  const planoAtivo =
    search.plano ||
    normalizePlanFromPrefs(currentUser?.prefs?.churchPlan ?? currentUser?.prefs?.plan)

  return (
    <div className="min-h-screen bg-[#050A1B] text-white animate-in fade-in duration-500">
      <Dashboard plano={planoAtivo} />
    </div>
  )
}