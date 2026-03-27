# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Build dependencies for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install production deps only
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Ensure data directory exists (will be mounted as a volume)
RUN mkdir -p /app/data

# Run as non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server/index.js"]
