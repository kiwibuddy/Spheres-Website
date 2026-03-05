/**
 * Extract key-passage transcripts from the 8 sphere PDFs.
 * Excludes category/section intro content. Outputs exactly 52 passages per sphere.
 * Run: node scripts/extract-transcripts-from-pdfs.mjs
 * Requires: npm install (pdf-parse is a devDependency).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const PDF_MAP = [
  { file: 'Foundation 52 FINAL.pdf', slug: 'foundational' },
  { file: 'Family 52 FINAL.pdf', slug: 'family' },
  { file: 'Economics 52 Final.pdf', slug: 'economics' },
  { file: 'Government 52 FINAL.pdf', slug: 'government' },
  { file: 'Religion 52 FINAL.pdf', slug: 'religion' },
  { file: 'Education 52 FINAL.pdf', slug: 'education' },
  { file: 'Communications 52 FINAL.pdf', slug: 'media' },
  { file: 'Celebration 52 FINAL.pdf', slug: 'celebration' },
]

/** First line of a segment (up to first newline). Normalized for comparison. */
function getFirstLine(segment) {
  const line = (segment || '').split('\n')[0] || ''
  return line.trim().replace(/\s+/g, ' ')
}

/** Check if segment looks like category/section intro content and should be excluded. */
function isCategoryContent(firstLine) {
  const lower = firstLine.toLowerCase()
  if (lower.includes('section introduction') || lower.includes('section intro')) return true
  if (lower.includes('god and the sphere of') && !/number\s+1\s*:/i.test(firstLine)) return true
  if (/\bintro\s*final\b/i.test(firstLine) || /#\s*00\s*intro/i.test(firstLine)) return true
  if (lower.includes('crossovers introduction') || (lower.includes('crossover') && lower.includes('introduction'))) return true
  if (lower.startsWith('crossover passages') && firstLine.length < 50) return true
  return false
}

/** Split PDF text into segments by "Number N:" (N 1-52). Uses fallback "N. " / "N) " to fill gaps. */
function splitIntoNumberedSegments(text, slug) {
  const primary = splitByPattern(text, /\bNumber\s+(\d+)\s*:\s*/gi)
  const byOrder = Object.fromEntries(primary.map((s) => [s.order, s.text]))
  const missing = [...Array.from({ length: 52 }, (_, i) => i + 1)].filter((n) => !byOrder[n])
  if (missing.length === 0) return primary
  const fallback = splitByPattern(text, /(?:^|\n)\s*(\d+)\s*[.:)]\s+/g)
  for (const { order, text: t } of fallback) {
    if (byOrder[order] === undefined && order >= 1 && order <= 52) {
      byOrder[order] = t
    }
  }
  return [...Array.from({ length: 52 }, (_, i) => i + 1)]
    .filter((n) => byOrder[n])
    .map((order) => ({ order, text: byOrder[order] }))
}

function splitByPattern(text, re) {
  const segments = []
  const matches = []
  let match
  while ((match = re.exec(text)) !== null) {
    matches.push({ num: parseInt(match[1], 10), index: match.index, fullMatch: match[0] })
  }
  for (let i = 0; i < matches.length; i++) {
    const num = matches[i].num
    const start = matches[i].index + matches[i].fullMatch.length
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length
    const segmentText = text.slice(start, end).trim()
    if (num >= 1 && num <= 52 && segmentText.length > 20) {
      segments.push({ order: num, text: segmentText })
    }
  }
  return segments
}

async function extractPdfText(pdfPath) {
  const pdfParse = require('pdf-parse')
  const buffer = fs.readFileSync(pdfPath)
  const data = await pdfParse(buffer)
  return (data && data.text) ? data.text : ''
}

function main() {
  const outDir = path.join(root, 'scripts', 'out')
  fs.mkdirSync(outDir, { recursive: true })

  const result = {}
  for (const { file, slug } of PDF_MAP) {
    result[slug] = {}
  }

  const run = async () => {
    for (const { file, slug } of PDF_MAP) {
      const pdfPath = path.join(root, file)
      if (!fs.existsSync(pdfPath)) {
        console.warn(`Missing PDF: ${file} — skipping ${slug}`)
        continue
      }
      console.log(`Processing ${file}...`)
      let text
      try {
        text = await extractPdfText(pdfPath)
      } catch (err) {
        console.error(`Error reading ${file}:`, err.message)
        continue
      }
      if (!text || text.trim().length === 0) {
        console.warn(`No text extracted from ${file}`)
        continue
      }

      const segments = splitIntoNumberedSegments(text, slug)
      const byOrder = {}
      const excluded = []
      for (const { order, text: segmentText } of segments) {
        const firstLine = getFirstLine(segmentText)
        if (isCategoryContent(firstLine)) {
          excluded.push({ order, firstLine: firstLine.slice(0, 60) })
          continue
        }
        if (byOrder[order] !== undefined) {
          byOrder[order] = segmentText
          continue
        }
        byOrder[order] = segmentText
      }
      if (excluded.length > 0) {
        console.log(`  Excluded ${excluded.length} category segment(s): ${excluded.map((e) => `#${e.order}`).join(', ')}`)
      }
      const orders = Object.keys(byOrder).map(Number).sort((a, b) => a - b)
      if (orders.length !== 52) {
        console.warn(`  ${slug}: expected 52 segments, got ${orders.length}. Missing orders: ${[...Array.from({ length: 52 }, (_, i) => i + 1)].filter((n) => !byOrder[n]).join(', ')}`)
      }
      for (let n = 1; n <= 52; n++) {
        result[slug][n] = byOrder[n] || null
      }
    }

    const outPath = path.join(outDir, 'transcripts-by-passage.json')
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8')
    console.log(`Wrote ${outPath}`)
    const total = Object.values(result).reduce((sum, sphere) => sum + Object.values(sphere).filter(Boolean).length, 0)
    console.log(`Total transcripts: ${total} / 416`)
  }

  run().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

main()
