FROM node:20-bookworm-slim AS builder

ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && mkdir -p /app "$PNPM_HOME" \
  && chown -R node:node /app /home/node

WORKDIR /app
USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --filter frontend... --frozen-lockfile --prod=false

COPY --chown=node:node apps/frontend apps/frontend

ARG VITE_API_BASE=/api/v1
ENV VITE_API_BASE=$VITE_API_BASE

RUN pnpm --filter frontend build

FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
