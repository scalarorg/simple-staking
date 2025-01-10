#!/bin/sh
set -Ex

apply_path() {
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_MEMPOOL_API#$MEMPOOL_API#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_API_URL#$API_URL#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_SCALAR_SCANNER#$SCALAR_SCANNER#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#http://app_next_public_app_url#$APP_URL#g"

    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_SCALAR_API_URL#$SCALAR_API_URL#g"
}

apply_path
echo "Starting Nextjs"
exec "$@"
