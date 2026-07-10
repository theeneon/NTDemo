# Phase 0 — Screen flow and wireframes

## Primary first-run flow

`Roster → Squad → Campaign → Battle → Results → Upgrade → Squad`

The player may replay immediately or return to campaign selection. The free summon branches from Roster and returns there. Summoning is never required to complete the first-run loop.

## Shared screen rules

- Primary actions sit at the end of the current reading order and remain visible without horizontal scrolling.
- The current squad power and relevant currencies are visible wherever the player can spend or enter combat.
- Back navigation never discards a legal squad or earned reward.
- Loading, empty, success, and recoverable error states use the same screen structure to avoid layout jumps.
- Minimum interactive target is 44 by 44 CSS pixels.
- On phone widths, supporting panels collapse below the primary task; required actions remain above optional detail.
- The back button and direct-link refresh restore the same stable screen where practical.

## 1. Roster

Purpose: Introduce the eight ninjas and lead naturally to squad selection.

Required hierarchy:

1. Roster count and current resources.
2. Role filters.
3. Eight cards showing portrait, name, role, rank, level, and power.
4. Primary `Build squad` action.
5. Secondary `Free summon` action while unused.

Empty/error behavior: The starter roster can never be empty. Invalid content shows a recoverable content error with reset/reload help rather than an empty grid.

## 2. Squad selection

Purpose: Build one legal four-ninja formation and understand its balance.

Required hierarchy:

1. Four formation slots: two front and two back.
2. Available roster with add/remove controls.
3. Current unit count, combined power, and role summary.
4. Primary `Choose mission` action, disabled until four unique ninjas are selected.

Rules: A ninja cannot occupy more than one slot. Removing a ninja returns it to the available list. Selection survives navigation and refresh.

## 3. Campaign and dungeon

Purpose: Choose the next combat objective with clear difficulty and reward context.

Required hierarchy:

1. Five ordered campaign nodes with complete/available/locked states.
2. Selected encounter name, enemy preview, recommended power, energy-free entry, and rewards.
3. Primary `Enter battle` action.
4. Persistent but secondary dungeon card showing repeatable rewards.

Rules: Encounter 1 is initially available. Completing an encounter unlocks the next. The dungeon unlock condition is explicit in content data and never relies on hidden state.

## 4. Battle

Purpose: Make automated decisions understandable while preserving pacing controls.

Required hierarchy:

1. Stable two-by-two player and enemy formations.
2. Unit name/portrait or sprite, health, turn indicator, and status icons.
3. Upcoming turn strip.
4. Pause/resume, 1×/2×, and skip controls.
5. Short current-action description and expandable combat log.

Rules: Defeated units retain their layout slot as a defeated placeholder until the result transition. Projectiles and floating values use an overlay that cannot resize the battlefield. Reduced-motion mode replaces lunges and shake with brief opacity/color changes.

## 5. Results

Purpose: Explain the outcome and connect rewards to the next improvement.

Required hierarchy:

1. Victory/defeat/draw and concise battle summary.
2. Currency, experience, equipment, and first-clear rewards.
3. Per-ninja experience progress with level-ups clearly applied.
4. Primary `Upgrade ninja` action after victory.
5. `Replay` and `Campaign` actions.

Rules: Rewards are committed exactly once before this screen is shown. Refreshing results cannot duplicate them.

## 6. Upgrade

Purpose: Make one affordable improvement and see the power delta.

Required hierarchy:

1. Selected ninja and current level/experience.
2. Current and previewed power/stats.
3. One level-up action when eligible.
4. Equipment slots, owned choices, and equip/upgrade action.
5. Primary `Return to squad` action.

Rules: Unaffordable actions explain the missing requirement. Every spend previews its exact cost and stat change. Updated power is visible on return to Squad.

## 7. Free summon demonstration

Purpose: Demonstrate collection delight without introducing a store or paid loop.

Required hierarchy:

1. `Free summon demo` label.
2. Visible rank probabilities before confirmation.
3. One clear confirm action.
4. Reveal state and `Return to roster` action.
5. Explicit `No purchase available in this demo` note.

Rules: The result is seeded and saved. The free summon is consumed once. After use, the screen can show the saved result but cannot offer paid or repeat summoning.

## Navigation map

| From | Primary destination | Secondary destinations |
| --- | --- | --- |
| Roster | Squad | Summon, Upgrade |
| Squad | Campaign | Roster, Upgrade |
| Campaign | Battle | Squad |
| Battle | Results | None while resolving |
| Results | Upgrade | Replay battle, Campaign |
| Upgrade | Squad | Roster |
| Summon | Roster | None |
