/**
 * Add Card CLI Script
 *
 * Streamlines the process of adding a new card to the carousel.
 *
 * Usage:
 *   npm run add-card -- <id> <orientation> [frontPath] [backPath]
 *
 * Examples:
 *   npm run add-card -- 3013 portrait
 *   npm run add-card -- 3013 portrait ~/Desktop/front.jpg ~/Desktop/back.jpg
 *
 * If paths aren't provided, looks for:
 *   - ~/Desktop/{id}-front.jpg
 *   - ~/Desktop/{id}-back.jpg
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')
const DATA_FILE = path.join(PROJECT_ROOT, 'src/data.js')
const FRONTS_DIR = path.join(PROJECT_ROOT, 'public/cards/fronts')
const BACKS_DIR = path.join(PROJECT_ROOT, 'public/cards/backs')

// Constraints
const SIZE_THRESHOLD_KB = 200
const SIZE_THRESHOLD_BYTES = SIZE_THRESHOLD_KB * 1024

function usage() {
  console.log(`
Usage: npm run add-card -- <id> <orientation> [frontPath] [backPath]

Arguments:
  id          Card ID (e.g., 3013)
  orientation Either 'portrait' or 'landscape'
  frontPath   Path to front image (optional)
  backPath    Path to back image (optional)

If paths aren't provided, looks for:
  ~/Desktop/{id}-front.jpg
  ~/Desktop/{id}-back.jpg

Examples:
  npm run add-card -- 3013 portrait
  npm run add-card -- 3013 landscape ~/Downloads/front.jpg ~/Downloads/back.jpg
`)
  process.exit(1)
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function validateImage(filePath) {
  const stats = await fs.stat(filePath)
  const warnings = []

  if (stats.size > SIZE_THRESHOLD_BYTES) {
    warnings.push(`Size ${(stats.size / 1024).toFixed(0)}KB exceeds ${SIZE_THRESHOLD_KB}KB limit`)
  }

  try {
    const metadata = await sharp(filePath).metadata()
    if (metadata.width > 1400) {
      warnings.push(`Width ${metadata.width}px exceeds 1400px limit`)
    }
    if (metadata.height > 1000) {
      warnings.push(`Height ${metadata.height}px exceeds 1000px limit`)
    }
  } catch (err) {
    warnings.push(`Cannot read image: ${err.message}`)
  }

  return warnings
}

async function copyImage(src, dest) {
  await fs.copyFile(src, dest)
}

async function updateDataFile(id, orientation) {
  const content = await fs.readFile(DATA_FILE, 'utf8')

  // Check if ID already exists
  if (content.includes(id.toString())) {
    throw new Error(`Card ID ${id} already exists in data.js`)
  }

  // Add to cardIds array
  // Match: const cardIds = [ ... ];
  const cardIdsMatch = content.match(/const cardIds = \[([\s\S]*?)\];/)
  if (!cardIdsMatch) {
    throw new Error('Could not find cardIds array in data.js')
  }

  const existingIds = cardIdsMatch[1]
  // Find the last number and add our new one after it
  const updatedIds = existingIds.replace(/(\d+)(\s*\];?\s*)$/, `$1, ${id}$2`)

  let updatedContent = content.replace(
    /const cardIds = \[([\s\S]*?)\];/,
    `const cardIds = [${updatedIds}];`
  )

  // Add to orientations object
  // Find the last entry and add ours
  const orientationsMatch = updatedContent.match(/const orientations = \{([\s\S]*?)\};/)
  if (!orientationsMatch) {
    throw new Error('Could not find orientations object in data.js')
  }

  const existingOrientations = orientationsMatch[1]
  // Add new orientation entry
  const updatedOrientations = existingOrientations.replace(
    /(\d+:\s*'(?:portrait|landscape)')(\s*\};?\s*)$/,
    `$1,\n  ${id}: '${orientation}'$2`
  )

  updatedContent = updatedContent.replace(
    /const orientations = \{([\s\S]*?)\};/,
    `const orientations = {${updatedOrientations}};`
  )

  await fs.writeFile(DATA_FILE, updatedContent)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    usage()
  }

  const id = parseInt(args[0], 10)
  const orientation = args[1].toLowerCase()

  if (isNaN(id)) {
    console.error(`Error: Invalid card ID "${args[0]}". Must be a number.`)
    process.exit(1)
  }

  if (orientation !== 'portrait' && orientation !== 'landscape') {
    console.error(`Error: Orientation must be 'portrait' or 'landscape', got "${orientation}"`)
    process.exit(1)
  }

  // Determine source paths
  const desktop = path.join(os.homedir(), 'Desktop')
  let frontPath = args[2] || path.join(desktop, `${id}-front.jpg`)
  let backPath = args[3] || path.join(desktop, `${id}-back.jpg`)

  // Expand ~ in paths
  if (frontPath.startsWith('~')) {
    frontPath = path.join(os.homedir(), frontPath.slice(1))
  }
  if (backPath.startsWith('~')) {
    backPath = path.join(os.homedir(), backPath.slice(1))
  }

  console.log(`Adding card ${id} (${orientation})\n`)

  // Verify source images exist
  console.log('Checking source images...')

  if (!await fileExists(frontPath)) {
    console.error(`Error: Front image not found at ${frontPath}`)
    console.log(`\nHint: Either provide paths or place images at:`)
    console.log(`  ${path.join(desktop, `${id}-front.jpg`)}`)
    console.log(`  ${path.join(desktop, `${id}-back.jpg`)}`)
    process.exit(1)
  }

  if (!await fileExists(backPath)) {
    console.error(`Error: Back image not found at ${backPath}`)
    process.exit(1)
  }

  console.log(`  Front: ${frontPath}`)
  console.log(`  Back:  ${backPath}`)

  // Validate images
  console.log('\nValidating images...')

  const frontWarnings = await validateImage(frontPath)
  const backWarnings = await validateImage(backPath)

  if (frontWarnings.length > 0) {
    console.log(`  [WARN] Front image:`)
    frontWarnings.forEach(w => console.log(`         - ${w}`))
  }

  if (backWarnings.length > 0) {
    console.log(`  [WARN] Back image:`)
    backWarnings.forEach(w => console.log(`         - ${w}`))
  }

  if (frontWarnings.length > 0 || backWarnings.length > 0) {
    console.log(`\n  Run 'npm run optimize' after adding to fix these issues.`)
  } else {
    console.log(`  All images pass validation.`)
  }

  // Check destination doesn't already exist
  const destFront = path.join(FRONTS_DIR, `${id}.jpg`)
  const destBack = path.join(BACKS_DIR, `${id}.jpg`)

  if (await fileExists(destFront)) {
    console.error(`\nError: ${destFront} already exists`)
    process.exit(1)
  }

  if (await fileExists(destBack)) {
    console.error(`\nError: ${destBack} already exists`)
    process.exit(1)
  }

  // Copy images
  console.log('\nCopying images...')
  await copyImage(frontPath, destFront)
  console.log(`  Copied to ${destFront}`)
  await copyImage(backPath, destBack)
  console.log(`  Copied to ${destBack}`)

  // Update data.js
  console.log('\nUpdating data.js...')
  try {
    await updateDataFile(id, orientation)
    console.log(`  Added card ${id} with orientation '${orientation}'`)
  } catch (err) {
    // Rollback: delete copied images
    console.error(`  Error: ${err.message}`)
    console.log('  Rolling back image copies...')
    await fs.unlink(destFront).catch(() => {})
    await fs.unlink(destBack).catch(() => {})
    process.exit(1)
  }

  // Success
  console.log(`
Success! Card ${id} has been added.

Next steps:
  1. Run 'npm run dev' to preview
  2. Verify the card displays correctly (text upright, no jitter)
  3. Run 'npm run optimize' if you saw size warnings
  4. Commit and deploy when ready
`)
}

main().catch(err => {
  console.error(`Error: ${err.message}`)
  process.exit(1)
})
