# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

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
RUN npm install --omit=dev

ENV PORT=3000
ENV NODE_ENV=production
ENV ORIGIN=http://localhost:3000

EXPOSE 3000

CMD ["node", "index.js"]
