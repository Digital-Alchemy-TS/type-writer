#!/bin/sh

FULL_PATH=$(realpath "$0")
FILE_BASE=$(dirname "$FULL_PATH")
cd "$FILE_BASE/.." || exit
npx tsx src/main.ts "$1"
