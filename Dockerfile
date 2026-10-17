# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS backend-build

WORKDIR /workspace/backend
RUN corepack enable && corepack prepare pnpm@11.19.0 --activate

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ ./
RUN pnpm run build && pnpm prune --prod


FROM node:24-bookworm-slim AS frontend-build

WORKDIR /workspace/frontend

ARG VITE_API_MODE=backend
ARG VITE_API_URL=/api/v1
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_MODE=${VITE_API_MODE} \
    VITE_API_URL=${VITE_API_URL} \
    VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM node:24-bookworm-slim AS runtime

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
      ca-certificates \
      curl \
      gettext-base \
      gnupg \
      nginx \
      supervisor \
    && install -d -m 0755 /usr/share/keyrings \
    && curl --fail --silent --show-error --location \
      https://www.mongodb.org/static/pgp/server-8.0.asc \
      | gpg --dearmor --output /usr/share/keyrings/mongodb-server-8.0.gpg \
    && echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" \
      > /etc/apt/sources.list.d/mongodb-org-8.0.list \
    && apt-get update \
    && apt-get install --yes --no-install-recommends mongodb-org mongodb-mongosh \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default

ENV NODE_ENV=production \
    APP_PORT=8080 \
    BACKEND_PORT=3000 \
    MONGODB_URI=mongodb://127.0.0.1:27017/agora

WORKDIR /app/backend
COPY --from=backend-build /workspace/backend/package.json ./package.json
COPY --from=backend-build /workspace/backend/node_modules ./node_modules
COPY --from=backend-build /workspace/backend/dist ./dist

COPY --from=frontend-build /workspace/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf.template /etc/nginx/templates/agora.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/agora.conf
COPY docker/entrypoint.sh /usr/local/bin/agora-entrypoint
COPY docker/start-backend.sh /usr/local/bin/start-agora-backend

RUN chmod +x /usr/local/bin/agora-entrypoint /usr/local/bin/start-agora-backend \
    && mkdir -p /data/db /var/log/supervisor \
    && chown -R mongodb:mongodb /data/db

VOLUME ["/data/db"]
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/agora-entrypoint"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
