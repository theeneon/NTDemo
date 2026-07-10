# Phase 0 — Placeholder asset direction and inventory

## Direction

Working concept: **Night mission on tactical parchment**.

The demo combines graphic, angular shinobi silhouettes and restrained brush texture with a highly readable tactical interface. Characters need distinct shapes at small sizes. Combat roles use pose, silhouette, and icon shape in addition to color.

This is an original shinobi-fantasy setting. Do not reference or imitate existing anime/manga characters, costumes, eye symbols, village marks, logos, names, typography, signature weapons, or trade dress.

## Approved palette

| Token | Value | Use |
| --- | --- | --- |
| Night ink | `#111827` | Primary UI panels, battlefield framing |
| Slate ink | `#273449` | Secondary panels and neutral silhouettes |
| Parchment | `#E8DFCA` | Warm surfaces and low-priority framing |
| Vermilion | `#DC5A3A` | Primary actions, danger, high-impact attacks |
| Jade | `#51A68D` | Healing, support, success, positive progress |
| White paper | `#FFFDF8` | Cards and readable content surfaces |

Do not rely on vermilion/jade alone to communicate enemy/ally or negative/positive state. Pair color with icons, labels, or shapes.

## Style rules

- Readability wins over detail at 64 px portrait and 96 px battle-sprite sizes.
- Player characters share a clean key light; enemies use harsher rim light and heavier shadow.
- Transparent assets include at least 8% safe space around silhouettes and consistent foot/baseline placement.
- Icons use a 24 px grid, 2 px optical stroke, filled centers for active state, and a strong silhouette at 16 px.
- Effects animate through transform and opacity where feasible; avoid full-screen blur, continuous particles, and filter-heavy glow.
- Backgrounds reserve low-contrast formation zones and must not compete with health/status UI.
- Export master art without text; UI localizes labels independently even though localization is deferred.

## Minimum inventory

### Character portraits — 14

| Group | Count | Source/export | Notes |
| --- | ---: | --- | --- |
| Playable ninja portraits | 8 | 512×512 master; WebP/AVIF export | One per locked playable ninja |
| Enemy archetype portraits | 6 | 512×512 master; WebP/AVIF export | Reused across encounter levels/formations |

Portraits need three crops from one master where practical: 1:1 card, 4:5 profile, and circular safe crop.

### Battle sprites — 14

| Group | Count | Source/export | Notes |
| --- | ---: | --- | --- |
| Playable ninja sprites | 8 | 512×512 transparent master; WebP | One readable idle pose each |
| Enemy archetype sprites | 6 | 512×512 transparent master; WebP | One readable idle pose each |

Phase 4 motion may begin with a single pose animated by CSS. Unique frame animation is not required for the demo.

### Interface icons — 55

| Category | Count | Required set |
| --- | ---: | --- |
| Roles | 4 | Striker, guard, support, control |
| Ranks | 3 | Common, skilled, elite |
| Active skills | 16 | Two distinctive active-skill icons for each playable ninja |
| Statuses | 10 | Attack up/down, defense up/down, speed up/down, damage over time, healing over time, stun, healing received |
| Equipment | 8 | Four slot types plus four representative item icons |
| Currency/reward | 4 | Coin, experience, equipment drop, first clear |
| Navigation | 5 | Roster, squad, campaign, upgrade, summon |
| Battle controls | 5 | Pause, play, speed, skip, combat log |

Icons should be SVG when hand-authored and free of raster texture at small sizes.

### Combat effects — 8

1. Melee slash
2. Impact burst
3. Ranged projectile/trail
4. Area attack marker
5. Healing pulse
6. Buff/debuff application ring
7. Stun indicator burst
8. Defeat dissolve/fade

Prototype these with CSS/SVG first. Raster sprite sheets are commissioned only when the prototype proves they improve clarity.

### Backgrounds — 5

| Asset | Required behavior |
| --- | --- |
| UI parchment wash | Seamless or oversized; no visible text or symbols |
| Campaign map | Five readable node areas plus separate dungeon region |
| Bamboo Pass battlefield | Quiet player/enemy formation zones |
| Moonlit rooftop battlefield | Strong horizon, low center detail |
| Underground shrine/dungeon | Dark but health/status contrast remains AA-readable |

Recommended master: 2560×1440 with safe crops for 16:9, 4:3, and tall phone layouts. Production exports should stay below the Phase 7 performance budget.

### Audio cues — 12

1. UI select
2. Ninja add/remove
3. Battle start
4. Basic attack whoosh
5. Damage impact
6. Active skill accent
7. Heal
8. Buff/debuff
9. Stun
10. Unit defeat
11. Victory/reward
12. Summon reveal

Preferred format: OGG plus MP3/AAC fallback as needed after browser testing. Most cues should be 0.1–1.2 seconds. The demo needs one persistent mute control; no voice-over is required.

## Priority order

1. Role/status/control icons required to read static wireframes and combat.
2. Four representative playable silhouettes and four enemy silhouettes for the first visual battle.
3. Full portrait and single-pose sprite set after the vertical slice works.
4. Core hit/heal/status effects.
5. Campaign map and three battle backgrounds.
6. Audio cues after visual timing stabilizes.

## Naming and delivery

- Stable lowercase IDs with hyphens: `ninja-ember-portrait.webp`, `status-speed-down.svg`.
- Separate source and optimized files; runtime content references only optimized public assets.
- Every raster export includes pixel dimensions and revision in an adjacent inventory record.
- Every visual asset needs a short human-readable alt-text description in content data where it conveys information.
- Content validation fails when a required runtime path is missing.

## Placeholder acceptance

- All required categories have a named temporary asset before Phase 4 animation integration.
- No placeholder depends on copyrighted third-party character art or an unclear license.
- Silhouettes remain distinguishable in grayscale and at final small size.
- Backgrounds do not obscure health bars, status icons, or controls.
- Missing audio never blocks play and does not create a failed network loop.
