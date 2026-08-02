FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Off until admin.* DNS is ready — admin stays on the storefront host.
ARG NEXT_PUBLIC_ADMIN_HOST_SPLIT=false
ENV NEXT_PUBLIC_ADMIN_HOST_SPLIT=$NEXT_PUBLIC_ADMIN_HOST_SPLIT

ARG NEXT_PUBLIC_ADMIN_HOST=admin.marinapizzas.com.au
ENV NEXT_PUBLIC_ADMIN_HOST=$NEXT_PUBLIC_ADMIN_HOST

ARG NEXT_PUBLIC_ADMIN_ORIGIN=https://admin.marinapizzas.com.au
ENV NEXT_PUBLIC_ADMIN_ORIGIN=$NEXT_PUBLIC_ADMIN_ORIGIN

ARG NEXT_PUBLIC_WEB_ORIGIN=https://marinapizzas.com.au
ENV NEXT_PUBLIC_WEB_ORIGIN=$NEXT_PUBLIC_WEB_ORIGIN

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
