FROM node:22-alpine

RUN apk add --no-cache curl gnupg bash
RUN curl -Ls https://cli.doppler.com/install.sh | sh

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/extension/package.json ./packages/extension/
COPY types/package.json ./types/

RUN pnpm install --no-frozen-lockfile

COPY . .

# Build the types package first
WORKDIR /app/types
RUN pnpm run build

WORKDIR /app/packages/server
RUN pnpm install

CMD ["/bin/bash", "-c", "export DOPPLER_TOKEN=\"$(cat /run/secrets/doppler_token)\" && doppler run -- pnpm run start:dev:docker"]

