#!/bin/sh
set -eu

# Render define PORT. En ejecución local se usa APP_PORT. NestJS siempre queda
# en un puerto interno y Nginx expone el único puerto público del contenedor.
public_port="${APP_PORT:-${PORT:-8080}}"
backend_port="${BACKEND_PORT:-3000}"

export APP_PORT="$public_port"
export BACKEND_PORT="$backend_port"
export PORT="$backend_port"
export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/agora}"
export FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-http://localhost:${public_port},http://127.0.0.1:${public_port}}"

mkdir -p /data/db /var/log/supervisor
chown -R mongodb:mongodb /data/db

envsubst '${APP_PORT}' \
  < /etc/nginx/templates/agora.conf.template \
  > /etc/nginx/conf.d/agora.conf

exec "$@"
