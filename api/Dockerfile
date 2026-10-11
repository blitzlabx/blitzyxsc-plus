# Dockerfile for self-hosting blitzyxsc-plus on any container host.
# Author: Blitz (blitzlabx)

FROM oven/bun:1.1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Copy source
COPY . .

# Build (optional — Bun runs TypeScript natively)
# RUN bun run build

# Set environment
ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0

EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8787/health || exit 1

# Run with Bun
CMD ["bun", "src/index.ts"]
