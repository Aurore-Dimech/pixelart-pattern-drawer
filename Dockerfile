FROM node:20-alpine

# Required for Prisma query engine on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client for Linux (overwrites any macOS-generated client)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Directory for the SQLite database (mounted as a volume at runtime)
RUN mkdir -p /data

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["/app/docker-entrypoint.sh"]
