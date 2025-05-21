FROM oven/bun:1.1-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production
COPY . .
EXPOSE 8481
VOLUME ["/config", "/logs"]
# No need to specify config path as it will be auto-detected
CMD ["bun", "src/main.ts", "/logs"]
