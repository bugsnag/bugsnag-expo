#!/usr/bin/env node

/**
 * Post-install script to fix Swift 5.9+ compatibility issues
 * Converts 'weak let' to 'weak var' in expo-modules-jsi and related packages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const swiftFilesToCheck = [
  'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Contexts/HostFunctionContext.swift',
  'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/JavaScriptRuntime.swift',
];

function fixSwiftFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${filePath} (not found)`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Replace weak let with weak var
    content = content.replace(/\bweak\s+let\b/g, 'weak var');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Running Swift 5.9+ compatibility fixes...\n');

let fixedCount = 0;
swiftFilesToCheck.forEach(filePath => {
  if (fixSwiftFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✨ Done! Fixed ${fixedCount} file(s)`);

if (fixedCount > 0) {
  process.exit(0);
} else {
  process.exit(0);
}
