#!/bin/bash
set -e

source "$(dirname "$0")/../.env" 2>/dev/null || true

if [ -z "$RAILWAY_URI" ]; then
  echo "Error: RAILWAY_URI not set. Add it to .env or export it."
  exit 1
fi
DUMP_DIR="dump"
DB_NAME="tinytools"

echo "Dumping local $DB_NAME..."
mongodump --db="$DB_NAME" --out="$DUMP_DIR"

echo "Syncing collections and indexes to Railway (no data)..."
mongorestore --uri="$RAILWAY_URI" --noData "$DUMP_DIR/$DB_NAME/"

echo "Done!"
