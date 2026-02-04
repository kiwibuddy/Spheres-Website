/**
 * Seed Supabase with spheres and devotions. Run after schema.sql.
 * Loads .env.local so NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are available.
 * Usage: node scripts/seed-supabase.mjs  (or: npm run seed)
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

// Load .env.local so seed works without exporting vars manually
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

const SPHERES = [
  { slug: 'foundational', name: 'Foundational', description: 'Biblical foundations for life and society', color_primary: '#323b43', order_index: 1 },
  { slug: 'family', name: 'Family', description: 'God and the sphere of family', color_primary: '#ff3a30', order_index: 2 },
  { slug: 'economics', name: 'Economics', description: 'Biblical wisdom for economics', color_primary: '#ff9600', order_index: 3 },
  { slug: 'government', name: 'Government', description: 'Government and authority under God', color_primary: '#ffcc01', order_index: 4 },
  { slug: 'religion', name: 'Religion', description: 'Faith and worship', color_primary: '#88c807', order_index: 5 },
  { slug: 'education', name: 'Education', description: 'Learning and teaching', color_primary: '#25b7d6', order_index: 6 },
  { slug: 'media', name: 'Media/Communication', description: 'Media and communication', color_primary: '#595ad3', order_index: 7 },
  { slug: 'celebration', name: 'Celebration', description: 'Celebration and the arts', color_primary: '#df57ad', order_index: 8 },
]

async function main() {
  const jsonPath = path.join(root, 'src', 'lib', 'devotions-static.json')
  const devotions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  console.log('Upserting spheres...')
  const { data: spheresRows, error: spheresError } = await supabase.from('spheres').upsert(SPHERES, { onConflict: 'slug' }).select('id, slug')
  if (spheresError) {
    console.error('Spheres error:', spheresError)
    process.exit(1)
  }
  const slugToId = Object.fromEntries((spheresRows || []).map((s) => [s.slug, s.id]))

  const devotionsForDb = devotions.map((d) => ({
    id: d.id,
    sphere_id: slugToId[d.slug],
    code: d.code,
    title: d.title,
    scripture_reference: d.scripture_reference,
    youtube_url: d.youtube_url || '',
    duration_seconds: d.duration_seconds ?? null,
    transcript: d.transcript ?? null,
    order_in_sphere: d.order_in_sphere,
    reflection_q1: d.reflection_q1 ?? null,
    reflection_q2: d.reflection_q2 ?? null,
    reflection_q3: d.reflection_q3 ?? null,
    reflection_q4: d.reflection_q4 ?? null,
    call_to_action: d.call_to_action ?? null,
  }))

  console.log('Upserting devotions...')
  const { error: devError } = await supabase.from('devotions').upsert(devotionsForDb, { onConflict: 'id' })
  if (devError) {
    console.error('Devotions error:', devError)
    process.exit(1)
  }
  console.log('Seeded', devotionsForDb.length, 'devotions.')
}

main()
