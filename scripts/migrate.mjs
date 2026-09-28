import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import pg from 'pg'

function readEnvValue(contents, name) {
  const line = contents.split(/\r?\n/).find((entry) => entry.trim().startsWith(`${name}=`))
  if (!line) return undefined
  const value = line.slice(line.indexOf('=') + 1).trim()
  return value.replace(/^(["'])(.*)\1$/, '$2')
}

let connectionString = process.env.DATABASE_URL
if (!connectionString) {
  try {
    const envFile = await readFile(resolve(process.cwd(), '.env.local'), 'utf8')
    connectionString = readEnvValue(envFile, 'DATABASE_URL')
  } catch {
    // .env.local is optional when DATABASE_URL is set in the process environment.
  }
}

if (!connectionString) {
  console.error('Set DATABASE_URL or add it to .env.local before running migrations.')
  process.exit(1)
}

const migration = await readFile(resolve(process.cwd(), 'backend/lib/db/migrations/0001_initial.sql'), 'utf8')
const client = new pg.Client({ connectionString })

try {
  await client.connect()
  await client.query('BEGIN')
  await client.query(migration)
  await client.query('COMMIT')
  console.log('Database tables are ready.')
} catch (error) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('Database migration failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
