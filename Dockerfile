# Step 1. Rebuild the source code only when needed
FROM oven/bun:1 AS builder

RUN apt-get update && apt-get install -y python3 make gcc g++ python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json bun.lockb ./
# Install dependencies with bun
RUN bun install --no-optional || \
    (bun add -d node-gyp && bun install --no-optional)

COPY src ./src
COPY public ./public
COPY next.config.* .
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.js .
COPY docker-entrypoint.sh .

ENV NEXT_PUBLIC_MEMPOOL_API=APP_NEXT_PUBLIC_MEMPOOL_API
ENV NEXT_PUBLIC_MEMPOOL_WEB=APP_NEXT_PUBLIC_MEMPOOL_WEB
ENV NEXT_PUBLIC_API_URL=APP_NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DEFAULT_DAPP_CHAINS=APP_NEXT_PUBLIC_DEFAULT_DAPP_CHAINS
ENV NEXT_PUBLIC_SCALAR_SCANNER=APP_NEXT_PUBLIC_SCALAR_SCANNER

ENV NEXT_PUBLIC_VERSION=APP_NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_TAG=APP_NEXT_PUBLIC_TAG
ENV NEXT_PUBLIC_HAVE_ONLY_CUSTODIAL=APP_NEXT_PUBLIC_HAVE_ONLY_CUSTODIAL
ENV NEXT_PUBLIC_COVENANT_QUORUM=APP_NEXT_PUBLIC_COVENANT_QUORUM
ENV NEXT_PUBLIC_COVENANT_PUBKEYS=APP_NEXT_PUBLIC_COVENANT_PUBKEYS
ENV NEXT_PUBLIC_SERVICE_TAG=APP_NEXT_PUBLIC_SERVICE_TAG
ENV NEXT_PUBLIC_GROUP_ALL_BTC_ADDRESS=APP_NEXT_PUBLIC_GROUP_ALL_BTC_ADDRESS

ENV NEXT_PUBLIC_APP_URL=http://APP_NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SCALAR_NODE_URL=APP_NEXT_PUBLIC_SCALAR_NODE_URL

RUN bun run build

# Step 2. Production image, copy all the files and run next
FROM oven/bun:1-slim AS runner
RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bun", "server.js"]
STOPSIGNAL SIGTERM
