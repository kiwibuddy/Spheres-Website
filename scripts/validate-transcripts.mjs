/**
 * Validate extracted transcripts: exactly 52 per sphere, no category content, title/scripture match.
 * Run: node scripts/validate-transcripts.mjs
 * Reads: scripts/out/transcripts-by-passage.json, 00 416 Spheres of Society Key Passages.md
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const SPHERE_HEADINGS = [
  { heading: 'Foundational Passages', slug: 'foundational' },
  { heading: 'Family Sphere Key Passages', slug: 'family' },
  { heading: 'Economics Sphere Key Passages', slug: 'economics' },
  { heading: 'Government Sphere Key Passages', slug: 'government' },
  { heading: 'Religion Sphere Key Passages', slug: 'religion' },
  { heading: 'Education Sphere Key Passages', slug: 'education' },
  { heading: 'Media/Communication Sphere Key Passages', slug: 'media' },
  { heading: 'Celebration Sphere Key Passages', slug: 'celebration' },
]

function parseKeyPassagesMD(content) {
  const bySphere = {}
  let currentSlug = null
  const lines = content.split('\n')
  for (const line of lines) {
    const mainHeading = line.match(/^# (.+)$/)?.[1]?.trim()
    if (mainHeading) {
      const found = SPHERE_HEADINGS.find((s) => mainHeading.includes(s.heading.split(' ')[0]))
      if (found) currentSlug = found.slug
      continue
    }
    if (line.match(/^#### \*\*(.+)\*\*/)) continue
    if (!currentSlug) continue
    const tabIdx = line.indexOf('\t')
    if (tabIdx === -1) continue
    const left = line.slice(0, tabIdx).trim()
    const scriptureRef = line.slice(tabIdx + 1).trim()
    const numMatch = left.match(/^(\d+)\s+(.+)$/)
    if (numMatch) {
      const order = parseInt(numMatch[1], 10)
      const title = numMatch[2].trim()
      if (!bySphere[currentSlug]) bySphere[currentSlug] = {}
      bySphere[currentSlug][order] = { title, scripture_reference: scriptureRef }
    }
  }
  return bySphere
}

function getFirstLine(text) {
  return ((text || '').split('\n')[0] || '').trim().replace(/\s+/g, ' ')
}

function isCategoryContent(firstLine) {
  const lower = firstLine.toLowerCase()
  if (lower.includes('section introduction') || lower.includes('section intro')) return true
  if (lower.includes('god and the sphere of') && !/number\s+1\s*:/i.test(firstLine)) return true
  if (/\bintro\s*final\b/i.test(firstLine) || /#\s*00\s*intro/i.test(firstLine)) return true
  if (lower.includes('crossovers introduction')) return true
  return false
}

/** Normalize for fuzzy match: lowercase, collapse spaces, remove some punctuation */
function normalize(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim()
}

/** Check if transcript contains a reasonable match to the canonical title (or "Number N: Title"). */
function titleMatches(transcript, canonicalTitle) {
  const first200 = (transcript || '').slice(0, 400)
  const normTitle = normalize(canonicalTitle)
  const normFirst = normalize(first200)
  if (normTitle.length < 3) return true
  const titleWords = normTitle.split(/\s+/).filter((w) => w.length > 2)
  const matchCount = titleWords.filter((w) => normFirst.includes(w)).length
  return titleWords.length === 0 || matchCount >= Math.min(3, Math.ceil(titleWords.length * 0.6))
}

/** Extract book/chapter:verse from scripture ref for presence check. */
function scriptureSnippets(ref) {
  if (!ref || !ref.trim()) return []
  const r = ref.trim()
  const out = []
  const chapterVerse = r.match(/(\d+)\s*:\s*(\d+)/)
  if (chapterVerse) out.push(chapterVerse[1] + ':' + chapterVerse[2], chapterVerse[1] + ' ' + chapterVerse[2])
  const bookNum = r.match(/([1-3]?\s*[A-Za-z]+)\s+(\d+)/)
  if (bookNum) out.push(bookNum[2])
  out.push(r.slice(0, 25))
  return out.filter(Boolean)
}

function scripturePresent(transcript, scriptureRef) {
  if (!scriptureRef || !transcript) return false
  const snippets = scriptureSnippets(scriptureRef)
  const norm = transcript.toLowerCase().replace(/\s+/g, ' ')
  return snippets.some((s) => s.length >= 2 && norm.includes(s.toLowerCase()))
}

function main() {
  const transcriptPath = path.join(root, 'scripts', 'out', 'transcripts-by-passage.json')
  if (!fs.existsSync(transcriptPath)) {
    console.error('Run extract-transcripts-from-pdfs.mjs first. Missing:', transcriptPath)
    process.exit(1)
  }
  const transcriptMap = JSON.parse(fs.readFileSync(transcriptPath, 'utf-8'))
  const mdPath = path.join(root, '00 416 Spheres of Society Key Passages.md')
  const mdContent = fs.readFileSync(mdPath, 'utf-8')
  const canonical = parseKeyPassagesMD(mdContent)

  const report = { passed: 0, warned: 0, failed: 0, details: [] }
  const slugs = SPHERE_HEADINGS.map((s) => s.slug)

  for (const slug of slugs) {
    const entries = transcriptMap[slug]
    if (!entries || typeof entries !== 'object') {
      report.failed++
      report.details.push({ slug, order: null, status: 'fail', reason: 'missing sphere in transcript map' })
      continue
    }
    const orders = Object.keys(entries).map(Number).filter((n) => n >= 1 && n <= 52)
    if (orders.length !== 52) {
      report.failed++
      report.details.push({
        slug,
        order: null,
        status: 'fail',
        reason: `expected 52 segments, got ${orders.length}`,
      })
    }
    const canonSphere = canonical[slug] || {}
    for (let order = 1; order <= 52; order++) {
      const transcript = entries[order]
      const canon = canonSphere[order]
      const detail = { slug, order }
      if (!transcript) {
        report.warned++
        detail.status = 'warn'
        detail.reason = 'no transcript'
        report.details.push(detail)
        continue
      }
      const firstLine = getFirstLine(transcript)
      if (isCategoryContent(firstLine)) {
        report.failed++
        detail.status = 'fail'
        detail.reason = 'segment looks like category content'
        detail.firstLine = firstLine.slice(0, 80)
        report.details.push(detail)
        continue
      }
      if (!canon) {
        report.warned++
        detail.status = 'warn'
        detail.reason = 'no canonical title/scripture in MD'
        report.details.push(detail)
        continue
      }
      let ok = true
      if (!titleMatches(transcript, canon.title)) {
        detail.titleMatch = false
        ok = false
      }
      const scriptureOk = scripturePresent(transcript, canon.scripture_reference)
      if (!scriptureOk) detail.scriptureMatch = false
      if (ok && scriptureOk) {
        report.passed++
        detail.status = 'pass'
      } else if (ok && !scriptureOk) {
        report.warned++
        detail.status = 'warn'
        detail.reason = 'scripture not found in transcript'
      } else {
        report.failed++
        detail.status = 'fail'
        detail.reason = detail.titleMatch === false ? 'title not found' : 'unknown'
      }
      report.details.push(detail)
    }
  }

  console.log('Validation report:')
  console.log('  Passed:', report.passed)
  console.log('  Warned:', report.warned)
  console.log('  Failed:', report.failed)
  const outReportPath = path.join(root, 'scripts', 'out', 'validation-report.json')
  fs.mkdirSync(path.dirname(outReportPath), { recursive: true })
  fs.writeFileSync(outReportPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log('Wrote', outReportPath)
  if (report.failed > 0) {
    const fails = report.details.filter((d) => d.status === 'fail')
    console.log('Failures:', fails.slice(0, 10).map((f) => `${f.slug}#${f.order} ${f.reason || ''}`).join('; '))
    if (fails.length > 10) console.log('  ... and', fails.length - 10, 'more')
    process.exit(1)
  }
}

main()
