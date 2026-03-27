# Multi-stage Dockerfile for Homework Bot
# Optimized for production use on Ubuntu

# ============================================
# Stage 1: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY src/ ./src/

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies for native modules (better-sqlite3)
# Install su-exec for running as non-root user after setting permissions
RUN apk add --no-cache libc6-compat su-exec

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/src ./src

# Create data directory for database with correct permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Note: USER nodejs removed - entrypoint script handles user switch with su-exec
# This allows the script to run as root, fix permissions, then switch to nodejs

# Expose nothing (bot uses long polling)
# EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Graceful shutdown handling
STOPSIGNAL SIGTERM

# Start the application
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
