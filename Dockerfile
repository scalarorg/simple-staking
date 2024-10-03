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
COPY package.json yarn.lock* ./
# Omit --production flag for TypeScript devDependencies
RUN yarn --frozen-lockfile

COPY networks ./networks
COPY chains ./chains
COPY src ./src
COPY public ./public
COPY next.config.mjs .
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.js .
COPY docker-entrypoint.sh .

# We replace NEXT_PUBLIC_* variables here with placeholders
# as next.js automatically replaces those during building
# Later the docker-entrypoint.sh script finds such variables and replaces them
# with the docker environment variables we have set
# Variables for create btc transaction should be config somewhere in the backend
# So transaction logic can be write in the backend
RUN NEXT_PUBLIC_MEMPOOL_API=APP_NEXT_PUBLIC_MEMPOOL_API \
    NEXT_PUBLIC_MEMPOOL_API2=APP_NEXT_PUBLIC_MEMPOOL_API2 \
    NEXT_PUBLIC_MEMPOOL_WEB=APP_NEXT_PUBLIC_MEMPOOL_WEB \
    NEXT_PUBLIC_API_URL=APP_NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_NETWORK=APP_NEXT_PUBLIC_NETWORK \
    NEXT_PUBLIC_STAKING_AMOUNT=APP_NEXT_PUBLIC_STAKING_AMOUNT \
    NEXT_PUBLIC_MINTING_AMOUNT=APP_NEXT_PUBLIC_MINTING_AMOUNT \
    NEXT_PUBLIC_BURNING_AMOUNT=APP_NEXT_PUBLIC_BURNING_AMOUNT \
    NEXT_PUBLIC_COVENANT_QUORUM=APP_NEXT_PUBLIC_COVENANT_QUORUM \
    NEXT_PUBLIC_TAG=APP_NEXT_PUBLIC_TAG \
    NEXT_PUBLIC_VERSION=APP_NEXT_PUBLIC_VERSION \
    NEXT_PUBLIC_COVENANT_PUBKEYS=APP_NEXT_PUBLIC_COVENANT_PUBKEYS \
    NEXT_PUBLIC_SERVICE_PUBKEY=APP_NEXT_PUBLIC_SERVICE_PUBKEY \
    NEXT_PUBLIC_SERVICE_PRIVATE_KEY=APP_NEXT_PUBLIC_SERVICE_PRIVATE_KEY \
    NEXT_PUBLIC_BTC_CHAIN_NAME=APP_NEXT_PUBLIC_BTC_CHAIN_NAME \
    NEXT_PUBLIC_BTC_NODE_URL=APP_NEXT_PUBLIC_BTC_NODE_URL \
    NEXT_PUBLIC_BTC_NODE_HOST=APP_NEXT_PUBLIC_BTC_NODE_HOST \
    NEXT_PUBLIC_BTC_NODE_PORT=APP_NEXT_PUBLIC_BTC_NODE_PORT \
    NEXT_PUBLIC_BTC_NODE_WALLET=APP_NEXT_PUBLIC_BTC_NODE_WALLET \
    NEXT_PUBLIC_BTC_NODE_USER=APP_NEXT_PUBLIC_BTC_NODE_USER \
    NEXT_PUBLIC_BTC_NODE_PASSWORD=APP_NEXT_PUBLIC_BTC_NODE_PASSWORD \
    NEXT_PUBLIC_BTC_ADDRESS=APP_NEXT_PUBLIC_BTC_ADDRESS \
    NEXT_PUBLIC_BURN_CONTRACT_ADDRESS=APP_NEXT_PUBLIC_BURN_CONTRACT_ADDRESS \
    NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS=APP_NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS \
    NEXT_PUBLIC_BOND_HOLDER_ADDRESS=APP_NEXT_PUBLIC_BOND_HOLDER_ADDRESS \
    NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY=APP_NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY \
    NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY=APP_NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY \
    NEXT_PUBLIC_DEFAULT_DAPP_CHAINS=APP_NEXT_PUBLIC_DEFAULT_DAPP_CHAINS \
    NEXT_PUBLIC_SCALAR_SCANNER=APP_NEXT_PUBLIC_SCALAR_SCANNER \
    yarn build

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
