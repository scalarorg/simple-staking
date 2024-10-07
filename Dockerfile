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
ENV NEXT_PUBLIC_MEMPOOL_API APP_NEXT_PUBLIC_MEMPOOL_API 
ENV NEXT_PUBLIC_MEMPOOL_WEB APP_NEXT_PUBLIC_MEMPOOL_WEB 
ENV NEXT_PUBLIC_API_URL APP_NEXT_PUBLIC_API_URL 
ENV NEXT_PUBLIC_NETWORK APP_NEXT_PUBLIC_NETWORK 
ENV NEXT_PUBLIC_STAKING_AMOUNT APP_NEXT_PUBLIC_STAKING_AMOUNT 
ENV NEXT_PUBLIC_MINTING_AMOUNT APP_NEXT_PUBLIC_MINTING_AMOUNT 
ENV NEXT_PUBLIC_BURNING_AMOUNT APP_NEXT_PUBLIC_BURNING_AMOUNT 
ENV NEXT_PUBLIC_COVENANT_QUORUM APP_NEXT_PUBLIC_COVENANT_QUORUM 
ENV NEXT_PUBLIC_TAG APP_NEXT_PUBLIC_TAG 
ENV NEXT_PUBLIC_VERSION APP_NEXT_PUBLIC_VERSION 
ENV NEXT_PUBLIC_COVENANT_PUBKEYS APP_NEXT_PUBLIC_COVENANT_PUBKEYS 
ENV NEXT_PUBLIC_SERVICE_PUBKEY APP_NEXT_PUBLIC_SERVICE_PUBKEY 
ENV NEXT_PUBLIC_SERVICE_PRIVATE_KEY APP_NEXT_PUBLIC_SERVICE_PRIVATE_KEY 
ENV NEXT_PUBLIC_BTC_CHAIN_NAME APP_NEXT_PUBLIC_BTC_CHAIN_NAME 
ENV NEXT_PUBLIC_BITCOIN_NODE_ADDRESS APP_NEXT_PUBLIC_BITCOIN_NODE_ADDRESS 
ENV NEXT_PUBLIC_BITCOIN_NODE_PORT APP_NEXT_PUBLIC_BITCOIN_NODE_PORT 
ENV NEXT_PUBLIC_SSL_ENABLED APP_NEXT_PUBLIC_SSL_ENABLED 
ENV NEXT_PUBLIC_BITCOIN_WALLET APP_NEXT_PUBLIC_BITCOIN_WALLET
ENV NEXT_PUBLIC_BITCOIN_USER APP_NEXT_PUBLIC_BITCOIN_USER
ENV NEXT_PUBLIC_BITCOIN_PASSWORD APP_NEXT_PUBLIC_BITCOIN_PASSWORD
ENV NEXT_PUBLIC_BTC_ADDRESS APP_NEXT_PUBLIC_BTC_ADDRESS 
ENV NEXT_PUBLIC_BURN_CONTRACT_ADDRESS APP_NEXT_PUBLIC_BURN_CONTRACT_ADDRESS 
ENV NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS APP_NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS 
ENV NEXT_PUBLIC_BOND_HOLDER_ADDRESS APP_NEXT_PUBLIC_BOND_HOLDER_ADDRESS 
ENV NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY APP_NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY 
ENV NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY APP_NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY 
ENV NEXT_PUBLIC_DEFAULT_DAPP_CHAINS APP_NEXT_PUBLIC_DEFAULT_DAPP_CHAINS 
ENV NEXT_PUBLIC_SCALAR_SCANNER APP_NEXT_PUBLIC_SCALAR_SCANNER 

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
