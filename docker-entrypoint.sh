#!/bin/sh
set -e

# Ensure data directory exists and is writable
if [ ! -d "/app/data" ]; then
  mkdir -p /app/data
fi

# Check if we can write to the data directory
if [ ! -w "/app/data" ]; then
  echo "❌ Error: /app/data is not writable by user $(whoami) (UID: $(id -u))"
  echo "   This is likely a Docker volume permission issue."
  echo "   Try: docker volume rm homework-bot-data"
  echo "   Then restart the container to recreate the volume with correct permissions."
  exit 1
fi

# Test database file creation/writing
if [ -f "/app/data/homework_bot.db" ]; then
  if [ ! -w "/app/data/homework_bot.db" ]; then
    echo "❌ Error: /app/data/homework_bot.db exists but is not writable"
    echo "   Fix permissions: docker exec homework-bot chown nodejs:nodejs /app/data/homework_bot.db"
    echo "   Or recreate volume: docker volume rm homework-bot-data"
    exit 1
  fi
fi

echo "✅ Data directory check passed"

# Start the application
exec node src/index.js
