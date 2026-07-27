#!/bin/bash
set -e

echo "🔧 Running Swift 5.9+ compatibility fixes (EAS build hook)..."

# Fix 'weak let' -> 'weak var' in expo-modules-jsi
SWIFT_FILES=(
  "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Contexts/HostFunctionContext.swift"
  "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/JavaScriptRuntime.swift"
)

for file in "${SWIFT_FILES[@]}"; do
  if [ -f "$file" ]; then
    sed -i '' 's/weak let/weak var/g' "$file"
    echo "✅ Fixed $file"
  else
    echo "⏭️ Skipping $file (not found)"
  fi
done

echo "✨ Swift compatibility fixes complete"