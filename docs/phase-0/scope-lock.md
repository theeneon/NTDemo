# Phase 0 — Scope lock

## Product question

Does choosing a four-ninja squad, watching it execute readable automated tactics, earning rewards, and making the squad visibly stronger form a clear and satisfying browser loop?

The demo succeeds by answering that question. It is not a reduced production launch.

## Locked vertical slice

| Area | Locked scope |
| --- | --- |
| Roster | Eight playable ninjas across striker, guard, support, and control roles |
| Squad | Exactly four selected ninjas in two front and two back slots |
| Campaign | Five ordered encounters with first-clear rewards |
| Dungeon | One repeatable encounter with a compact reward table |
| Combat | Automated, deterministic, speed-based 4v4 combat |
| Rules | Basic attacks, active skills, passives, cooldowns, damage, healing, buffs, debuffs, damage/healing over time, stun, defeat, victory, and rewards |
| Progression | Squad experience, ninja levels, a small equipment set, and one clear equipment-upgrade path |
| Summon | One free, clearly labeled demonstration with visible probabilities and no purchase path |
| Persistence | Versioned LocalStorage save with validation, reset, migration, and corruption recovery |
| Presentation | Responsive desktop/mobile browser UI with mouse, keyboard, touch, and reduced-motion support |

## Essential screens

1. Roster
2. Squad selection
3. Campaign and dungeon selection
4. Battle
5. Results
6. Ninja upgrade and equipment
7. Free summon demonstration

## Explicitly deferred

- Real-money purchases, premium currency sales, storefronts, or payment/store compliance.
- Accounts, authentication, cloud saves, cross-device progression, authoritative services, and anti-cheat.
- PvP, matchmaking, guilds, friends, chat, player trading, and auction house.
- Battle pass, daily missions, live-operations tools, push notifications, and production analytics.
- Full campaign, production-scale content, localization, app-store packaging, and native applications.
- Elaborate narrative, cinematic sequences, branching dialogue, or a tutorial separate from the interface.
- User-generated content, modding, accessibility settings beyond the demo needs, or production customer support tooling.

## Technical constraints inherited by later phases

- React and TypeScript own all screens and battle components.
- Vite produces local and production builds.
- Tailwind CSS supplies layout, responsive behavior, and simple transitions.
- CSS keyframes and the Web Animations API present battle events; Phaser and canvas are excluded.
- Zustand owns player and transient presentation state.
- Typed JSON or TypeScript modules own immutable content.
- The combat engine is pure, deterministic, and UI-independent.
- React consumes a serializable `BattleEvent` stream and does not reimplement combat outcomes.
- Vitest verifies rules and Playwright verifies browser flows.
- Vercel hosts preview and production builds.

## Content budget

The eight playable ninjas should demonstrate role interaction, not maximize novelty. The minimum useful composition is:

- Two strikers: single-target burst and area damage.
- Two guards: mitigation/taunt-style targeting influence and self-sustain.
- Two supports: direct healing and buff/cleanse utility.
- Two controllers: speed manipulation, debuffs, and stun.

Enemy content may reuse six archetypes across the five campaign encounters and dungeon. Encounters should remix formations, levels, and skill combinations before commissioning more unique enemies.

## Change control

A requested change enters this demo only when at least one condition is true:

1. It is required to complete or understand the locked loop.
2. It replaces an existing item of comparable effort without extending the schedule.
3. A tested defect prevents an acceptance criterion from passing.

All other requests enter a post-demo backlog. Any change that adds backend services, payments, social systems, or production content volume requires a new scope decision.

## Approval record

- Product question accepted: Pending owner approval
- Vertical slice accepted: Pending owner approval
- Deferred list accepted: Pending owner approval
- Combat reference accepted: Pending owner approval
- Wireframes accepted: Pending owner approval
- Acceptance and assets accepted: Pending owner approval

