# Phase 0 — Demo acceptance checklist

These are release criteria for the complete demo, defined now so later phases can be tested against observable outcomes. A check passes only with recorded test evidence or a named manual-QA result.

## Core player loop

- [ ] On a new save, a player can inspect the roster, select four unique ninjas, enter campaign encounter 1, finish battle, see rewards, improve one ninja, return to squad, and replay without outside instruction.
- [ ] A typical first-run completion takes no more than 10 minutes excluding time intentionally spent reading combat logs or roster details.
- [ ] The primary action is identifiable on all seven screens and never competes with more than two secondary actions of equal visual weight.
- [ ] The roster, squad, campaign, battle, results, upgrade, and summon screens provide every relevant loading, empty, success, disabled, and recoverable error state.
- [ ] The free summon is labeled as a demonstration, shows exact rank probabilities before use, works once, and exposes no paid action.
- [ ] Updated ninja power is visible on returning to the squad screen after an upgrade.

## Combat correctness

- [ ] The same content version, squads, ordered decisions, and seed produce byte-equivalent normalized `BattleEvent` sequences and the same summary.
- [ ] A batch of at least 50 representative seeded 4v4 battles completes without an infinite loop, illegal target, non-finite stat, negative health, stale status, or source-data mutation.
- [ ] Every battle ends within 100 total owner turns; the limit creates a controlled defeat and diagnostic event.
- [ ] Automated tests cover speed/tie order, every target selector, damage rounding, healing/overheal, cooldowns, status refresh/expiry, stun, passives, simultaneous effects, defeat, victory, draw, turn limit, and deterministic replay.
- [ ] Scenario tests include at least one battle using each of the eight playable ninjas and every demo status category.
- [ ] Reward application is idempotent: reopening or refreshing results cannot duplicate currency, experience, equipment, completion, or first-clear rewards.

## Battle presentation

- [ ] A complete 4v4 event log plays at 1× and 2× without ordering differences, overlap, missed cleanup, or a result-screen race.
- [ ] Pause stops presentation at an event boundary; resume continues once; skip applies the remaining log once and opens the correct result.
- [ ] Unit defeat, projectile overlays, floating values, and status icons do not move formation slots or overlap battle controls.
- [ ] Reduced-motion mode removes large movement and shake while preserving action source, target, damage/healing, status, defeat, and outcome clarity.
- [ ] Background-tab or interrupted playback resumes safely without duplicate timers or state updates after unmount.

## Persistence

- [ ] Save schema contains an explicit version and is validated before use.
- [ ] Roster ownership, squad slots, campaign progress, rewards, equipment, levels/experience, and summon state survive a hard refresh.
- [ ] A known older schema migrates once and produces a valid current save.
- [ ] Malformed, incomplete, or future-version save data opens a recoverable message with a clearly labeled reset path; the app never displays a blank screen.
- [ ] Reset requires confirmation, clears only demo-owned storage, and restores the defined first-run profile.
- [ ] Save writes occur atomically after reward/summon transactions and within 500 ms of ordinary player-state changes on supported devices.

## Responsive input and accessibility

- [ ] At 360×800, 768×1024, and 1280×720 CSS pixels, no required screen has horizontal overflow or clipped content.
- [ ] The battle remains legible at all supported widths with all eight formation positions and playback controls available.
- [ ] Every core flow is completable with mouse, touch, and keyboard alone.
- [ ] Interactive targets are at least 44×44 CSS pixels, with a visible focus indicator and logical focus order.
- [ ] Buttons have accessible names, form controls have labels, status is not conveyed by color alone, and live battle narration is rate-limited rather than announcing every animation frame.
- [ ] Text at default browser zoom remains readable, and the interface remains usable at 200% zoom without two-dimensional scrolling.
- [ ] Contrast meets WCAG AA for normal text and meaningful controls.

## Content and presentation states

- [ ] Development validation rejects duplicate IDs, missing references/assets, impossible values, invalid weighted tables, and unreachable progression with readable errors.
- [ ] All eight ninja records, five campaign encounters, one dungeon, summon table, equipment set, and reward tables pass content validation.
- [ ] Placeholder art remains consistent with the approved original shinobi-fantasy direction and contains no borrowed property names, logos, symbols, or recognizable character designs.
- [ ] Missing optional audio never blocks the loop; audio is off or conservative by default and includes a persistent mute control.

## Performance and stability

- [ ] Production build has no console-breaking error during first run, refresh, replay, corrupted-save recovery, or reset.
- [ ] On a representative mid-range mobile device, controls respond without visible multi-second lag during battle and navigation.
- [ ] Battle motion animates transforms/opacity where possible; no continuous animation causes repeated layout shifts.
- [ ] The effect layer enforces a documented cap on simultaneous decorative DOM elements and cleans them after cancel, skip, and unmount.
- [ ] No uncaught promise rejection or post-unmount state update occurs during 10 consecutive battle/replay cycles.

## Vercel deployment

- [ ] Vercel preview and production deployments complete from a clean checkout using the documented build settings.
- [ ] The production URL loads over HTTPS and all emitted assets return successfully.
- [ ] Every application route opens directly and survives browser refresh without a Vercel 404.
- [ ] Mobile viewport metadata is present; cache and security headers match the deployment configuration.
- [ ] A deployment smoke test completes roster → squad → campaign on desktop and phone viewports.

## Phase gates

- Phase 1 exit: application shell builds, direct links work, and placeholder screens are usable at desktop/phone widths.
- Phase 2 exit: valid representative content constructs two legal squads; malformed data fails clearly.
- Phase 3 exit: deterministic visual-free 4v4 simulation passes rule/scenario tests.
- Phase 4 exit: one full event log animates at every playback setting without desynchronization.
- Phase 5 exit: first-run squad-to-reward-to-upgrade-to-replay loop works and persists.
- Phase 6 exit: locked content volume provides multiple viable squads and no progression dead end.
- Phase 7 exit: the hosted full loop passes this checklist with no critical defect.
