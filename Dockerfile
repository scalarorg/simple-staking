# Step 1. Rebuild the source code only when needed
FROM node:20-alpine3.19 AS builder

RUN apk add python3 make gcc g++

WORKDIR /app
COPY remotebtclib ./remotebtclib

WORKDIR /app/remotebtclib/bitcoin-flow
RUN yarn
WORKDIR /app/remotebtclib/vault
RUN yarn

WORKDIR /app
COPY package.json package-lock.json ./
# Omit --production flag for TypeScript devDependencies
RUN npm install --frozen-lockfile

COPY chains ./chains
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

RUN npm run build

# Step 2. Production image, copy all the files and run next
FROM node:22-alpine3.19 AS runner
RUN apk add --no-cache jq
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
CMD ["node", "server.js"]
STOPSIGNAL SIGTERM
