import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Client, Users, ID, Query } from 'node-appwrite'

function loadEnvFromDotFile() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    return
  }

  const content = readFileSync(envPath, 'utf-8')
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['\"]|['\"]$/g, '')

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

const DEFAULT_USERS = [
  {
    name: 'Administrador',
    email: 'admin@igreja.com',
    password: 'Admin@1234',
    prefs: {
      role: 'administrador',
      churchPlan: 'padrao',
      plan: 'padrao',
      churchName: 'Igreja de teste: igreja-seed',
    },
  },
  {
    name: 'Tesoureiro',
    email: 'tesoureiro@igreja.com',
    password: 'Tesoureiro@1234',
    prefs: {
      role: 'tesoureiro',
      churchPlan: 'padrao',
      plan: 'padrao',
      churchName: 'Igreja de teste: igreja-seed',
    },
  },
  {
    name: 'Pastor',
    email: 'pastor@igreja.com',
    password: 'Pastor@1234',
    prefs: {
      role: 'pastor',
      churchPlan: 'padrao',
      plan: 'padrao',
      churchName: 'Igreja de teste: igreja-seed',
    },
  },
  {
    name: 'Membro',
    email: 'membro@igreja.com',
    password: 'Membro@1234',
    prefs: {
      role: 'membro',
      churchPlan: 'padrao',
      plan: 'padrao',
      churchName: 'Igreja de teste: igreja-seed',
    },
  },
]

async function upsertSeedUser(users, seedUser) {
  const listed = await users.list({
    queries: [Query.equal('email', [seedUser.email]), Query.limit(1)],
    total: false,
  })

  const existing = listed.users?.[0]
  if (!existing) {
    const created = await users.create({
      userId: ID.unique(),
      email: seedUser.email,
      password: seedUser.password,
      name: seedUser.name,
    })

    await users.updatePrefs({
      userId: created.$id,
      prefs: seedUser.prefs,
    })

    return {
      email: seedUser.email,
      status: 'criado',
      userId: created.$id,
    }
  }

  await users.updatePassword({
    userId: existing.$id,
    password: seedUser.password,
  })

  await users.updateName({
    userId: existing.$id,
    name: seedUser.name,
  })

  await users.updatePrefs({
    userId: existing.$id,
    prefs: {
      ...((existing.prefs || {}) ?? {}),
      ...seedUser.prefs,
    },
  })

  return {
    email: seedUser.email,
    status: 'atualizado',
    userId: existing.$id,
  }
}

async function main() {
  loadEnvFromDotFile()

  const requiredEnv = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY']
  const missing = requiredEnv.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          reason: 'missing_env',
          missing,
        },
        null,
        2,
      ),
    )
    process.exit(1)
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

  const users = new Users(client)

  const results = []
  for (const seedUser of DEFAULT_USERS) {
    try {
      const result = await upsertSeedUser(users, seedUser)
      results.push({ ok: true, ...result })
    } catch (error) {
      results.push({
        ok: false,
        email: seedUser.email,
        status: 'erro',
        message:
          typeof error === 'object' && error && 'message' in error
            ? String(error.message)
            : String(error),
      })
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        results,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        reason: 'exception',
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  )
  process.exit(1)
})
