# syntax=docker/dockerfile:1.7

FROM node:20-bullseye-slim AS base
WORKDIR /srv/app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build --workspace=@eclip/shared
RUN npm run build --workspace=@eclip/backend
RUN npm prune --omit=dev

FROM node:20-bullseye-slim AS runner
WORKDIR /srv/app
ENV NODE_ENV=production

COPY --from=base /srv/app/package*.json ./
COPY --from=base /srv/app/apps ./apps
COPY --from=base /srv/app/packages ./packages
COPY --from=base /srv/app/node_modules ./node_modules

WORKDIR /srv/app/apps/backend
EXPOSE 8080
ENV PORT=8080

CMD ["node", "dist/index.js"]
