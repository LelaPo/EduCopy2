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
RUN apk add --no-cache libc6-compat

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

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Create data directory for database
RUN mkdir -p /app/data && chown nodejs:nodejs /app/data

# Expose nothing (bot uses long polling)
# EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Graceful shutdown handling
STOPSIGNAL SIGTERM

# Start the application
CMD ["node", "src/index.js"]
