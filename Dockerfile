# ==========================
# Stage 1: Build Stage
# ==========================
FROM oven/bun:latest AS builder

# Set working directory
WORKDIR /app

# Copy only dependency files first for caching
COPY package.json tsconfig.json intlayer.config.ts vite.config.ts ./

# Install dependencies using Bun
RUN bun install --production --verbose

# Copy source code
COPY . .

# Build TypeScript project
RUN bun build --compile --minify --outfile mira-app

# ==========================
# Stage 2: Runtime Stage
# ==========================
FROM gcr.io/distroless/base-debian12:nonroot AS runner

ENV NODE_ENV=production

ARG BUILD_APP_PORT=3000
ENV APP_PORT=${BUILD_APP_PORT}
EXPOSE ${APP_PORT}

WORKDIR /app

# Copy the compiled executable from the build stage
COPY --from=builder /app/mira-app .

ENTRYPOINT ["./mira-app"]
