/**
 * Backfill search_embedding for all devotions using OpenAI text-embedding-3-small.
 * Run after migration 003_pgvector_embeddings.sql. Requires OPENAI_API_KEY and Supabase env.
 * Usage: node scripts/backfill-embeddings.mjs  (or: npm run backfill-embeddings)
 */
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const BATCH_SIZE = 50
const MAX_CHARS = 30000

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

const openaiKey = process.env.OPENAI_API_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!openaiKey || !supabaseUrl || !serviceKey) {
  console.error('Set OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: openaiKey })
const supabase = createClient(supabaseUrl, serviceKey)

function buildText(d) {
  const transcript = (d.transcript || '').trim()
  let text = `${(d.title || '').trim()}`
  if (transcript) text += ` ${transcript}`
  if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS)
  return text.trim() || d.title || ''
}

async function main() {
  const jsonPath = path.join(root, 'src', 'lib', 'devotions-static.json')
  const devotions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  const toEmbed = devotions.filter((d) => buildText(d).length > 0)
  console.log(`Backfilling embeddings for ${toEmbed.length} devotions (batch size ${BATCH_SIZE})...`)

  let done = 0
  for (let i = 0; i < toEmbed.length; i += BATCH_SIZE) {
    const batch = toEmbed.slice(i, i + BATCH_SIZE)
    const texts = batch.map((d) => buildText(d))
    const embedResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })
    const raw = embedResponse.data ?? embedResponse
    const dataArray = Array.isArray(raw) ? raw : (raw && raw.data && Array.isArray(raw.data)) ? raw.data : []
    if (dataArray.length === 0) {
      console.error('OpenAI embedding: no data in response', JSON.stringify(embedResponse).slice(0, 200))
      throw new Error('No embeddings returned')
    }
    const byIndex = new Map(dataArray.map((e) => [e.index, e.embedding]))
    for (let j = 0; j < batch.length; j++) {
      const d = batch[j]
      const embedding = byIndex.get(j)
      if (!embedding) continue
      const { error: updateError } = await supabase
        .from('devotions')
        .update({ search_embedding: embedding })
        .eq('id', d.id)
      if (updateError) {
        console.error(`Failed to update devotion ${d.id}:`, updateError.message)
      } else {
        done++
      }
    }
    console.log(`  ${done} / ${toEmbed.length}`)
  }
  console.log(`Done. Updated ${done} devotions with embeddings.`)
  console.log('Run migration 004_embeddings_index.sql to add the HNSW index for faster search.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
