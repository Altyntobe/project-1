# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Analytical Dashboard — Next.js 14 (App Router) приложение для аналитики продаж. Стек: TypeScript, TailwindCSS, PostgreSQL (Docker), Prisma ORM, NextAuth.js, Recharts, Zustand. Единственное приложение, без монорепо.

### Services

| Service | How to start | Port |
|---------|-------------|------|
| PostgreSQL | `sudo docker compose up -d` | 5432 |
| Next.js dev server | `npm run dev` | 3000 |

Docker daemon must be started first: `sudo dockerd &>/tmp/dockerd.log &` (wait ~3s).

### Environment

The `.env` file is required but git-ignored. If missing, create it:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analytical_dashboard?schema=public"
NEXTAUTH_SECRET="cursor-cloud-dev-secret-key-2026"
NEXTAUTH_URL="http://localhost:3000"
```

After `npm install`, generate Prisma client and push schema:
```
npm run db:generate
npm run db:push
```

### Commands

- **Lint**: `npm run lint` — ESLint via `next lint`. Exits 0 with warnings only (no errors in codebase).
- **Build**: `npm run build` — Has a pre-existing TS type error (`t.products.trend.rising`), so production build fails. Dev server works fine.
- **Dev**: `npm run dev` — starts Next.js dev server on port 3000.
- **DB Studio**: `npm run db:studio` — Prisma Studio GUI for database browsing.

### Gotchas

- No test framework is configured in this project (no jest/vitest/cypress/playwright).
- The `npm run build` fails due to a pre-existing TypeScript error in `app/products/[id]/page.tsx:151` where `t.products.trend` is a string but code accesses `.rising`/`.falling`/`.stable`. The dev server (`npm run dev`) works fine because it doesn't enforce strict type checks.
- FakeStore API (`fakestoreapi.com`) may intermittently fail when loading data; DummyJSON usually works fine. Refreshing the dashboard after loading retries shows all data.
- Docker needs `fuse-overlayfs` storage driver and `iptables-legacy` in nested container environments (Cloud Agent VMs).
