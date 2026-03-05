/**
 * Apply pgvector migrations (003 + 004) using a direct Postgres connection.
 * Requires SUPABASE_DB_URL in .env.local (from Supabase Dashboard → Settings → Database → Connection string).
 * Usage: node scripts/run-pgvector-migration.mjs  (or: npm run db:migrate-pgvector)
 */
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnv() {
  const envPath = path.join(root, '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = value
      }
    }
  }
}

loadEnv()

const dbUrl = process.env.SUPABASE_DB_URL
if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL in .env.local')
  console.error('Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)')
  process.exit(1)
}

const migration003 = fs.readFileSync(path.join(root, 'supabase', 'migrations', '003_pgvector_embeddings.sql'), 'utf-8')
const migration004 = fs.readFileSync(path.join(root, 'supabase', 'migrations', '004_embeddings_index.sql'), 'utf-8')

// Run one SQL statement; ignore "already exists" errors.
const runOne = async (client, sql, label) => {
  try {
    await client.query(sql)
    console.log('  OK:', label)
  } catch (e) {
    if (e.message && (e.message.includes('already exists') || e.message.includes('duplicate key'))) {
      console.log('  (already exists):', label)
    } else {
      throw e
    }
  }
}

async function main() {
  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    console.log('Applying 003_pgvector_embeddings.sql...')
    await runOne(client, 'create extension if not exists vector;', 'vector extension')
    await runOne(
      client,
      'alter table public.devotions add column if not exists search_embedding vector(1536);',
      'search_embedding column'
    )
    // Function: from "create or replace" to "$$;"
    const functionMatch = migration003.match(/create or replace function public\.match_devotions[\s\S]*?\$\$;/)
    if (functionMatch) {
      await runOne(client, functionMatch[0], 'match_devotions function')
    }

    console.log('Applying 004_embeddings_index.sql...')
    await runOne(client, migration004.trim(), 'HNSW index')

    console.log('Done. Run: npm run backfill-embeddings')
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
