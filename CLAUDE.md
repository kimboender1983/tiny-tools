# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies
yarn install

# Development (both apps in parallel)
yarn dev

# Development (individual)
yarn dev:web          # Nuxt 3 frontend on localhost:3000
yarn dev:api          # NestJS backend on localhost:3001

# Build (builds shared package first, then both apps)
yarn build
yarn build:web
yarn build:api

# Lint
yarn lint

# NestJS-specific
yarn workspace api dev         # Watch mode
yarn workspace api build       # Compile to dist/
```

Requires Node.js >= 20.

## Architecture

**Yarn workspaces monorepo** with three packages:

- `apps/web` — Nuxt 3 (SSR) frontend with Tailwind CSS, Pinia, Vue 3 Composition API
- `apps/api` — NestJS backend with MongoDB/Mongoose, JWT auth, CMS
- `packages/shared` (`@tiny-tools/shared`) — Shared TypeScript interfaces and constants consumed by both apps

### Tool Pattern

Each tool follows a strict 3-file pattern:
1. **Composable** (`composables/use{Tool}.ts`) — All logic, reactive state, session storage persistence, debounced processing
2. **Component** (`components/tools/{Tool}.vue`) — UI with toolbar, split panes, file drop, error display
3. **Page** (`pages/{tool-slug}.vue`) — SEO setup (useHead, JSON-LD schemas), wraps component in `UiToolPageLayout`, provides hardcoded SEO content in `#seo-content` slot

All processing is client-side. No data leaves the browser.

### CMS Integration

Tool pages have hardcoded Vue components but can fetch SEO content (article, FAQ, related tools) from the NestJS CMS API via `/content/pages/:slug`. This allows updating SEO content without redeployment.

The admin panel lives at `/admin/*` with SSR disabled (`routeRules`). It's protected by the `admin` middleware which checks JWT auth state. The admin layout (`layouts/admin.vue`) provides a sidebar navigation.

### API Structure

NestJS modules:
- **AuthModule** — JWT strategy via Passport, admin guard, auto-seeds admin user from env vars on startup
- **CmsModule** — CRUD for pages, blog posts, categories, media. All endpoints at `/cms/*` protected by `JwtAuthGuard` + `AdminGuard`
- **PublicContentModule** — Read-only endpoints at `/content/*` (no auth). Only returns `status: 'published'` documents. Consumed by Nuxt SSR.
- **HealthModule** — `GET /health` for Railway health checks

### Frontend API Layer

Three composables form the API layer:
- `useApi()` — Typed `$fetch` wrapper using `runtimeConfig.public.apiUrl`. Adds Bearer token from `auth_token` cookie when `authenticated: true`.
- `useAuth()` — Login/logout, token management via cookies (`auth_token` 7d, `auth_refresh_token` 30d), user state
- `useCms()` — CRUD helpers for admin panel (pages, blogPosts, categories, media)

## Styling

- **Tailwind CSS** with custom tokens defined in `tailwind.config.ts`: `brand-*` (blue), `surface-*` / `surface-dark-*`, `page-light` / `page-dark`
- **Utility classes** in `assets/css/main.css`: `.tool-card`, `.btn-primary`, `.btn-secondary`, `.input-field`
- **Dark mode**: class-based (`dark:` prefix), managed by `@nuxtjs/color-mode` with system preference detection
- **Fonts**: Inter (UI), JetBrains Mono (code) — loaded from Google Fonts
- **Icons**: `lucide-vue-next` — referenced by string name in TOOLS constant, resolved dynamically in components

## Shared Package

Import shared types and constants:
```typescript
import type { IPage, IBlogPost, ISeoFields } from '@tiny-tools/shared'
import { TOOLS, TOOL_CATEGORIES } from '@tiny-tools/shared'
```

The `TOOLS` array is the single source of truth for tool metadata (name, slug, description, icon, category, keywords). It drives the homepage grid, header nav, command palette, and sitemap generation.

## Environment Variables

**Web** (`apps/web/.env`): `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_API_URL`, `NUXT_PUBLIC_ADSENSE_ID`

**API** (`apps/api/.env`): `MONGO_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, `PORT`

## Adding a New Tool

1. Add entry to `TOOLS` array in `packages/shared/src/constants/tools.ts`
2. Create `composables/use{Tool}.ts` with reactive state + processing logic
3. Create `components/tools/{Tool}.vue` with UI
4. Create `pages/{tool-slug}.vue` with SEO meta, ToolPageLayout wrapper, and SEO content
