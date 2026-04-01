#!/bin/bash
set -e

RAILWAY_URI="mongodb://mongo:NpRhYhNWhRdmuKhKlapBJiHilkqJJREJ@interchange.proxy.rlwy.net:54471/tinytools?authSource=admin"
DUMP_DIR="dump"
DB_NAME="tinytools"

echo "Dumping local $DB_NAME..."
mongodump --db="$DB_NAME" --out="$DUMP_DIR"

echo "Syncing collections and indexes to Railway (no data)..."
mongorestore --uri="$RAILWAY_URI" --noData "$DUMP_DIR/$DB_NAME/"

echo "Done!"
