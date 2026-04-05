FROM node:20-bookworm-slim

ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && mkdir -p /app "$PNPM_HOME" \
  && chown -R node:node /app /home/node \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/backend/package.json apps/backend/package.json

RUN pnpm install --filter backend... --frozen-lockfile

COPY --chown=node:node apps/backend apps/backend

WORKDIR /app/apps/backend

EXPOSE 5000

CMD ["pnpm", "start"]
