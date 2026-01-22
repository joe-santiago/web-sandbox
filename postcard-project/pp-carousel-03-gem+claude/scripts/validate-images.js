/**
 * Image Validation Script
 *
 * Checks images without modifying them:
 * - Reports images over 200KB (warning)
 * - Reports missing front/back pairs
 * - Reports images with dimensions over limits
 * - Useful for CI/pre-commit checks
 *
 * Usage: npm run validate
 * Exit code: 0 if all pass, 1 if warnings exist
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CARDS_DIR = path.join(__dirname, '../public/cards')
const FRONTS_DIR = path.join(CARDS_DIR, 'fronts')
const BACKS_DIR = path.join(CARDS_DIR, 'backs')

// Constraints from CLAUDE.md Section 9
const MAX_WIDTH = 1400
const MAX_HEIGHT = 1000
const SIZE_THRESHOLD_KB = 200
const SIZE_THRESHOLD_BYTES = SIZE_THRESHOLD_KB * 1024

async function getImageFiles(dir) {
  const files = new Map() // id -> filename

  try {
    const entries = await fs.readdir(dir)

    for (const entry of entries) {
      if (/\.(jpg|jpeg|png)$/i.test(entry)) {
        const id = path.basename(entry, path.extname(entry))
        files.set(id, entry)
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

  return files
}

async function validateImage(filePath) {
  const warnings = []

  try {
    const stats = await fs.stat(filePath)
    const sizeKB = stats.size / 1024

    if (stats.size > SIZE_THRESHOLD_BYTES) {
      warnings.push(`Size ${sizeKB.toFixed(0)}KB exceeds ${SIZE_THRESHOLD_KB}KB limit`)
    }

    const metadata = await sharp(filePath).metadata()

    if (metadata.width > MAX_WIDTH) {
      warnings.push(`Width ${metadata.width}px exceeds ${MAX_WIDTH}px limit`)
    }
    if (metadata.height > MAX_HEIGHT) {
      warnings.push(`Height ${metadata.height}px exceeds ${MAX_HEIGHT}px limit`)
    }

    return { valid: warnings.length === 0, warnings, sizeKB }
  } catch (err) {
    return { valid: false, warnings: [`Cannot read: ${err.message}`], sizeKB: 0 }
  }
}

async function main() {
  console.log('Validating images in /public/cards/...\n')

  const fronts = await getImageFiles(FRONTS_DIR)
  const backs = await getImageFiles(BACKS_DIR)

  const allIds = new Set([...fronts.keys(), ...backs.keys()])

  if (allIds.size === 0) {
    console.log('No images found.')
    return
  }

  let hasWarnings = false
  const results = []

  // Check for missing pairs
  console.log('--- Pair Check ---')
  for (const id of [...allIds].sort()) {
    const hasFront = fronts.has(id)
    const hasBack = backs.has(id)

    if (!hasFront || !hasBack) {
      hasWarnings = true
      const missing = !hasFront ? 'front' : 'back'
      console.log(`  [WARN] Card ${id}: missing ${missing}`)
    }
  }

  const pairedCount = [...allIds].filter(id => fronts.has(id) && backs.has(id)).length
  console.log(`\nFound ${pairedCount} complete card pairs.\n`)

  // Validate each image
  console.log('--- Size & Dimension Check ---')

  for (const [id, filename] of fronts) {
    const filePath = path.join(FRONTS_DIR, filename)
    const result = await validateImage(filePath)

    if (!result.valid) {
      hasWarnings = true
      console.log(`  [WARN] fronts/${filename}:`)
      result.warnings.forEach(w => console.log(`         - ${w}`))
    }
    results.push({ path: `fronts/${filename}`, ...result })
  }

  for (const [id, filename] of backs) {
    const filePath = path.join(BACKS_DIR, filename)
    const result = await validateImage(filePath)

    if (!result.valid) {
      hasWarnings = true
      console.log(`  [WARN] backs/${filename}:`)
      result.warnings.forEach(w => console.log(`         - ${w}`))
    }
    results.push({ path: `backs/${filename}`, ...result })
  }

  // Summary
  console.log('\n--- Summary ---')
  const validCount = results.filter(r => r.valid).length
  const warnCount = results.filter(r => !r.valid).length

  console.log(`Total images: ${results.length}`)
  console.log(`Valid:        ${validCount}`)
  console.log(`Warnings:     ${warnCount}`)

  if (hasWarnings) {
    console.log('\nRun `npm run optimize` to fix size/dimension issues.')
    process.exit(1)
  } else {
    console.log('\nAll images pass validation!')
    process.exit(0)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
