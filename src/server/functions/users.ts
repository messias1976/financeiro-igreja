import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAdminClient } from '../lib/appwrite'
import { ID, AppwriteException, Users } from 'node-appwrite'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'

function getUsers() {
  const adminClient = createAdminClient()
  return new Users(adminClient.client)
}

function getRole(currentUser: { prefs?: unknown }) {
  const prefs = (currentUser.prefs as Record<string, unknown> | undefined) ?? {}
  return typeof prefs.role === 'string' ? prefs.role : 'membro'
}

function normalizePlan(plan?: string) {
  if (plan === 'inicial') return 'inicial'
  if (plan === 'padrao' || plan === 'paroquia') return 'padrao'
  if (plan === 'premium' || plan === 'diocese') return 'premium'
  return 'inicial'
}

function getChurchPlan(currentUser: { prefs?: unknown }) {
  const prefs = (currentUser.prefs as Record<string, unknown> | undefined) ?? {}
  const planCandidate =
    typeof prefs.churchPlan === 'string'
      ? prefs.churchPlan
      : typeof prefs.plan === 'string'
        ? prefs.plan
        : undefined
  const plan = typeof planCandidate === 'string' ? planCandidate : undefined
  return normalizePlan(plan)
}

function getChurchName(currentUser: { prefs?: unknown }) {
  const prefs = (currentUser.prefs as Record<string, unknown> | undefined) ?? {}
  return typeof prefs.churchName === 'string' ? prefs.churchName : 'Igreja local'
}

function ensureAdmin(currentUser: { prefs?: unknown }) {
  const role = getRole(currentUser)
  if (role !== 'administrador' && role !== 'dono_saas') {
    setResponseStatus(403)
    throw { message: 'Permissao negada para este perfil', status: 403 }
  }
}

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  role: z.enum(['administrador', 'tesoureiro', 'pastor', 'membro']),
})

export const createUserFn = createServerFn({ method: 'POST' })
  .inputValidator(createUserSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Não autorizado', status: 401 }
    }
    ensureAdmin(currentUser)
    const adminChurchPlan = getChurchPlan(currentUser)
    const adminChurchName = getChurchName(currentUser)

    const usersClient = getUsers()

    try {
      const user = await usersClient.create(
        ID.unique(),
        data.email,
        undefined,
        data.password,
        data.name,
      )

      await usersClient.updatePrefs(user.$id, {
        role: data.role,
        churchPlan: adminChurchPlan,
        plan: adminChurchPlan,
        churchName: adminChurchName,
      })

      return {
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          role: data.role,
          plan: adminChurchPlan,
          createdAt: user.$createdAt,
        },
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code }
    }
  })

export const listUsersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Não autorizado', status: 401 }
    }
    ensureAdmin(currentUser)

    const usersClient = getUsers()

    try {
      const list = await usersClient.list()
      return {
        users: list.users.map((u) => ({
          id: u.$id,
          name: u.name,
          email: u.email,
          role: (u.prefs as Record<string, string>).role ?? 'membro',
          plan: normalizePlan((u.prefs as Record<string, string>).churchPlan ?? (u.prefs as Record<string, string>).plan),
          createdAt: u.$createdAt,
          status: u.status,
        })),
        total: list.total,
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code }
    }
  },
)

export const deleteUserFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Não autorizado', status: 401 }
    }
    ensureAdmin(currentUser)
    if (data.userId === currentUser.$id) {
      setResponseStatus(400)
      throw { message: 'Você não pode excluir sua própria conta', status: 400 }
    }

    const usersClient = getUsers()

    try {
      await usersClient.delete(data.userId)
      return { success: true }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code }
    }
  })

export const seedDefaultUsersFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Não autorizado', status: 401 }
    }
    ensureAdmin(currentUser)

    const usersClient = getUsers()

    const defaultUsers = [
      {
        name: 'Administrador',
        email: 'admin@igreja.com',
        password: 'Admin@1234',
        role: 'administrador',
        churchPlan: 'padrao',
        churchName: 'Igreja de teste: igreja-seed',
      },
      {
        name: 'Tesoureiro',
        email: 'tesoureiro@igreja.com',
        password: 'Tesoureiro@1234',
        role: 'tesoureiro',
        churchPlan: 'padrao',
        churchName: 'Igreja de teste: igreja-seed',
      },
      {
        name: 'Pastor',
        email: 'pastor@igreja.com',
        password: 'Pastor@1234',
        role: 'pastor',
        churchPlan: 'padrao',
        churchName: 'Igreja de teste: igreja-seed',
      },
      {
        name: 'Membro',
        email: 'membro@igreja.com',
        password: 'Membro@1234',
        role: 'membro',
        churchPlan: 'padrao',
        churchName: 'Igreja de teste: igreja-seed',
      },
      {
        name: 'Administrador Inicial',
        email: 'admin.inicial@igreja.com',
        password: 'Inicial@1234',
        role: 'administrador',
        churchPlan: 'inicial',
        churchName: 'Igreja Inicial',
      },
      {
        name: 'Tesoureiro Inicial',
        email: 'tesoureiro.inicial@igreja.com',
        password: 'Inicial@1234',
        role: 'tesoureiro',
        churchPlan: 'inicial',
        churchName: 'Igreja Inicial',
      },
      {
        name: 'Pastor Inicial',
        email: 'pastor.inicial@igreja.com',
        password: 'Inicial@1234',
        role: 'pastor',
        churchPlan: 'inicial',
        churchName: 'Igreja Inicial',
      },
      {
        name: 'Administrador Padrao',
        email: 'admin.padrao@igreja.com',
        password: 'Padrao@1234',
        role: 'administrador',
        churchPlan: 'padrao',
        churchName: 'Igreja Padrao',
      },
      {
        name: 'Tesoureiro Padrao',
        email: 'tesoureiro.padrao@igreja.com',
        password: 'Padrao@1234',
        role: 'tesoureiro',
        churchPlan: 'padrao',
        churchName: 'Igreja Padrao',
      },
      {
        name: 'Pastor Padrao',
        email: 'pastor.padrao@igreja.com',
        password: 'Padrao@1234',
        role: 'pastor',
        churchPlan: 'padrao',
        churchName: 'Igreja Padrao',
      },
    ]

    const results: Array<{
      name: string
      email: string
      role: string
      plan: string
      status: string
      error?: string
    }> = []

    for (const u of defaultUsers) {
      try {
        const existingList = await usersClient.list()
        const existing = existingList.users.find((x) => x.email === u.email)
        if (existing) {
          await usersClient.updatePassword({
            userId: existing.$id,
            password: u.password,
          })
          await usersClient.updatePrefs(existing.$id, {
            ...(existing.prefs as Record<string, string>),
            role: u.role,
            churchPlan: normalizePlan(u.churchPlan),
            plan: normalizePlan(u.churchPlan),
            churchName: u.churchName,
          })
          results.push({
            name: u.name,
            email: u.email,
            role: u.role,
            plan: normalizePlan(u.churchPlan),
            status: 'já existe',
          })
          continue
        }
        const created = await usersClient.create(
          ID.unique(),
          u.email,
          undefined,
          u.password,
          u.name,
        )
        await usersClient.updatePrefs(created.$id, {
          role: u.role,
          churchPlan: normalizePlan(u.churchPlan),
          plan: normalizePlan(u.churchPlan),
          churchName: u.churchName,
        })
        results.push({
          name: u.name,
          email: u.email,
          role: u.role,
          plan: normalizePlan(u.churchPlan),
          status: 'criado',
        })
      } catch (err) {
        const e = err as AppwriteException
        results.push({
          name: u.name,
          email: u.email,
          role: u.role,
          plan: normalizePlan(u.churchPlan),
          status: 'erro',
          error: e.message,
        })
      }
    }

    return { results }
  },
)
