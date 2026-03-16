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

function ensureSaasOwner(currentUser: { prefs?: unknown }) {
  const role = getRole(currentUser)
  if (role !== 'dono_saas') {
    setResponseStatus(403)
    throw { message: 'Permissao negada: apenas dono SaaS pode executar esta acao', status: 403 }
  }
}

function resolveErrorPayload(error: unknown, fallbackMessage: string) {
  const maybeError = error as { message?: unknown; status?: unknown; code?: unknown }
  const status =
    typeof maybeError.status === 'number'
      ? maybeError.status
      : typeof maybeError.code === 'number'
        ? maybeError.code
        : 500

  const message = typeof maybeError.message === 'string' && maybeError.message.length > 0 ? maybeError.message : fallbackMessage

  return { status, message }
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
      const resolved = resolveErrorPayload(_error, 'Falha ao listar igrejas')
      setResponseStatus(resolved.status)
      throw { message: resolved.message, status: resolved.status }
    }
  },
)

type ChurchBillingStatus = 'ativa' | 'inadimplente' | 'pausada'

const churchActionSchema = z.object({
  churchName: z.string().min(2, 'Nome da igreja invalido'),
  reason: z.string().trim().max(140, 'Motivo muito longo').optional(),
})

export const listChurchesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Não autorizado', status: 401 }
    }

    ensureSaasOwner(currentUser)

    const usersClient = getUsers()

    try {
      const list = await usersClient.list({
        queries: [Query.limit(1000)],
      })

      const grouped = new Map<
        string,
        {
          churchName: string
          plan: 'inicial' | 'padrao' | 'premium'
          totalUsers: number
          activeUsers: number
          blockedUsers: number
          hasInadimplencia: boolean
          hasPauseFlag: boolean
        }
      >()

      const planRank = { inicial: 1, padrao: 2, premium: 3 } as const

      for (const user of list.users) {
        const prefs = (user.prefs as Record<string, unknown> | undefined) ?? {}
        const userRole = typeof prefs.role === 'string' ? prefs.role.trim().toLowerCase() : 'membro'

        if (isSaasOwnerRole(userRole)) {
          continue
        }

        const churchName = typeof prefs.churchName === 'string' ? prefs.churchName.trim() : ''
        if (!churchName) {
          continue
        }

        const churchKey = normalizeComparableText(churchName)
        if (!churchKey) {
          continue
        }

        const userPlan = normalizePlan(
          typeof prefs.churchPlan === 'string'
            ? prefs.churchPlan
            : typeof prefs.plan === 'string'
              ? prefs.plan
              : undefined,
        )

        const userStatus = user.status !== false
        const billingStatusRaw = normalizeComparableText(prefs.billingStatus)
        const churchStatusRaw = normalizeComparableText(prefs.churchStatus)

        const current = grouped.get(churchKey)

        if (!current) {
          grouped.set(churchKey, {
            churchName,
            plan: userPlan,
            totalUsers: 1,
            activeUsers: userStatus ? 1 : 0,
            blockedUsers: userStatus ? 0 : 1,
            hasInadimplencia: billingStatusRaw.includes('inadimpl'),
            hasPauseFlag: churchStatusRaw.includes('pausad'),
          })
          continue
        }

        current.totalUsers += 1
        if (userStatus) {
          current.activeUsers += 1
        } else {
          current.blockedUsers += 1
        }

        if (billingStatusRaw.includes('inadimpl')) {
          current.hasInadimplencia = true
        }

        if (churchStatusRaw.includes('pausad')) {
          current.hasPauseFlag = true
        }

        if (planRank[userPlan] > planRank[current.plan]) {
          current.plan = userPlan
        }
      }

      const churches = Array.from(grouped.values())
        .map((church) => {
          let status: ChurchBillingStatus = 'ativa'

          if (church.blockedUsers === church.totalUsers || church.hasPauseFlag) {
            status = 'pausada'
          } else if (church.hasInadimplencia) {
            status = 'inadimplente'
          }

          return {
            churchName: church.churchName,
            plan: church.plan,
            totalUsers: church.totalUsers,
            activeUsers: church.activeUsers,
            blockedUsers: church.blockedUsers,
            status,
          }
        })
        .sort((a, b) => a.churchName.localeCompare(b.churchName, 'pt-BR'))

      return {
        churches,
        total: churches.length,
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code ?? 500)
      throw { message: error.message, status: error.code }
    }
  },
)

export const pauseChurchFn = createServerFn({ method: 'POST' })
  .inputValidator(churchActionSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Não autorizado', status: 401 }
    }

    ensureSaasOwner(currentUser)

    const usersClient = getUsers()
    const targetChurch = normalizeComparableText(data.churchName)

    try {
      const list = await usersClient.list({
        queries: [Query.limit(1000)],
      })

      const usersFromChurch = list.users.filter((u) => {
        const prefs = (u.prefs as Record<string, unknown> | undefined) ?? {}
        const userRole = typeof prefs.role === 'string' ? prefs.role.trim().toLowerCase() : 'membro'
        if (isSaasOwnerRole(userRole)) {
          return false
        }

        const churchName = normalizeComparableText(prefs.churchName)
        return Boolean(churchName) && churchName === targetChurch
      })

      if (usersFromChurch.length === 0) {
        setResponseStatus(404)
        throw { message: 'Igreja nao encontrada para pausa', status: 404 }
      }

      for (const user of usersFromChurch) {
        const currentPrefs = (user.prefs as Record<string, unknown> | undefined) ?? {}

        await usersClient.updateStatus(user.$id, false)
        await usersClient.updatePrefs(user.$id, {
          ...currentPrefs,
          churchStatus: 'pausada',
          billingStatus: 'inadimplente',
          billingNote: data.reason ?? 'Igreja pausada por inadimplencia',
          billingUpdatedAt: new Date().toISOString(),
        })
      }

      return {
        success: true,
        churchName: data.churchName,
        affectedUsers: usersFromChurch.length,
      }
    } catch (_error) {
      const resolved = resolveErrorPayload(_error, 'Falha ao pausar igreja')
      setResponseStatus(resolved.status)
      throw { message: resolved.message, status: resolved.status }
    }
  })

export const deleteChurchFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ churchName: z.string().min(2, 'Nome da igreja invalido') }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Não autorizado', status: 401 }
    }

    ensureSaasOwner(currentUser)

    const usersClient = getUsers()
    const targetChurch = normalizeComparableText(data.churchName)

    try {
      const list = await usersClient.list({
        queries: [Query.limit(1000)],
      })

      const usersFromChurch = list.users.filter((u) => {
        const prefs = (u.prefs as Record<string, unknown> | undefined) ?? {}
        const userRole = typeof prefs.role === 'string' ? prefs.role.trim().toLowerCase() : 'membro'
        if (isSaasOwnerRole(userRole)) {
          return false
        }

        const churchName = normalizeComparableText(prefs.churchName)
        return Boolean(churchName) && churchName === targetChurch
      })

      if (usersFromChurch.length === 0) {
        setResponseStatus(404)
        throw { message: 'Igreja nao encontrada para exclusao', status: 404 }
      }

      for (const user of usersFromChurch) {
        await usersClient.delete(user.$id)
      }

      return {
        success: true,
        churchName: data.churchName,
        deletedUsers: usersFromChurch.length,
      }
    } catch (_error) {
      const resolved = resolveErrorPayload(_error, 'Falha ao excluir igreja')
      setResponseStatus(resolved.status)
      throw { message: resolved.message, status: resolved.status }
    }
  })

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
