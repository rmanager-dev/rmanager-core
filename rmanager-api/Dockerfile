FROM node:22-alpine
WORKDIR /app

# Install deps before source code to cache packages
RUN echo '{"workspaces": ["rmanager-api", "rmanager-shared"]}' > package.json
COPY package-lock.json ./
COPY rmanager-api/package.json ./rmanager-api/
COPY rmanager-shared/package.json ./rmanager-shared/
RUN npm ci


# Copy source code
COPY rmanager-api/ ./rmanager-api/
COPY rmanager-shared/ ./rmanager-shared/

ENV NODE_ENV=production

CMD ["npx", "tsx", "--tsconfig", "rmanager-api/tsconfig.json", "rmanager-api/src/index.ts"]
