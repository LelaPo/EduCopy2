#!/bin/sh
set -e

echo "🔧 Entrypoint: Running as user $(whoami) (UID: $(id -u))"

# Ensure data directory exists
if [ ! -d "/app/data" ]; then
  echo "📁 Creating /app/data directory..."
  mkdir -p /app/data
fi

# Fix ownership - must run as root before switching to nodejs
echo "🔐 Setting ownership of /app/data to nodejs:nodejs..."
chown -R nodejs:nodejs /app/data

# Check if we can write to the data directory as nodejs
echo "🧪 Testing write permissions..."
if ! su-exec nodejs test -w /app/data; then
  echo "❌ Error: /app/data is not writable by nodejs user after chown"
  echo "   Volume may have restrictive mount options"
  exit 1
fi

# Test database file if it exists
if [ -f "/app/data/homework_bot.db" ]; then
  if ! su-exec nodejs test -w /app/data/homework_bot.db; then
    echo "❌ Error: /app/data/homework_bot.db exists but is not writable by nodejs"
    echo "   Try: docker volume rm homework-bot-data"
    exit 1
  fi
  echo "✅ Database file found and writable"
else
  echo "📝 Database file will be created on first run"
fi

echo "✅ Data directory check passed"

# Start the application as nodejs user using su-exec for proper signal handling
echo "🚀 Starting Homework Bot as nodejs user..."
exec su-exec nodejs node src/index.js
