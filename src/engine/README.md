# Deterministic combat engine

`simulateBattle` is a synchronous, visual-free resolver. It copies validated definitions into
battle-local runtime units, schedules speed-based turns, selects legal targets, resolves ordered
effects and passives, cleans up defeated units, and returns a JSON-safe event stream plus summary.

The seed, input content, encounter, and player formation completely determine the result. Rendering
speed, animation pauses, and React state never participate in combat decisions. The Combat Forge at
`/combat-lab` is a developer-facing consumer of the same public engine API used by tests.
