# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22-alpine
ARG NGINX_VERSION=1.29-alpine

FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.0.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/web/package.json packages/web/package.json
COPY packages/web/scripts packages/web/scripts
COPY packages/react/package.json packages/react/package.json
COPY packages/demo/package.json packages/demo/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build-only

FROM nginx:${NGINX_VERSION} AS runtime

ARG APP_VERSION=0.0.0
LABEL org.opencontainers.image.title="Flyfish Viewer" \
      org.opencontainers.image.description="Pure web multi-format file viewer demo with standalone document compare page." \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.source="https://github.com/flyfish-dev/file-viewer" \
      org.opencontainers.image.licenses="Apache-2.0"

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
