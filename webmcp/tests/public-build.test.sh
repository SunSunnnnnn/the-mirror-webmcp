#!/bin/sh

set -eu

repo_root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
node_bin="${NODE_BIN:-node}"
test_root=$(mktemp -d /tmp/the-mirror-public-build.XXXXXX)
source_root="$test_root/source"

mkdir -p "$source_root"
rsync -a --exclude='.git/' --exclude='dist/' "$repo_root/" "$source_root/"

(
  cd "$source_root"
  sh ./build-public-release.sh
)

test -f "$source_root/dist/index.html"
test -d "$source_root/dist/data/public-sample"
test -f "$source_root/dist/webmcp/knowledge-config.js"
test ! -e "$source_root/dist/webmcp/tests"
test "$(find "$source_root/dist/data" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')" = "1"
test "$(find "$source_root/dist" -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' -o -name '*.gif' -o -name '*.svg' \) | wc -l | tr -d ' ')" = "0"

"$node_bin" "$repo_root/webmcp/tests/public-build-smoke.mjs" "$source_root/dist"
"$node_bin" "$repo_root/scripts/public-release-audit.mjs" "$source_root/dist"
printf 'Public-only clean build: PASS\n%s\n' "$test_root"
