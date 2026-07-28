# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies from the locked dependency graph. The cache keeps repeat
# builds on Coolify from downloading the full npm cache again.
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy build output
COPY --from=builder /app/build ./
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund

ENV PORT=3000
ENV NODE_ENV=production
ENV ORIGIN=http://localhost:3000

EXPOSE 3000

CMD ["node", "index.js"]
