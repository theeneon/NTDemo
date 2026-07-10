<<<<<<< HEAD

# Ninja Tactics web demo

Phases 1–2 provide the responsive React application foundation and validated content pipeline for the Ninja Tactics browser vertical slice. The project includes the shared game shell, direct-link routes, placeholder gameplay screens, immutable content definitions, mutable player state, seeded randomness, automated checks, and Vercel SPA deployment configuration.

The approved planning baseline remains in [docs/phase-0/README.md](docs/phase-0/README.md).

## Stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Zustand 5
- Zod 4 content schemas
- Vitest and Playwright

## Local development

Use Node.js 20.19 or newer, then:

```text
pnpm install
pnpm dev
```

Vite prints the local URL, normally `http://localhost:5173`.

## Quality commands

```text
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:e2e
pnpm build
pnpm preview
```

## Routes

- `/roster`
- `/squad`
- `/campaign`
- `/battle`
- `/results`
- `/upgrades`
- `/summon`
- `/content-lab` — validated content, legal squad, and seeded RNG diagnostics

The Vercel rewrite returns `index.html` for application routes, so every route works when opened or refreshed directly. Phase 0 documents remain available under `/docs/phase-0/`.

## Deploy to Vercel

Import this repository into Vercel. The committed configuration runs `npm run build`, publishes `dist`, provides SPA routing, adds security headers, and caches hashed Vite assets. No environment variables are required for Phase 1.
=======

NT Demo

> > > > > > > f842aaaf48715c33d54c23373455d8c41386728c
