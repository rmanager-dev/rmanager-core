FROM oven/bun:1.3.5-alpine
WORKDIR /app

# Install deps before source code to cache packages
# Install API deps
COPY rmanager-api/package.json ./rmanager-api/
RUN cd rmanager-api && bun install

#Install shared deps
COPY rmanager-shared/package.json ./rmanager-shared/
RUN cd rmanager-shared && bun install


# Copy source code
COPY rmanager-api/ ./rmanager-api/
COPY rmanager-shared/ ./rmanager-shared/

ENV NODE_ENV=production

CMD ["bun", "rmanager-api/src/index.ts"]
