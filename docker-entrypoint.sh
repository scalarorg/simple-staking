#!/usr/bin/env sh
set -Ex

# This method has been inspired by the comment here:
# https://github.com/vercel/next.js/discussions/17641#discussioncomment-339555
function apply_path {
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MEMPOOL_API#$MEMPOOL_API#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MEMPOOL_API2#$MEMPOOL_API2#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MEMPOOL_WEB#$MEMPOOL_WEB#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_API_URL#$API_URL#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_NETWORK#$NETWORK#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_STAKING_AMOUNT#$STAKING_AMOUNT#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MINTING_AMOUNT#$MINTING_AMOUNT#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BURNING_AMOUNT#$BURNING_AMOUNT#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_COVENANT_QUORUM#$COVENANT_QUORUM#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_TAG#$TAG#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_VERSION#$VERSION#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_COVENANT_PUBKEYS#$COVENANT_PUBKEYS#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_SERVICE_PUBKEY#$SERVICE_PUBKEY#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BTC_CHAIN_NAME#$BTC_CHAIN_NAME#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BTC_NODE_URL#$BTC_NODE_URL#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BTC_NODE_HOST#$BTC_NODE_HOST#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BTC_NODE_PORT#$BTC_NODE_PORT#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BTC_NODE_WALLET#$BTC_NODE_WALLET#g"    
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BTC_NODE_USER#$BTC_NODE_USER#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BTC_NODE_PASSWORD#$BTC_NODE_PASSWORD#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BTC_ADDRESS#$BTC_ADDRESS#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BURN_CONTRACT_ADDRESS#$BURN_CONTRACT_ADDRESS#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS#$SBTC_CONTRACT_ADDRESS#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BOND_HOLDER_ADDRESS#$BOND_HOLDER_ADDRESS#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY#$BOND_HOLDER_PUBLIC_KEY#g"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY#$BOND_HOLDER_PRIVATE_KEY#g"

}

apply_path
echo "Starting Nextjs"
exec "$@"
