#!/usr/bin/env bash
# Build the static pages from src/*.html by inlining the shared chrome.
#   bash build.sh
# Each src file starts with two comment lines:  <!--TITLE:...-->  <!--DESC:...-->
set -e
cd "$(dirname "$0")"
for src in src/*.html; do
  out="$(basename "$src")"
  title=$(sed -n 's/^<!--TITLE:\(.*\)-->$/\1/p' "$src")
  desc=$(sed -n 's/^<!--DESC:\(.*\)-->$/\1/p' "$src")
  {
    sed -e "s|{{TITLE}}|$title|" -e "s|{{DESC}}|$desc|" _partials/head.html
    cat _partials/nav.html
    sed -e '/^<!--TITLE:/d' -e '/^<!--DESC:/d' -e '/^<!--WORD:/d' "$src"
    cat _partials/foot.html
  } > "$out"
  echo "built $out"
done
