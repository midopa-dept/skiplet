#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_NODE="$PROJECT_DIR/.tools/node-v22.23.2-darwin-x64/bin"
if [ -d "$LOCAL_NODE" ]; then
  export PATH="$LOCAL_NODE:$PATH"
fi
cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'Number(process.versions.node.split(`.`)[0])')" -lt 22 ]; then
  echo "Skiplet requires Node.js 22 or newer."
  exit 1
fi

npm install
