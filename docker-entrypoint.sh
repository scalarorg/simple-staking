#!/bin/sh
set -Ex

apply_path() {
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MEMPOOL_API#$MEMPOOL_API#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MEMPOOL_WEB#$MEMPOOL_WEB#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_API_URL#$API_URL#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_DEFAULT_DAPP_CHAINS#$DEFAULT_DAPP_CHAINS#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_SCALAR_SCANNER#$SCALAR_SCANNER#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_VERSION#$VERSION#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_TAG#$TAG#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_HAVE_ONLY_CUSTODIAL#$HAVE_ONLY_CUSTODIAL#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_COVENANT_QUORUM#$COVENANT_QUORUM#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_COVENANT_PUBKEYS#$COVENANT_PUBKEYS#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_SERVICE_TAG#$SERVICE_TAG#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_GROUP_ALL_BTC_ADDRESS#$GROUP_ALL_BTC_ADDRESS#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#http://app_next_public_app_url#$APP_URL#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_SCALAR_NODE_URL#$SCALAR_NODE_URL#g"
}

apply_path
echo "Starting Nextjs"
exec "$@"