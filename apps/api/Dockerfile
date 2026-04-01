FROM node:20-alpine AS base
RUN corepack enable && corepack prepare yarn@4.7.0 --activate
WORKDIR /app

# Copy workspace config
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Install dependencies
RUN yarn install --immutable

# Copy source
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

# Build shared first, then api
RUN yarn workspace @tiny-tools/shared build && yarn workspace api build

# Production
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main.js"]
