/**
 * Generates src/lib/devotions-static.json from Key Passages MD + SphereView CSV.
 * Run: node scripts/generate-devotions.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const SPHERE_HEADINGS = [
  { heading: 'Foundational Passages', slug: 'foundational', csvCode: 'FOU' },
  { heading: 'Family Sphere Key Passages', slug: 'family', csvCode: 'FAM' },
  { heading: 'Economics Sphere Key Passages', slug: 'economics', csvCode: 'ECO' },
  { heading: 'Government Sphere Key Passages', slug: 'government', csvCode: 'GOV' },
  { heading: 'Religion Sphere Key Passages', slug: 'religion', csvCode: 'REL' },
  { heading: 'Education Sphere Key Passages', slug: 'education', csvCode: 'EDU' },
  { heading: 'Media/Communication Sphere Key Passages', slug: 'media', csvCode: 'COM' },
  { heading: 'Celebration Sphere Key Passages', slug: 'celebration', csvCode: 'CEL' },
]

function parseKeyPassagesMD(content) {
  const bySphere = {}
  let currentSlug = null
  let currentCategory = null
  const lines = content.split('\n')
  for (const line of lines) {
    const mainHeading = line.match(/^# (.+)$/)?.[1]?.trim()
    if (mainHeading) {
      const found = SPHERE_HEADINGS.find((s) => mainHeading.includes(s.heading.split(' ')[0]))
      if (found) {
        currentSlug = found.slug
        currentCategory = null
      }
      continue
    }
    const categoryHeading = line.match(/^#### \*\*(.+)\*\*/)?.[1]?.trim()
    if (categoryHeading) {
      currentCategory = categoryHeading
      continue
    }
    if (!currentSlug) continue
    const tabIdx = line.indexOf('\t')
    if (tabIdx === -1) continue
    const left = line.slice(0, tabIdx).trim()
    const scriptureRef = line.slice(tabIdx + 1).trim()
    const numMatch = left.match(/^(\d+)\s+(.+)$/)
    if (numMatch) {
      const order = parseInt(numMatch[1], 10)
      const title = numMatch[2].trim()
      if (!bySphere[currentSlug]) bySphere[currentSlug] = []
      bySphere[currentSlug].push({
        order,
        title,
        scripture_reference: scriptureRef,
        category_title: currentCategory || null,
      })
    }
  }
  return bySphere
}

function parseCSV(content) {
  const rows = parse(content, { columns: true, relax_column_count: true, skip_empty_lines: true })
  const byKey = {}
  for (const row of rows) {
    const sphere = (row.Sphere || '').trim()
    const id = (row.ID || '').trim()
    if (!sphere || !id || id.includes('CAT')) continue
    const match = id.match(/^[A-Z]+-(\d+)$/)
    const order = match ? parseInt(match[1], 10) : null
    if (order == null) continue
    const key = `${sphere}-${order}`
    byKey[key] = {
      youtube_url: (row.YouTubeURL || '').trim(),
      transcript: (row.transcript || '').trim() || null,
      q1: (row.Q1 || '').trim() || null,
      q2: (row.Q2 || '').trim() || null,
      q3: (row.Q3 || '').trim() || null,
      q4: (row.Q4 || '').trim() || null,
      call_to_action: (row.CallToAction || '').trim() || null,
    }
  }
  return byKey
}

const slugToCsvCode = Object.fromEntries(SPHERE_HEADINGS.map((s) => [s.slug, s.csvCode]))

function main() {
  const mdPath = path.join(root, '00 416 Spheres of Society Key Passages.md')
  const csvPath = path.join(root, 'SphereView Videos - ENG.csv')
  const mdContent = fs.readFileSync(mdPath, 'utf-8')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  const passagesBySphere = parseKeyPassagesMD(mdContent)
  const videoByKey = parseCSV(csvContent)

  const spheres = [
    { id: 1, slug: 'foundational' },
    { id: 2, slug: 'family' },
    { id: 3, slug: 'economics' },
    { id: 4, slug: 'government' },
    { id: 5, slug: 'religion' },
    { id: 6, slug: 'education' },
    { id: 7, slug: 'media' },
    { id: 8, slug: 'celebration' },
  ]

  const devotions = []
  let globalId = 1
  for (const sphere of spheres) {
    const passages = passagesBySphere[sphere.slug] || []
    const code = slugToCsvCode[sphere.slug]
    for (let i = 0; i < 52; i++) {
      const p = passages[i] || { order: i + 1, title: `Devotion ${i + 1}`, scripture_reference: '', category_title: null }
      const vidKey = `${code}-${p.order}`
      const vid = videoByKey[vidKey] || {}
      devotions.push({
        id: globalId++,
        sphere_id: sphere.id,
        slug: sphere.slug,
        code: `${code}-${String(p.order).padStart(2, '0')}`,
        order_in_sphere: p.order,
        title: p.title,
        scripture_reference: p.scripture_reference,
        category_title: p.category_title ?? null,
        youtube_url: vid.youtube_url || '',
        transcript: vid.transcript,
        reflection_q1: vid.q1,
        reflection_q2: vid.q2,
        reflection_q3: vid.q3,
        reflection_q4: vid.q4,
        call_to_action: vid.call_to_action,
      })
    }
  }

  const outPath = path.join(root, 'src', 'lib', 'devotions-static.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(devotions, null, 2), 'utf-8')
  console.log(`Wrote ${devotions.length} devotions to ${outPath}`)
}

main()
