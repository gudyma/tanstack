###############################
# 1) Build stage (Node + Vite)
###############################
FROM node:24-slim AS build
WORKDIR /app

# 1. Install deps (dev + prod) using npm
#    We use npm here even though you use Bun locally – package.json is standard.
COPY package.json ./
RUN npm install

# 2. Copy the rest of the source
COPY . .

# 3. Build TanStack Start + Intlayer with Vite
#    Call Vite directly with node to avoid any npx/path/permission weirdness.
RUN node node_modules/vite/bin/vite.js build

# 4. Drop devDependencies so only production deps remain
RUN npm prune --omit=dev


###############################
# 2) Minimal runtime (Bun distroless)
###############################
FROM oven/bun:distroless

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Built Nitro/TanStack output
COPY --from=build /app/.output ./.output

# Runtime dependencies (pg, mqtt, etc.)
COPY --from=build /app/node_modules ./node_modules

# (Optional) just for metadata/debugging
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

# oven/bun:distroless has ENTRYPOINT ["/usr/local/bin/bun"],
# so this runs: bun .output/server/index.mjs
CMD [".output/server/index.mjs"]
