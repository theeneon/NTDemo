# Ninja Tactics web demo

Phase 0 is an approval-ready definition of the Ninja Tactics browser vertical slice. It includes the locked scope, screen flow and seven low-fidelity wireframes, deterministic combat rules, measurable acceptance criteria, and a production-ready placeholder asset inventory.

## Review locally

Use Node.js 20 or newer:

```text
npm run dev
```

Open `http://localhost:4173`. The server reads only the generated `dist` directory and rebuilds it before starting.

## Verify

```text
npm test
npm run build
```

The verification checks required Phase 0 artifacts, local links, duplicate HTML IDs, and the Vercel configuration. The build uses only Node.js built-ins and has no package dependencies.

## Deploy to Vercel

Import this repository into Vercel. The committed configuration runs `npm run build` and publishes `dist`. No environment variables or external services are required for Phase 0.

## Source of truth

See [docs/phase-0/README.md](docs/phase-0/README.md). The web portal is the review surface; the Markdown files are the durable planning baseline for Phases 1–7.
