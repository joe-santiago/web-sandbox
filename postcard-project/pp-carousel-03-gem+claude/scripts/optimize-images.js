/**
 * Image Optimization Script
 *
 * Automatically processes all images in /public/cards/:
 * - Resizes images over 1400px wide (preserves aspect ratio)
 * - Compresses JPGs to ~80% quality (target <200KB)
 * - Reports what was optimized
 * - Skips already-optimized images (based on file size threshold)
 *
 * Usage: npm run optimize
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CARDS_DIR = path.join(__dirname, '../public/cards')

// Constraints from CLAUDE.md Section 9
const MAX_WIDTH = 1400
const MAX_HEIGHT = 1000
const QUALITY = 80
const SIZE_THRESHOLD_KB = 200
const SIZE_THRESHOLD_BYTES = SIZE_THRESHOLD_KB * 1024

async function getImageFiles(dir) {
  const files = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        files.push(...await getImageFiles(fullPath))
      } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
        files.push(fullPath)
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

  return files
}

async function optimizeImage(filePath) {
  const stats = await fs.stat(filePath)
  const originalSize = stats.size
  const relativePath = path.relative(CARDS_DIR, filePath)

  // Skip if already under threshold
  if (originalSize <= SIZE_THRESHOLD_BYTES) {
    return { path: relativePath, status: 'skipped', reason: 'already optimized' }
  }

  try {
    const image = sharp(filePath)
    const metadata = await image.metadata()

    // Check if resize is needed
    const needsResize = metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT

    // Build pipeline
    let pipeline = image

    if (needsResize) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }

    // Compress based on format
    const ext = path.extname(filePath).toLowerCase()
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: QUALITY })
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: QUALITY })
    }

    // Write to buffer first to check size
    const buffer = await pipeline.toBuffer()

    // Only write if we actually reduced size
    if (buffer.length < originalSize) {
      await fs.writeFile(filePath, buffer)

      const savedKB = ((originalSize - buffer.length) / 1024).toFixed(1)
      const newSizeKB = (buffer.length / 1024).toFixed(1)

      return {
        path: relativePath,
        status: 'optimized',
        originalKB: (originalSize / 1024).toFixed(1),
        newKB: newSizeKB,
        savedKB,
        resized: needsResize
      }
    } else {
      return { path: relativePath, status: 'skipped', reason: 'no size reduction' }
    }
  } catch (err) {
    return { path: relativePath, status: 'error', error: err.message }
  }
}

async function main() {
  console.log('Scanning for images in /public/cards/...\n')

  const files = await getImageFiles(CARDS_DIR)

  if (files.length === 0) {
    console.log('No images found.')
    return
  }

  console.log(`Found ${files.length} images.\n`)

  const results = {
    optimized: [],
    skipped: [],
    errors: []
  }

  for (const file of files) {
    const result = await optimizeImage(file)

    if (result.status === 'optimized') {
      results.optimized.push(result)
      const resizeNote = result.resized ? ' (resized)' : ''
      console.log(`  [OK] ${result.path}: ${result.originalKB}KB -> ${result.newKB}KB (saved ${result.savedKB}KB)${resizeNote}`)
    } else if (result.status === 'error') {
      results.errors.push(result)
      console.log(`  [ERR] ${result.path}: ${result.error}`)
    } else {
      results.skipped.push(result)
    }
  }

  // Summary
  console.log('\n--- Summary ---')
  console.log(`Optimized: ${results.optimized.length}`)
  console.log(`Skipped:   ${results.skipped.length} (already <${SIZE_THRESHOLD_KB}KB)`)

  if (results.errors.length > 0) {
    console.log(`Errors:    ${results.errors.length}`)
    results.errors.forEach(e => console.log(`  - ${e.path}: ${e.error}`))
  }

  if (results.optimized.length > 0) {
    const totalSaved = results.optimized.reduce((sum, r) => sum + parseFloat(r.savedKB), 0)
    console.log(`\nTotal saved: ${totalSaved.toFixed(1)}KB`)
  }
}

main().catch(console.error)
