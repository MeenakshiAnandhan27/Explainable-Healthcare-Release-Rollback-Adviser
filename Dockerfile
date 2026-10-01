# Multi-stage Dockerfile for Staging / Prototype Deployment
# Explainable Healthcare Release Rollback Adviser

# Stage 1: Build & Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Run production build (Vite client + esbuild server bundle)
RUN npm run build

# Stage 2: Production Staging Runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/rules ./rules
COPY --from=builder /app/experiments ./experiments

# Non-root user for security compliance
USER node

EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
