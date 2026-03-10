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

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  role: z.enum(['administrador', 'tesoureiro', 'pastor']),
})

export const createUserFn = createServerFn({ method: 'POST' })
  .inputValidator(createUserSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Não autorizado', status: 401 }
    }

    const usersClient = getUsers()

    try {
      const user = await usersClient.create(
        ID.unique(),
        data.email,
        undefined,
        data.password,
        data.name,
      )

      await usersClient.updatePrefs(user.$id, { role: data.role })

      return {
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          role: data.role,
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

    const usersClient = getUsers()

    try {
      const list = await usersClient.list()
      return {
        users: list.users.map((u) => ({
          id: u.$id,
          name: u.name,
          email: u.email,
          role: (u.prefs as Record<string, string>).role ?? 'membro',
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
    const usersClient = getUsers()

    const defaultUsers = [
      {
        name: 'Administrador',
        email: 'admin@igreja.com',
        password: 'Admin@1234',
        role: 'administrador',
      },
      {
        name: 'Tesoureiro',
        email: 'tesoureiro@igreja.com',
        password: 'Tesoureiro@1234',
        role: 'tesoureiro',
      },
      {
        name: 'Pastor',
        email: 'pastor@igreja.com',
        password: 'Pastor@1234',
        role: 'pastor',
      },
    ]

    const results: Array<{
      name: string
      email: string
      role: string
      status: string
      error?: string
    }> = []

    for (const u of defaultUsers) {
      try {
        const existingList = await usersClient.list()
        const existing = existingList.users.find((x) => x.email === u.email)
        if (existing) {
          results.push({
            name: u.name,
            email: u.email,
            role: u.role,
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
        await usersClient.updatePrefs(created.$id, { role: u.role })
        results.push({
          name: u.name,
          email: u.email,
          role: u.role,
          status: 'criado',
        })
      } catch (err) {
        const e = err as AppwriteException
        results.push({
          name: u.name,
          email: u.email,
          role: u.role,
          status: 'erro',
          error: e.message,
        })
      }
    }

    return { results }
  },
)
