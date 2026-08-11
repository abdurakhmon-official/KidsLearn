# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- deps
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------- builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `NEXT_PUBLIC_*` client bundle'ga **build vaqtida** kiradi — runtime
# `environment` bilan berish kech bo'ladi. Bu manzil brauzerdan ko'rinadigan
# bo'lishi kerak (`localhost`), konteyner ichidagi `http://api:9100` emas.
ARG NEXT_PUBLIC_API_URL=http://localhost:9100/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------- runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# `standalone` server o'z `node_modules` ini ichiga oladi.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
