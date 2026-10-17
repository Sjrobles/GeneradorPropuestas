#!/bin/sh
set -eu

attempt=1
max_attempts=60

until mongosh --quiet --host 127.0.0.1 --port 27017 \
  --eval "quit(db.adminCommand('ping').ok ? 0 : 1)" >/dev/null 2>&1; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "MongoDB no estuvo disponible después de ${max_attempts} intentos." >&2
    exit 1
  fi

  echo "Esperando MongoDB (${attempt}/${max_attempts})..."
  attempt=$((attempt + 1))
  sleep 1
done

echo "MongoDB disponible. Iniciando el backend de Ágora."
exec node /app/backend/dist/main.js
