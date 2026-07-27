#!/bin/bash
set -e

echo "🔧 Running Swift 5.9+ compatibility fixes (EAS build hook)..."

# Find and fix ALL Swift files containing 'weak let' in node_modules
# This handles any package that hasn't been updated for Swift 6 / Xcode 26
FIXED_COUNT=0

while IFS= read -r file; do
  sed -i '' 's/weak let/weak var/g' "$file"
  echo "✅ Fixed $file"
  FIXED_COUNT=$((FIXED_COUNT + 1))
done < <(find node_modules -name "*.swift" -exec grep -l "weak let" {} \; 2>/dev/null)

if [ "$FIXED_COUNT" -eq 0 ]; then
  echo "⏭️ No files needed fixing"
fi

echo "✨ Done! Fixed $FIXED_COUNT file(s)"
