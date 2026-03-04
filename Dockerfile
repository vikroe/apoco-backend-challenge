FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json yarn.lock tsconfig.json ./
COPY src ./src
RUN yarn tsc -p tsconfig.json

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node package.json yarn.lock ./
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build
RUN mkdir -p /app/.cache/mikro-orm && chown -R node:node /app

EXPOSE 8080

USER node

CMD ["node", "build/index.js"]
