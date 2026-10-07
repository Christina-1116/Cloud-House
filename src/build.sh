#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build.py
node --check src/check.mjs
echo 'BUILD_OK — index.html and local runtime assets are ready'
