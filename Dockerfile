# ============================================
# Build Stage
# ============================================
FROM node:20-alpine AS builder

# Add metadata labels
LABEL maintainer="Budget Planner"
LABEL description="Budget Planner Application - Build Stage"

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files first for better layer caching
# This allows Docker to cache npm install if dependencies haven't changed
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies to reduce image size
RUN npm prune --production

# ============================================
# Production Stage
# ============================================
FROM node:20-alpine AS runner

# Add metadata labels
LABEL maintainer="Budget Planner"
LABEL description="Budget Planner Application - Lightweight budget tracking app"
LABEL version="1.0.0"

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV NODE_OPTIONS="--max-old-space-size=512"

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy necessary files from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 5000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
