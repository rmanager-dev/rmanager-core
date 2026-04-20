# syntax=docker/dockerfile:1.4
# Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy packages and install them
RUN echo '{"workspaces": ["rmanager-web", "rmanager-shared"]}' > package.json
COPY package-lock.json ./
COPY rmanager-web/package.json ./rmanager-web/
COPY rmanager-shared/package.json ./rmanager-shared/
RUN npm ci

# Copy source code
COPY rmanager-web/ ./rmanager-web/
COPY rmanager-shared/ ./rmanager-shared/

# Inject .env file in the build command to get the NEXT_PUBLIC envs inside the final build
RUN --mount=type=secret,id=envfile,target=/app/rmanager-web/.env \
    npm run build --workspace=rmanager-web

# Run
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

# standalone includes node_modules it needs
COPY --from=builder /app/rmanager-web/.next/standalone ./
COPY --from=builder /app/rmanager-web/.next/static ./rmanager-web/.next/static
COPY rmanager-web/public/ ./rmanager-web/public/

EXPOSE 3000
CMD ["node", "rmanager-web/server.js"]
