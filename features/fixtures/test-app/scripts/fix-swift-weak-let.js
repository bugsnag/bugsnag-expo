#!/usr/bin/env node

/**
 * Fixes Swift 6 'weak let' compilation errors in Expo SDK 57 dependencies.
 * Patches all .swift files in node_modules that contain 'weak let'.
 *
 * Affected packages:
 * - expo-modules-jsi (JavaScriptWeakObject.swift)
 * - expo-modules-core (SharedObjectRegistry.swift)
 * - expo-app-metrics (NetworkPathObserver.swift)
 */

const fs = require('fs')
const path = require('path')

const WEAK_LET_REGEX = /\bweak\s+let\b/g

function findSwiftFiles (dir, results = []) {
  if (!fs.existsSync(dir)) return results

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip .git, .build, DerivedData, xcframework internals
      if (entry.name.startsWith('.') || entry.name === 'DerivedData') continue
      findSwiftFiles(fullPath, results)
    } else if (entry.name.endsWith('.swift')) {
      results.push(fullPath)
    }
  }
  return results
}

function fixFile (filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  if (!WEAK_LET_REGEX.test(content)) return false

  // Reset regex lastIndex since we used .test()
  WEAK_LET_REGEX.lastIndex = 0
  const fixed = content.replace(WEAK_LET_REGEX, 'weak var')
  fs.writeFileSync(filePath, fixed, 'utf8')
  return true
}

console.log('🔧 [fix-swift-weak-let] Scanning for Swift 6 compatibility issues...')

const nodeModulesDir = path.resolve(__dirname, '..', 'node_modules')
const swiftFiles = findSwiftFiles(nodeModulesDir)
let fixedCount = 0

for (const file of swiftFiles) {
  if (fixFile(file)) {
    const relPath = path.relative(nodeModulesDir, file)
    console.log(`Patched: ${relPath}`)
    fixedCount++
  }
}

// Also fix any .swiftinterface files in xcframeworks that reference weak let
const xcframeworkFiles = []
function findSwiftInterfaceFiles (dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      findSwiftInterfaceFiles(fullPath)
    } else if (entry.name.endsWith('.swiftinterface')) {
      xcframeworkFiles.push(fullPath)
    }
  }
}
findSwiftInterfaceFiles(nodeModulesDir)

for (const file of xcframeworkFiles) {
  if (fixFile(file)) {
    const relPath = path.relative(nodeModulesDir, file)
    console.log(`Patched interface: ${relPath}`)
    fixedCount++
  }
}

// Invalidate expo-modules-jsi build cache so it rebuilds from patched sources
const jsiHashFiles = []
function findBuildHashFiles (dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      findBuildHashFiles(fullPath)
    } else if (entry.name === '.build-hash') {
      jsiHashFiles.push(fullPath)
    }
  }
}

const jsiProductsDir = path.join(nodeModulesDir, 'expo-modules-jsi', 'apple', 'Products')
findBuildHashFiles(jsiProductsDir)
for (const hashFile of jsiHashFiles) {
  fs.unlinkSync(hashFile)
  console.log(`  🗑️  Removed build cache: ${path.relative(nodeModulesDir, hashFile)}`)
}

if (fixedCount === 0) {
  console.log('No files needed patching')
} else {
  console.log(`\n✨ Fixed ${fixedCount} file(s)`)
}