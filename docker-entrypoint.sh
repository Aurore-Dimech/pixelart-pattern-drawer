#!/bin/sh
set -e

echo "==> Running Prisma migrations..."
npx prisma migrate deploy

echo "==> Running seed (skip if already seeded)..."
npx prisma db seed

echo "==> Starting Next.js..."
exec node_modules/.bin/next start
