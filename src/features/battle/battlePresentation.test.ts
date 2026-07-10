import { describe, expect, it } from "vitest";
import { demoContent } from "../../content";
import { simulateBattle } from "../../engine";
import {
  applyBattleEvent,
  createBattlePresentation,
  reduceBattleEvents,
} from "./battlePresentation";
import { eventDisplayDuration } from "./useBattlePlayback";

const result = simulateBattle({
  content: demoContent,
  encounterId: "encounter.bamboo-pass",
  seed: "phase-4-presentation-tests",
  playerTeam: [
    { ninjaId: "ninja.reed", level: 3, slot: 0 },
    { ninjaId: "ninja.ember", level: 3, slot: 1 },
    { ninjaId: "ninja.mist", level: 3, slot: 2 },
    { ninjaId: "ninja.kite", level: 3, slot: 3 },
  ],
});

describe("battle event presentation", () => {
  it("starts from full-health runtime snapshots without using final outcomes", () => {
    const presentation = createBattlePresentation(result);

    expect(presentation.turn).toBe(0);
    expect(presentation.outcome).toBeNull();
    expect(presentation.completed).toBe(false);
    expect(Object.values(presentation.units)).toHaveLength(8);
    expect(
      Object.values(presentation.units).every(
        (unit) => unit.health === unit.snapshot.baseStats.maxHealth && !unit.defeated,
      ),
    ).toBe(true);
  });

  it("applies exactly one damage event without reading future events", () => {
    const damageIndex = result.events.findIndex((event) => event.type === "damageApplied");
    const damage = result.events[damageIndex];
    expect(damage?.type).toBe("damageApplied");
    if (!damage || damage.type !== "damageApplied") return;

    const before = reduceBattleEvents(result, damageIndex);
    const after = applyBattleEvent(before, damage);

    expect(before.units[damage.targetUnitId]!.health).not.toBe(damage.remainingHealth);
    expect(after.units[damage.targetUnitId]!.health).toBe(damage.remainingHealth);
    expect(after.lastEvent?.sequence).toBe(damage.sequence);
  });

  it("reconstructs final health, defeat, rewards, and outcome from the full stream", () => {
    const presentation = reduceBattleEvents(result);

    for (const snapshot of result.finalUnits) {
      expect(presentation.units[snapshot.id]!.health).toBe(snapshot.health);
      expect(presentation.units[snapshot.id]!.defeated).toBe(snapshot.defeated);
    }
    expect(presentation.outcome).toBe(result.outcome);
    expect(presentation.rewards).toEqual(result.rewards);
    expect(presentation.completed).toBe(true);
  });

  it("shortens playback at 2x and under reduced-motion preferences", () => {
    const damage = result.events.find((event) => event.type === "damageApplied")!;
    const normal = eventDisplayDuration(damage, 1, false);

    expect(eventDisplayDuration(damage, 2, false)).toBe(Math.round(normal / 2));
    expect(eventDisplayDuration(damage, 1, true)).toBeLessThan(normal);
  });
});
