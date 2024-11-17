FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8481
VOLUME ["/config", "/logs"]
CMD ["node", "main.js", "/logs", "/config/config.yaml"]
