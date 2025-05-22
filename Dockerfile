ARG BUN_VERSION=1.2.14

FROM oven/bun:${BUN_VERSION}-alpine AS base
WORKDIR /app

COPY package.json bun.lockb* tsconfig.json ./

RUN bun install --production --frozen-lockfile

COPY . .

EXPOSE 8481

VOLUME /logs
VOLUME /config

CMD ["bun", "run", "src/main.ts", "/logs", "/config/config.yaml"]
