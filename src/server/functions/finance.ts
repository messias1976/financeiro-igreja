import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { AppwriteException, Databases, ID, Query } from 'node-appwrite'
import z from 'zod'
import { createAdminClient } from '../lib/appwrite'
import { authMiddleware } from './auth'

type RoleKey = 'dono_saas' | 'administrador' | 'tesoureiro' | 'pastor' | 'membro'
type PlanoAtivo = 'inicial' | 'padrao' | 'premium'
type FinanceUser = { $id: string; prefs?: unknown }

type FinanceCollectionsConfig = {
  databaseId: string
  tithesCollectionId: string
  offeringsCollectionId: string
}

type FinanceCollectionsWithExpensesConfig = FinanceCollectionsConfig & {
  expensesCollectionId: string
}

function getFinanceCollectionsConfig(): FinanceCollectionsConfig {
  const databaseId = process.env.APPWRITE_DATABASE_ID
  const tithesCollectionId = process.env.APPWRITE_COLLECTION_TITHES_ID
  const offeringsCollectionId = process.env.APPWRITE_COLLECTION_OFFERINGS_ID

  if (!databaseId || !tithesCollectionId || !offeringsCollectionId) {
    setResponseStatus(500)
    throw {
      message:
        'Configure APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_TITHES_ID e APPWRITE_COLLECTION_OFFERINGS_ID no ambiente.',
      status: 500,
    }
  }

  return {
    databaseId,
    tithesCollectionId,
    offeringsCollectionId,
  }
}

function getFinanceCollectionsWithExpensesConfig(): FinanceCollectionsWithExpensesConfig {
  const base = getFinanceCollectionsConfig()
  const expensesCollectionId = process.env.APPWRITE_COLLECTION_EXPENSES_ID

  if (!expensesCollectionId) {
    setResponseStatus(500)
    throw {
      message: 'Configure APPWRITE_COLLECTION_EXPENSES_ID no ambiente.',
      status: 500,
    }
  }

  return {
    ...base,
    expensesCollectionId,
  }
}

function normalizeRole(value?: unknown): RoleKey {
  if (typeof value !== 'string') {
    return 'membro'
  }

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  if (normalized === 'administrador' || normalized === 'admin') return 'administrador'
  if (normalized === 'dono_saas' || normalized === 'dono' || normalized === 'owner') return 'dono_saas'
  if (normalized === 'tesoureiro' || normalized === 'tesouraria') return 'tesoureiro'
  if (normalized === 'pastor') return 'pastor'
  return 'membro'
}

function normalizePlan(value?: unknown): PlanoAtivo {
  if (typeof value !== 'string') {
    return 'premium'
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'inicial') return 'inicial'
  if (normalized === 'padrao' || normalized === 'paroquia') return 'padrao'
  return 'premium'
}

function ensureFinanceAccess(currentUser: FinanceUser) {
  const prefs = (currentUser.prefs as Record<string, unknown> | undefined) ?? {}
  const role = normalizeRole(prefs.role)

  if (role !== 'dono_saas' && role !== 'administrador' && role !== 'tesoureiro') {
    setResponseStatus(403)
    throw { message: 'Permissao negada para operacoes financeiras', status: 403 }
  }
}

function ensurePlanAtLeast(currentUser: FinanceUser, required: Exclude<PlanoAtivo, 'inicial'>) {
  const prefs = (currentUser.prefs as Record<string, unknown> | undefined) ?? {}
  const role = normalizeRole(prefs.role)

  if (role === 'dono_saas') {
    return
  }

  const plan = normalizePlan(prefs.churchPlan ?? prefs.plan)

  if (required === 'padrao' && plan === 'inicial') {
    setResponseStatus(403)
    throw { message: 'Este recurso requer Plano Padrao ou Premium', status: 403 }
  }

  if (required === 'premium' && plan !== 'premium') {
    setResponseStatus(403)
    throw { message: 'Este recurso requer Plano Premium', status: 403 }
  }
}

function sanitizeDocumentData(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function escapeCsv(value: string | number) {
  const text = String(value)
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const createTitheSchema = z.object({
  amount: z.number().positive('Valor deve ser maior que zero'),
  titheDate: z.string().min(1, 'Data do dizimo e obrigatoria'),
  paymentMethod: z.string().min(1, 'Forma de pagamento e obrigatoria'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  periodReference: z.string().optional(),
  contributorName: z.string().optional(),
})

export const createTitheFn = createServerFn({ method: 'POST' })
  .inputValidator(createTitheSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Nao autorizado', status: 401 }
    }

    ensureFinanceAccess(currentUser)

    const { databaseId, tithesCollectionId } = getFinanceCollectionsConfig()
    const adminClient = createAdminClient()
    const databases = new Databases(adminClient.client)

    try {
      const payload = sanitizeDocumentData({
        amount: Number(data.amount.toFixed(2)),
        tithe_date: data.titheDate,
        payment_method: data.paymentMethod,
        reference_number: data.referenceNumber,
        notes: data.notes,
        period_reference: data.periodReference,
        contributor_name: data.contributorName,
        recorded_by: currentUser.$id,
        created_at: new Date().toISOString(),
      })

      const document = await databases.createDocument(databaseId, tithesCollectionId, ID.unique(), payload)

      return {
        id: document.$id,
        message: 'Dizimo registrado com sucesso',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code ?? 500 }
    }
  })

const createOfferingSchema = z.object({
  amount: z.number().positive('Valor deve ser maior que zero'),
  offeringDate: z.string().min(1, 'Data da oferta e obrigatoria'),
  offeringType: z.string().min(1, 'Tipo da oferta e obrigatorio'),
  campaign: z.string().optional(),
  paymentMethod: z.string().min(1, 'Forma de pagamento e obrigatoria'),
  contributorName: z.string().optional(),
  notes: z.string().optional(),
})

export const createOfferingFn = createServerFn({ method: 'POST' })
  .inputValidator(createOfferingSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Nao autorizado', status: 401 }
    }

    ensureFinanceAccess(currentUser)

    const { databaseId, offeringsCollectionId } = getFinanceCollectionsConfig()
    const adminClient = createAdminClient()
    const databases = new Databases(adminClient.client)

    try {
      const payload = sanitizeDocumentData({
        amount: Number(data.amount.toFixed(2)),
        offering_date: data.offeringDate,
        offering_type: data.offeringType,
        campaign: data.campaign,
        payment_method: data.paymentMethod,
        contributor_name: data.contributorName,
        notes: data.notes,
        recorded_by: currentUser.$id,
        created_at: new Date().toISOString(),
      })

      const document = await databases.createDocument(databaseId, offeringsCollectionId, ID.unique(), payload)

      return {
        id: document.$id,
        message: 'Oferta registrada com sucesso',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code ?? 500 }
    }
  })

const createExpenseSchema = z.object({
  description: z.string().min(3, 'Descricao deve ter ao menos 3 caracteres'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  expenseDate: z.string().min(1, 'Data da despesa e obrigatoria'),
  category: z.string().min(1, 'Categoria e obrigatoria'),
  vendor: z.string().optional(),
  paymentMethod: z.string().min(1, 'Forma de pagamento e obrigatoria'),
  status: z.enum(['pending', 'approved', 'paid']),
  notes: z.string().optional(),
})

export const createExpenseFn = createServerFn({ method: 'POST' })
  .inputValidator(createExpenseSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Nao autorizado', status: 401 }
    }

    ensureFinanceAccess(currentUser)
    ensurePlanAtLeast(currentUser, 'padrao')

    const { databaseId, expensesCollectionId } = getFinanceCollectionsWithExpensesConfig()
    const adminClient = createAdminClient()
    const databases = new Databases(adminClient.client)

    try {
      const payload = sanitizeDocumentData({
        description: data.description,
        amount: Number(data.amount.toFixed(2)),
        expense_date: data.expenseDate,
        category: data.category,
        vendor: data.vendor,
        payment_method: data.paymentMethod,
        status: data.status,
        notes: data.notes,
        created_by: currentUser.$id,
        created_at: new Date().toISOString(),
      })

      const document = await databases.createDocument(databaseId, expensesCollectionId, ID.unique(), payload)

      return {
        id: document.$id,
        message: 'Despesa registrada com sucesso',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code ?? 500 }
    }
  })

const exportFinanceReportSchema = z.object({
  startDate: z.string().min(1, 'Data inicial e obrigatoria'),
  endDate: z.string().min(1, 'Data final e obrigatoria'),
  format: z.enum(['csv', 'pdf', 'xlsx']),
  consolidation: z.enum(['categoria', 'forma', 'campanha']),
})

export const exportFinanceReportFn = createServerFn({ method: 'POST' })
  .inputValidator(exportFinanceReportSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Nao autorizado', status: 401 }
    }

    ensureFinanceAccess(currentUser)
    ensurePlanAtLeast(currentUser, 'padrao')

    const { databaseId, tithesCollectionId, offeringsCollectionId, expensesCollectionId } = getFinanceCollectionsWithExpensesConfig()
    const adminClient = createAdminClient()
    const databases = new Databases(adminClient.client)

    try {
      const [tithesResult, offeringsResult, expensesResult] = await Promise.all([
        databases.listDocuments(databaseId, tithesCollectionId, [
          Query.greaterThanEqual('tithe_date', data.startDate),
          Query.lessThanEqual('tithe_date', data.endDate),
          Query.limit(5000),
        ]),
        databases.listDocuments(databaseId, offeringsCollectionId, [
          Query.greaterThanEqual('offering_date', data.startDate),
          Query.lessThanEqual('offering_date', data.endDate),
          Query.limit(5000),
        ]),
        databases.listDocuments(databaseId, expensesCollectionId, [
          Query.greaterThanEqual('expense_date', data.startDate),
          Query.lessThanEqual('expense_date', data.endDate),
          Query.limit(5000),
        ]),
      ])

      const tithes = tithesResult.documents as Array<Record<string, unknown>>
      const offerings = offeringsResult.documents as Array<Record<string, unknown>>
      const expenses = expensesResult.documents as Array<Record<string, unknown>>

      const totals = {
        tithes: tithes.reduce((acc, row) => acc + toNumber(row.amount), 0),
        offerings: offerings.reduce((acc, row) => acc + toNumber(row.amount), 0),
        expenses: expenses.reduce((acc, row) => acc + toNumber(row.amount), 0),
      }

      const net = totals.tithes + totals.offerings - totals.expenses

      const consolidationMap = new Map<string, number>()
      const addToConsolidation = (key: string, amount: number) => {
        consolidationMap.set(key, (consolidationMap.get(key) ?? 0) + amount)
      }

      if (data.consolidation === 'categoria') {
        expenses.forEach((row) => {
          const category = typeof row.category === 'string' ? row.category : 'sem_categoria'
          addToConsolidation(category, toNumber(row.amount))
        })
      }

      if (data.consolidation === 'campanha') {
        offerings.forEach((row) => {
          const campaign = typeof row.campaign === 'string' && row.campaign.trim() ? row.campaign : 'sem_campanha'
          addToConsolidation(campaign, toNumber(row.amount))
        })
      }

      if (data.consolidation === 'forma') {
        ;[...tithes, ...offerings, ...expenses].forEach((row) => {
          const paymentMethod =
            typeof row.payment_method === 'string' && row.payment_method.trim()
              ? row.payment_method
              : 'nao_informado'
          addToConsolidation(paymentMethod, toNumber(row.amount))
        })
      }

      const breakdown = Array.from(consolidationMap.entries())
        .map(([key, value]) => ({ key, value: Number(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value)

      const csvRows = [
        ['metrica', 'valor'],
        ['periodo_inicio', data.startDate],
        ['periodo_fim', data.endDate],
        ['total_dizimos', totals.tithes.toFixed(2)],
        ['total_ofertas', totals.offerings.toFixed(2)],
        ['total_despesas', totals.expenses.toFixed(2)],
        ['saldo_liquido', net.toFixed(2)],
        [''],
        ['consolidacao', data.consolidation],
        ['chave', 'valor'],
        ...breakdown.map((item) => [item.key, item.value.toFixed(2)]),
      ]

      const csvContent = csvRows
        .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
        .join('\n')

      const filename = `relatorio-financeiro-${data.startDate}-${data.endDate}.csv`

      return {
        summary: {
          startDate: data.startDate,
          endDate: data.endDate,
          totals: {
            tithes: Number(totals.tithes.toFixed(2)),
            offerings: Number(totals.offerings.toFixed(2)),
            expenses: Number(totals.expenses.toFixed(2)),
            net: Number(net.toFixed(2)),
          },
          consolidation: data.consolidation,
          breakdown,
          requestedFormat: data.format,
          generatedFormat: 'csv',
        },
        file: {
          name: filename,
          mimeType: 'text/csv;charset=utf-8',
          content: csvContent,
        },
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code ?? 500 }
    }
  })

export const getTreasurerMonthlyTotalsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Nao autorizado', status: 401 }
    }

    ensureFinanceAccess(currentUser)

    const { databaseId, tithesCollectionId, offeringsCollectionId, expensesCollectionId } = getFinanceCollectionsWithExpensesConfig()
    const adminClient = createAdminClient()
    const databases = new Databases(adminClient.client)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const startDate = startOfMonth.toISOString()
    const endDate = endOfMonth.toISOString()

    try {
      const [tithesResult, offeringsResult, expensesResult] = await Promise.all([
        databases.listDocuments(databaseId, tithesCollectionId, [
          Query.greaterThanEqual('tithe_date', startDate),
          Query.lessThanEqual('tithe_date', endDate),
          Query.limit(5000),
        ]),
        databases.listDocuments(databaseId, offeringsCollectionId, [
          Query.greaterThanEqual('offering_date', startDate),
          Query.lessThanEqual('offering_date', endDate),
          Query.limit(5000),
        ]),
        databases.listDocuments(databaseId, expensesCollectionId, [
          Query.greaterThanEqual('expense_date', startDate),
          Query.lessThanEqual('expense_date', endDate),
          Query.limit(5000),
        ]),
      ])

      const tithes = tithesResult.documents as Array<Record<string, unknown>>
      const offerings = offeringsResult.documents as Array<Record<string, unknown>>
      const expenses = expensesResult.documents as Array<Record<string, unknown>>

      const totalTithes = tithes.reduce((acc, row) => acc + toNumber(row.amount), 0)

      const totalVotes = offerings
        .filter((row) => {
          const type = typeof row.offering_type === 'string' ? row.offering_type.trim().toLowerCase() : ''
          return type === 'voto' || type === 'votos'
        })
        .reduce((acc, row) => acc + toNumber(row.amount), 0)

      const totalOfferings = offerings
        .filter((row) => {
          const type = typeof row.offering_type === 'string' ? row.offering_type.trim().toLowerCase() : ''
          return type !== 'voto' && type !== 'votos'
        })
        .reduce((acc, row) => acc + toNumber(row.amount), 0)

      const totalOutputs = expenses.reduce((acc, row) => acc + toNumber(row.amount), 0)

      const monthLabel = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(now)

      return {
        monthLabel,
        totals: {
          tithes: Number(totalTithes.toFixed(2)),
          offerings: Number(totalOfferings.toFixed(2)),
          votes: Number(totalVotes.toFixed(2)),
          outputs: Number(totalOutputs.toFixed(2)),
        },
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code ?? 500 }
    }
  },
)

export const getMemberMonthlyTotalsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Nao autorizado', status: 401 }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const startDate = startOfMonth.toISOString()
    const endDate = endOfMonth.toISOString()

    const monthLabel = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(now)

    const fallbackResult = {
      monthLabel,
      totals: {
        tithes: 0,
        offerings: 0,
        votes: 0,
      },
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID
    const tithesCollectionId = process.env.APPWRITE_COLLECTION_TITHES_ID
    const offeringsCollectionId = process.env.APPWRITE_COLLECTION_OFFERINGS_ID

    if (!databaseId || !tithesCollectionId || !offeringsCollectionId) {
      return fallbackResult
    }

    const adminClient = createAdminClient()
    const databases = new Databases(adminClient.client)

    try {
      const [tithesResult, offeringsResult] = await Promise.all([
        databases.listDocuments(databaseId, tithesCollectionId, [
          Query.greaterThanEqual('tithe_date', startDate),
          Query.lessThanEqual('tithe_date', endDate),
          Query.limit(5000),
        ]),
        databases.listDocuments(databaseId, offeringsCollectionId, [
          Query.greaterThanEqual('offering_date', startDate),
          Query.lessThanEqual('offering_date', endDate),
          Query.limit(5000),
        ]),
      ])

      const tithes = tithesResult.documents as Array<Record<string, unknown>>
      const offerings = offeringsResult.documents as Array<Record<string, unknown>>

      const totalTithes = tithes.reduce((acc, row) => acc + toNumber(row.amount), 0)

      const totalVotes = offerings
        .filter((row) => {
          const type = typeof row.offering_type === 'string' ? row.offering_type.trim().toLowerCase() : ''
          return type === 'voto' || type === 'votos'
        })
        .reduce((acc, row) => acc + toNumber(row.amount), 0)

      const totalOfferings = offerings
        .filter((row) => {
          const type = typeof row.offering_type === 'string' ? row.offering_type.trim().toLowerCase() : ''
          return type !== 'voto' && type !== 'votos'
        })
        .reduce((acc, row) => acc + toNumber(row.amount), 0)

      return {
        monthLabel,
        totals: {
          tithes: Number(totalTithes.toFixed(2)),
          offerings: Number(totalOfferings.toFixed(2)),
          votes: Number(totalVotes.toFixed(2)),
        },
      }
    } catch {
      return fallbackResult
    }
  },
)
