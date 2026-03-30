FROM node:20-alpine AS base
RUN corepack enable && corepack prepare yarn@4.7.0 --activate
WORKDIR /app

# Copy workspace config
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/

# Install dependencies
RUN yarn install --immutable

# Copy source
COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/

# Build
RUN yarn workspace web build

# Production
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/apps/web/.output .output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
