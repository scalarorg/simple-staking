#!/usr/bin/env sh
set -Ex

# This method has been inspired by the comment here:
# https://github.com/vercel/next.js/discussions/17641#discussioncomment-339555
function apply_path {
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MEMPOOL_API#$MEMPOOL_API#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MEMPOOL_WEB#$MEMPOOL_WEB#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_API_URL#$API_URL#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_DEFAULT_DAPP_CHAINS#$DEFAULT_DAPP_CHAINS#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_SCALAR_SCANNER#$SCALAR_SCANNER#g"
}

apply_path
echo "Starting Nextjs"
exec "$@"
