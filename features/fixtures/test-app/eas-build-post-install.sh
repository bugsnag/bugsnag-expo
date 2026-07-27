#!/bin/bash

echo "🔧 [Swift 6 Fix] Starting comprehensive weak let patch..."

FIXED=0

# Function to patch a single file
patch_file() {
  local file="$1"
  if grep -q "weak let" "$file" 2>/dev/null; then
    sed -i '' 's/weak let/weak var/g' "$file"
    echo "Patched: $file"
    FIXED=$((FIXED + 1))
  fi
}

# 1. Patch .swift files in node_modules (if expo-modules-jsi is an npm dep)
echo "Searching node_modules for .swift files..."
find node_modules -name "*.swift" -type f 2>/dev/null | while read -r file; do
  patch_file "$file"
done

# 2. Patch .swiftinterface files in xcframeworks (pre-built binaries)
echo "Searching for .swiftinterface files..."
find node_modules -name "*.swiftinterface" -type f 2>/dev/null | while read -r file; do
  patch_file "$file"
done

# 3. Delete SPM build caches to force rebuild from patched sources
echo "Clearing SPM build caches..."
find node_modules -type d -name ".build" -exec rm -rf {} + 2>/dev/null || true
find node_modules -name ".build-hash" -type f -delete 2>/dev/null || true

echo "✨ [Swift 6 Fix] Done. Patched files: $FIXED"