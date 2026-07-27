#!/bin/bash
set -e

echo "🔧 Running Swift 6 compatibility fixes..."

fix_weak_let() {
  local search_dir="$1"
  local count=0

  if [ ! -d "$search_dir" ]; then
    echo "⏭️ Directory $search_dir not found, skipping"
    return 0
  fi

  for file in $(grep -rl "weak let" "$search_dir" --include="*.swift" 2>/dev/null); do
    sed -i '' 's/weak let/weak var/g' "$file"
    echo "✅ Fixed $file"
    count=$((count + 1))
  done

  echo "Fixed $count file(s) in $search_dir"
}

# Fix in node_modules (before prebuild copies them)
fix_weak_let "node_modules"

echo "✨ Swift compatibility fixes complete"