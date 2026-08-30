#!/bin/sh

set -eu

release_dir="dist"

if [ -L "$release_dir" ]; then
  echo "Refusing to replace a symlinked release directory." >&2
  exit 1
fi

mkdir -p "$release_dir"
find "$release_dir" -mindepth 1 -delete

cp index.html README.md ROADMAP.md LICENSE DATA-LICENSE.md PUBLIC-RELEASE-AUDIT.md "$release_dir/"
mkdir -p "$release_dir/webmcp" "$release_dir/data/public-sample" "$release_dir/docs"
rsync -a --exclude='.DS_Store' --exclude='tests/' webmcp/ "$release_dir/webmcp/"
rsync -a --exclude='.DS_Store' data/public-sample/ "$release_dir/data/public-sample/"
rsync -a --exclude='.DS_Store' docs/ "$release_dir/docs/"

echo "The Mirror public release prepared in $release_dir/"
