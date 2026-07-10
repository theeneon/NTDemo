# Phase 0 — Combat-rules reference

Status: Baseline v1.0  
Purpose: Remove rule ambiguity before data contracts, engine code, animation, or content volume are created.

## Design principles

1. Identical content, squads, decisions, and seed must produce the same final state and identical ordered events.
2. The engine mutates only battle-runtime state. Content definitions and saved player-owned definitions remain immutable.
3. The engine emits serializable facts. Presentation timing, coordinates, audio, and DOM state never affect outcomes.
4. Every collection with gameplay significance has a stable order.
5. No battle may run forever or create an unbounded trigger chain.

## Battle setup

- A legal battle starts with two teams of exactly four units.
- Each team has stable formation slots `0..3`: front-left, front-right, back-left, back-right.
- A runtime unit receives a stable battle ID derived from side and slot.
- Maximum health starts full. Cooldowns, energy (if later retained), and status collections start at their content-defined initial values.
- Player and encounter content are copied into runtime values; source data is never mutated.
- One seeded pseudo-random-number generator is created from the battle seed. All chance rolls and loot rolls consume it in documented event order.

## Effective stats

- `maxHealth`, `attack`, `defense`, and `speed` are positive integers in content.
- Percentage modifiers are calculated from the immutable base stat, summed by stat, then rounded once.
- `effectiveAttack = max(1, round(baseAttack × (1 + attackModifierTotal)))`
- `effectiveDefense = max(0, round(baseDefense × (1 + defenseModifierTotal)))`
- `effectiveSpeed = max(1, round(baseSpeed × (1 + speedModifierTotal)))`
- The demo does not include critical hits, dodge, elemental affinity, accuracy, or resistance unless this reference is explicitly revised before Phase 2.

## Turn scheduling

The simulator uses a virtual action timeline rather than frame time.

1. Every unit starts with `nextActionAt = 1000 / effectiveSpeed`.
2. The living unit with the lowest `nextActionAt` acts next.
3. After its turn finishes, add `1000 / currentEffectiveSpeed` to that unit’s timestamp.
4. Keep full floating-point precision internally. Event output rounds displayed timeline values only.

Exact ties resolve in this order:

1. Higher effective speed.
2. Player side before enemy side.
3. Lower formation slot.
4. Lexicographically lower stable battle ID as the final invariant.

Speed changes affect the interval scheduled after the current turn. They do not retroactively change the already selected action timestamp.

## Owner-turn sequence

1. Emit `turnStarted`.
2. Resolve start-of-turn damage-over-time and healing-over-time in stable status order.
3. Apply immediate defeats and check victory after the full start-of-turn tick group.
4. If stunned, emit `turnSkipped`, consume the turn, and skip action selection.
5. Select the first usable skill in the unit’s ordered AI priority list.
6. Resolve legal targets using that skill’s selector.
7. Commit any cost and set the used skill cooldown.
8. Resolve the skill’s effect list in declared order.
9. Resolve passives created by each source event.
10. Decrement blocked cooldown counters and owner-timed status durations.
11. Remove expired statuses and emit expiration events.
12. Apply any defeats created by end-of-turn effects and check victory.
13. Schedule the unit’s next action if it is still alive and battle has not ended.
14. Emit `turnEnded`.

## Skill selection

- Every unit has a basic attack and zero or more active skills.
- Content defines an ordered AI priority for active skills. The simulator chooses the first skill that is off cooldown, affordable, and has at least one legal target.
- If an active skill is not usable, selection continues to the next priority.
- If no active skill is usable, the unit uses its basic attack.
- If the basic attack has no legal target, the engine checks victory and otherwise records an `invalidState` diagnostic and ends the battle as a controlled defeat for the side that cannot act.
- The demo uses deterministic AI conditions only. Chance-based skill choice is excluded.

## Cooldowns

- All demo skills start ready unless content explicitly marks an opening cooldown.
- A listed cooldown of `N` means the skill is blocked for the unit’s next `N` owner turns.
- On use, the counter becomes `N`.
- On each later owner turn, a counter greater than zero blocks selection for that turn and decrements by one at turn end.
- A stunned turn still decrements cooldowns.
- Cooldowns never decrement from ally turns, enemy turns, animation time, pause time, or skipped presentation.

## Target selectors

Content selects one of the supported deterministic selectors:

- `self`
- `singleEnemyLowestHealthPercent`
- `singleEnemyHighestAttack`
- `singleEnemyFrontFirst`
- `allEnemies`
- `randomEnemy` (seeded; content should use sparingly)
- `singleAllyLowestHealthPercent`
- `singleAllyLowestHealthPercentIncludingSelf`
- `allAllies`
- `allAlliesIncludingSelf`

Targeting always filters defeated or otherwise illegal targets before sorting or rolling.

Stable tie-breakers:

- Lowest health: lower `currentHealth / maxHealth`, then lower current health, then front row, then lower slot.
- Highest attack: higher effective attack, then lower health percentage, then front row, then lower slot.
- Front first: front row before back row, then lower health percentage, then lower slot.
- Random target: choose from candidates ordered by stable battle ID using the seeded RNG.

If a heal selector finds no wounded legal ally, that skill is unusable and selection continues. Overhealing is not a valid reason to spend a skill.

## Damage

For a standard damage effect:

`rawDamage = sourceEffectiveAttack × potency / 100`

`mitigatedDamage = rawDamage × 100 / (100 + targetEffectiveDefense)`

`finalDamage = max(1, round(mitigatedDamage × outgoingModifier × incomingModifier))`

- Potency is a non-negative integer percentage.
- Modifiers are explicit decimal multipliers with a default of `1`.
- Round once, after all multipliers.
- Damage cannot reduce health below zero.
- Shields, critical hits, dodge, lifesteal, and elemental multipliers are excluded from the Phase 0 ruleset.
- True damage, if required by representative content, ignores defense but uses the same modifier, rounding, and minimum rules.

For a multi-target effect, calculate every target from the same pre-effect snapshot, then apply health changes in stable target order. This prevents earlier targets from changing later calculations.

## Healing

`rawHealing = sourceEffectiveAttack × potency / 100`

`finalHealing = max(1, round(rawHealing × outgoingHealingModifier × targetHealingReceivedModifier))`

- Applied healing is capped at `maxHealth - currentHealth`.
- Emit both calculated healing and applied healing so presentation can explain overheal without changing the result.
- Healing cannot revive a defeated unit. Revival is excluded from the demo.
- A multi-target heal uses one pre-effect snapshot and stable target application order.

## Status model

Every status instance contains a stable definition ID, source battle ID, magnitude, remaining owner turns, timing, and tags.

Supported demo categories:

- Attack up/down
- Defense up/down
- Speed up/down
- Damage dealt up/down
- Damage received up/down
- Healing received up/down
- Damage over time
- Healing over time
- Stun

Duration behavior:

- Damage-over-time and healing-over-time tick at the affected unit’s turn start.
- Other durations expire at the affected unit’s turn end.
- A duration of `N` remains active for `N` affected-unit owner turns.
- Stun consumes an owner turn and then decrements normally.
- A defeated unit no longer ticks statuses.

Stacking behavior:

- Reapplying the same status definition does not create a second instance.
- Keep the greater absolute magnitude and the longer remaining duration from the old/new instances.
- If equal-magnitude signs conflict, the newest application replaces the old instance; content validation should flag this design error.
- Differently named modifiers stack additively by stat.
- Stun never stacks; reapplication keeps the longer remaining duration.
- The same damage-over-time definition refreshes rather than adding another tick source. Different definitions may coexist.

## Passives and triggers

- A passive listens only for explicitly listed event types and conditions.
- Passives resolve after the effect that produced their source event.
- Within one source event, trigger priority is: active unit, active unit’s allies by slot, opposing units by slot, then stable passive definition ID.
- One passive instance can trigger at most once per source event.
- Derived events may trigger other passives, but a chain stops after 50 passive activations. The engine emits `triggerLimitReached`, cancels remaining triggers, and finishes the current effect group before determining the controlled outcome.
- A defeated unit cannot originate a new passive unless the passive explicitly listens for its own defeat.
- Passive effects use the same targeting, snapshot, rounding, defeat, and event rules as active effects.

## Defeat and simultaneous effects

- A unit is defeated immediately when its health reaches zero.
- A defeated unit cannot be selected, act, receive healing, or emit ordinary passives.
- For multi-target effects, all health outcomes are calculated from a pre-effect snapshot and applied before victory is evaluated.
- Defeat events are emitted in player-slot order followed by enemy-slot order.
- If both sides have no living units after the same effect group, the outcome is a draw.
- A draw grants no encounter completion, first-clear reward, currency, experience, equipment, or unlock.

## Victory, turn cap, and invalid state

- Victory occurs when exactly one side has at least one living unit after a complete effect group.
- The battle has a maximum of 100 owner turns total across both sides.
- Reaching the cap ends the battle as a player defeat with reason `turnLimit`; it grants no reward and includes a diagnostic summary.
- An impossible state, missing target, non-finite number, or trigger overflow creates a readable diagnostic event and controlled player defeat. It must never freeze the interface.
- Presentation pause, speed, tab visibility, and skip do not advance or alter the already computed battle outcome.

## Rewards

Rewards are encounter data, not formulas embedded in UI code.

- Victory grants fixed base coins and fixed squad experience.
- All four selected player ninjas receive full squad experience, including defeated units.
- Campaign first-clear rewards apply exactly once and are recorded atomically with encounter completion.
- Dungeon base rewards repeat. Its loot roll uses the battle seed and ordered reward table.
- Equipment drops are selected from an ordered weighted table using the same seeded RNG.
- Defeat and draw grant no demo reward.
- The result payload includes reward IDs and a unique battle-completion ID. Applying the same completion ID twice is a no-op.
- Level-ups occur when accumulated experience reaches content-defined thresholds. Surplus experience carries forward.

## Free summon

- The demo grants exactly one free summon per new save.
- The summon result uses a saved seed and ordered weighted table.
- Rank probabilities are visible before confirmation and match the configured weights.
- Applying the result and consuming the free summon are one atomic save action.
- Refreshing during reveal shows the already committed result; it never grants a second roll.
- There is no paid currency, purchase action, or repeat summon in the demo.

## Required event categories

The engine must be able to serialize at least:

- `battleStarted`, `turnStarted`, `turnEnded`
- `skillSelected`, `actionFailed`, `turnSkipped`
- `movementIntent`, `skillUsed`
- `damageApplied`, `healingApplied`
- `statusApplied`, `statusRefreshed`, `statusTicked`, `statusExpired`
- `passiveTriggered`, `cooldownChanged`
- `unitDefeated`
- `victory`, `defeat`, `draw`
- `rewardsCalculated`
- `turnLimitReached`, `triggerLimitReached`, `invalidState`

Every event needs a monotonically increasing sequence number, battle ID, type, source when relevant, targets when relevant, and type-specific payload. Events may contain semantic animation hints but never DOM selectors, screen coordinates, or presentation duration.

## Rule examples

### Equal-speed opening

Player slot 0 and enemy slot 0 both have speed 100. Both schedule at time 10. Player slot 0 acts first because side is the second tie-breaker after equal speed.

### Cooldown of two

A unit uses Skill A with cooldown 2. On each of its next two turns, Skill A is blocked and the counter becomes 1, then 0 at turn end. It may be selected again on the third later turn.

### Stun with damage over time

At turn start, damage over time ticks before the stun check. If the unit survives, stun consumes the action. Both the damage-over-time duration and stun duration then decrement at turn end.

### Area-effect mutual defeat

An effect damages every unit, including the source team, from one pre-effect snapshot. If the final living unit on both sides reaches zero in that group, the outcome is a draw with no reward.

## Phase 2 validation consequences

Content validation must reject negative stats, negative potency, duplicate stable IDs, missing basic attacks, unsupported selectors/effects, empty skill priority, non-positive status duration, invalid weighted tables, unreachable encounter prerequisites, and references to missing assets.
