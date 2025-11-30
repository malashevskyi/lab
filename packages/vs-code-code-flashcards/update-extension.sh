#!/bin/bash

# Script to properly update VS Code extension with cache clearing
# Usage: ./update-extension.sh

set -e  # Exit on error

echo "🚀 Starting VS Code extension update process..."

# Get current directory
EXT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$EXT_DIR"

# Get extension info from package.json
EXT_NAME=$(node -p "require('./package.json').name")
PUBLISHER=$(node -p "require('./package.json').publisher")
FULL_EXT_NAME="${PUBLISHER}.${EXT_NAME}"

echo "📦 Extension: $FULL_EXT_NAME"

# Step 1: Increment version
echo ""
echo "1️⃣  Incrementing version..."
npm version patch --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ New version: $NEW_VERSION"

# Step 2: Compile TypeScript
echo ""
echo "2️⃣  Compiling TypeScript..."
npm run compile
echo "✅ Compilation complete"

# Step 3: Package extension
echo ""
echo "3️⃣  Creating .vsix package..."
npx vsce package
VSIX_FILE="${EXT_NAME}-${NEW_VERSION}.vsix"
echo "✅ Created: $VSIX_FILE"

# Step 4: Uninstall old version
echo ""
echo "4️⃣  Uninstalling old version..."
code --uninstall-extension "$FULL_EXT_NAME" 2>/dev/null || true
echo "✅ Old version uninstalled"

# Step 5: Remove cached extension files
echo ""
echo "5️⃣  Removing cached extension files..."
EXTENSIONS_DIR="$HOME/.vscode/extensions"
rm -rf "$EXTENSIONS_DIR/${FULL_EXT_NAME}-"* 2>/dev/null || true
echo "✅ Cache cleared"

# Step 6: Install new version
echo ""
echo "6️⃣  Installing new version..."
code --install-extension "$VSIX_FILE" --force
echo "✅ New version installed"

# Step 7: Instructions for user
echo ""
echo "✨ Update complete!"
echo ""
echo "⚠️  IMPORTANT: To see changes, you must:"
echo "   1. Close ALL VS Code windows (Command+Q on Mac, Alt+F4 on Windows)"
echo "   2. Open VS Code again"
echo "   3. Open your project"
echo ""
echo "📝 Installed version: $NEW_VERSION"
echo "📦 Package file: $VSIX_FILE"
echo ""
echo "🔍 To verify installation:"
echo "   code --list-extensions --show-versions | grep $EXT_NAME"
echo ""
