#!/bin/sh

FULL_PATH=$(realpath "$0")
FILE_BASE=$(dirname "$FULL_PATH")
npx tsx "$FILE_BASE/../src/main.mts" "$1"
