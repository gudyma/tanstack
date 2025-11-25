# ==========================
# Stage 1: Build Stage
# ==========================
FROM oven/bun:latest AS builder

# Set working directory
WORKDIR /app

# Copy only dependency files first for caching
COPY package.json tsconfig.json intlayer.config.ts vite.config.ts ./

# Install dependencies using Bun
RUN bun install

# Copy source code
COPY src ./src

# Build TypeScript project
RUN bun run build

# ==========================
# Stage 2: Runtime Stage
# ==========================
FROM oven/bun:alpine AS runner

# Set working directory
WORKDIR /app

# Copy only runtime essentials from build stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output

# Expose application port
EXPOSE 3000

# Run the compiled output
CMD ["bun", "run", ".output/server/index.mjs"]
