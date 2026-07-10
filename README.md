<<<<<<< HEAD
# Ninja Tactics web demo

Phase 1 provides the responsive React application foundation for the Ninja Tactics browser vertical slice. It includes the shared shell, seven direct-link routes, placeholder gameplay screens, Zustand stores, Tailwind design system, automated checks, and Vercel SPA deployment configuration.

The approved planning baseline remains in [docs/phase-0/README.md](docs/phase-0/README.md).

## Stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Zustand 5
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

The Vercel rewrite returns `index.html` for application routes, so every route works when opened or refreshed directly. Phase 0 documents remain available under `/docs/phase-0/`.

## Deploy to Vercel

Import this repository into Vercel. The committed configuration runs `npm run build`, publishes `dist`, provides SPA routing, adds security headers, and caches hashed Vite assets. No environment variables are required for Phase 1.
=======
NT Demo
>>>>>>> f842aaaf48715c33d54c23373455d8c41386728c
