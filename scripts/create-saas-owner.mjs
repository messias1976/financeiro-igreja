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

  const email = 'dono@financialchurch.com'
  const password = 'DonoSaas@1234'
  const name = 'Dono SaaS'

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

  const users = new Users(client)

  const listed = await users.list({
    queries: [Query.equal('email', [email]), Query.limit(1)],
    total: false,
  })

  let user = listed.users?.[0]
  let created = false

  if (!user) {
    user = await users.create({
      userId: ID.unique(),
      email,
      password,
      name,
    })
    created = true
  }

  await users.updatePrefs({
    userId: user.$id,
    prefs: {
      role: 'dono_saas',
      churchPlan: 'premium',
      plan: 'premium',
      churchName: 'Painel SaaS financialChurch',
    },
  })

  console.log(
    JSON.stringify(
      {
        ok: true,
        created,
        email,
        password,
        userId: user.$id,
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
