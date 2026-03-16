import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAdminClient } from '../lib/appwrite'
import { ID, AppwriteException, Query, Users } from 'node-appwrite'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'

function getUsers() {
  const adminClient = createAdminClient()
  return new Users(adminClient.client)
}

function getRole(currentUser: { prefs?: unknown }) {
  const prefs = (currentUser.prefs as Record<string, unknown> | undefined) ?? {}
  return typeof prefs.role === 'string' ? prefs.role.trim().toLowerCase() : 'membro'
}

function normalizeComparableText(value?: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function isSaasOwnerRole(role?: unknown) {
  return typeof role === 'string' && role.trim().toLowerCase() === 'dono_saas'
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
    const currentRole = getRole(currentUser)

    if (currentRole !== 'dono_saas' && data.role === 'administrador') {
      setResponseStatus(403)
      throw {
        message: 'Somente o dono SaaS pode criar outro administrador',
        status: 403,
      }
    }

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
    const currentRole = getRole(currentUser)
    const currentChurch = normalizeComparableText(getChurchName(currentUser))

    const usersClient = getUsers()

    try {
      const list = await usersClient.list({
        queries: [Query.limit(200)],
      })

      const filteredUsers = list.users.filter((u) => {
        const prefs = (u.prefs as Record<string, unknown> | undefined) ?? {}
        const userRole = typeof prefs.role === 'string' ? prefs.role.trim().toLowerCase() : 'membro'

        if (currentRole !== 'dono_saas') {
          if (userRole === 'dono_saas') {
            return false
          }

          const userChurch = normalizeComparableText(prefs.churchName)
          if (!userChurch || userChurch !== currentChurch) {
            return false
          }
        }

        return true
      })

      return {
        users: filteredUsers.map((u) => ({
          id: u.$id,
          name: u.name,
          email: u.email,
          role: (u.prefs as Record<string, string>).role ?? 'membro',
          plan: normalizePlan((u.prefs as Record<string, string>).churchPlan ?? (u.prefs as Record<string, string>).plan),
          createdAt: u.$createdAt,
          status: u.status,
        })),
        total: filteredUsers.length,
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
    const currentRole = getRole(currentUser)
    const currentChurch = normalizeComparableText(getChurchName(currentUser))

    if (data.userId === currentUser.$id) {
      setResponseStatus(400)
      throw { message: 'Você não pode excluir sua própria conta', status: 400 }
    }

    const usersClient = getUsers()

    try {
      if (currentRole !== 'dono_saas') {
        const targetUser = await usersClient.get(data.userId)
        const targetPrefs = (targetUser.prefs as Record<string, unknown> | undefined) ?? {}
        const targetRole = typeof targetPrefs.role === 'string' ? targetPrefs.role.trim().toLowerCase() : 'membro'
        const targetChurch = normalizeComparableText(targetPrefs.churchName)

        if (isSaasOwnerRole(targetRole)) {
          setResponseStatus(403)
          throw { message: 'Não é permitido remover o dono SaaS', status: 403 }
        }

        if (!targetChurch || targetChurch !== currentChurch) {
          setResponseStatus(403)
          throw { message: 'Você só pode remover usuários da sua igreja', status: 403 }
        }
      }

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
    const currentRole = getRole(currentUser)
    const currentChurchPlan = getChurchPlan(currentUser)
    const currentChurchName = getChurchName(currentUser)

    const usersClient = getUsers()

    const churchSlug = normalizeComparableText(currentChurchName)
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '')

    const churchDomain = churchSlug ? `${churchSlug}.com` : 'igreja.com'

    const defaultUsers = [
      {
        name: 'Tesoureiro',
        email: `tesoureiro@${churchDomain}`,
        password: 'Tesoureiro@1234',
        role: 'tesoureiro',
        churchPlan: currentChurchPlan,
        churchName: currentChurchName,
      },
      {
        name: 'Pastor',
        email: `pastor@${churchDomain}`,
        password: 'Pastor@1234',
        role: 'pastor',
        churchPlan: currentChurchPlan,
        churchName: currentChurchName,
      },
      {
        name: 'Membro',
        email: `membro@${churchDomain}`,
        password: 'Membro@1234',
        role: 'membro',
        churchPlan: currentChurchPlan,
        churchName: currentChurchName,
      },
    ] as const

    if (currentRole === 'dono_saas') {
      defaultUsers.unshift({
        name: 'Administrador',
        email: `admin@${churchDomain}`,
        password: 'Admin@1234',
        role: 'administrador',
        churchPlan: currentChurchPlan,
        churchName: currentChurchName,
      })
    }

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
