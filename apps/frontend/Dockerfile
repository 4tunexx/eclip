# syntax=docker/dockerfile:1.7

FROM node:20-bullseye-slim AS base
WORKDIR /srv/app

COPY package*.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build --workspace=@eclip/shared
RUN npm run build --workspace=@eclip/frontend
RUN npm prune --omit=dev

FROM node:20-bullseye-slim AS runner
WORKDIR /srv/app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=base /srv/app/apps ./apps
COPY --from=base /srv/app/packages ./packages
COPY --from=base /srv/app/node_modules ./node_modules

WORKDIR /srv/app/apps/frontend
EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
