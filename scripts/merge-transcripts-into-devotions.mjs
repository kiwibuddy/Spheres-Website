/**
 * Merge extracted transcripts into devotions-static.json.
 * Run after validate-transcripts.mjs passes. Use --force to run anyway.
 * Run: node scripts/merge-transcripts-into-devotions.mjs [--force]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const transcriptPath = path.join(root, 'scripts', 'out', 'transcripts-by-passage.json')
const devotionsPath = path.join(root, 'src', 'lib', 'devotions-static.json')
const force = process.argv.includes('--force')

function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('Missing transcripts. Run: npm run extract-transcripts')
    process.exit(1)
  }
  if (!force && fs.existsSync(path.join(root, 'scripts', 'out', 'validation-report.json'))) {
    const report = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'out', 'validation-report.json'), 'utf-8'))
    if (report.failed > 0) {
      console.error('Validation had failures. Fix and run validate-transcripts, or use --force')
      process.exit(1)
    }
  }

  const transcriptMap = JSON.parse(fs.readFileSync(transcriptPath, 'utf-8'))
  const devotions = JSON.parse(fs.readFileSync(devotionsPath, 'utf-8'))

  let updated = 0
  for (const d of devotions) {
    const slug = d.slug
    const order = d.order_in_sphere
    const text = transcriptMap[slug] && transcriptMap[slug][order]
    if (text) {
      d.transcript = text
      updated++
    }
  }
  fs.writeFileSync(devotionsPath, JSON.stringify(devotions, null, 2), 'utf-8')
  console.log(`Updated ${updated} devotions with transcripts in ${devotionsPath}`)
}

main()
