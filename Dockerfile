# ──────────────────────────────────────────────────────────────
# 🐳 DOCKERFILE - Condo Manager (Railway Deployment)
# Two-stage build: Frontend + Backend compiled together
# ──────────────────────────────────────────────────────────────

FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy monorepo structure
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.json tsconfig.base.json ./

# Copy all workspace packages
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all packages (typecheck + compillation)
RUN pnpm run build

# ──────────────────────────────────────────────────────────────
# Production Stage
# ──────────────────────────────────────────────────────────────

FROM node:22-alpine

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built backend from builder
COPY --from=builder /app/artifacts/api-server/dist ./dist

# Copy built frontend static files to be served by backend
COPY --from=builder /app/artifacts/conserje/dist/public ./public

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start backend server
CMD ["node", "dist/index.mjs"]
