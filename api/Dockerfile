# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl postgresql postgresql-contrib su-exec

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

COPY . .

RUN set -eux; \
    PGBIN="$(dirname "$(ls -d /usr/libexec/postgresql*/initdb | head -1)")"; \
    export PATH="$PGBIN:$PATH"; \
    export PGDATA=/var/lib/pgbuild; \
    export DATABASE_URL="postgres://postgres@127.0.0.1:5432/kidslearn_build"; \
    mkdir -p /run/postgresql "$PGDATA"; \
    chown postgres:postgres /run/postgresql "$PGDATA"; \
    su-exec postgres initdb -D "$PGDATA" --auth=trust --username=postgres; \
    su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses=127.0.0.1" -w start; \
    su-exec postgres createdb -h 127.0.0.1 -U postgres kidslearn_build; \
    npx prisma migrate deploy; \
    npx prisma generate --sql; \
    su-exec postgres pg_ctl -D "$PGDATA" -w stop; \
    rm -rf "$PGDATA"; \
    NODE_OPTIONS="--max-old-space-size=1536" yarn build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV STAGE=production

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 9100

CMD ["sh", "-c", "npx prisma migrate deploy && (node dist/prisma/seed.js || echo 'DIQQAT: seed yiqildi, API baribir ishga tushmoqda') && node dist/index.js"]
