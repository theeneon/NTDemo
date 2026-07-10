import { describe, expect, it } from "vitest";
import { createSeededRng } from "./seededRng";

describe("seeded random utility", () => {
  it("replays an identical sequence from an identical seed", () => {
    const first = createSeededRng("battle-ember-001");
    const replay = createSeededRng("battle-ember-001");
    const firstSequence = Array.from({ length: 20 }, () => first.next());
    const replaySequence = Array.from({ length: 20 }, () => replay.next());

    expect(replaySequence).toEqual(firstSequence);
    expect(new Set(firstSequence).size).toBeGreaterThan(15);
  });

  it("provides deterministic integer, pick, and weighted-pick helpers", () => {
    const first = createSeededRng(42);
    const replay = createSeededRng(42);
    const run = (rng: ReturnType<typeof createSeededRng>) => [
      rng.integer(1, 10),
      rng.pick(["ember", "reed", "mist"]),
      rng.weightedPick([
        { value: "common", weight: 60 },
        { value: "skilled", weight: 30 },
        { value: "elite", weight: 10 },
      ]),
    ];

    expect(run(first)).toEqual(run(replay));
  });

  it("rejects invalid helper inputs", () => {
    const rng = createSeededRng("invalid-inputs");
    expect(() => rng.integer(5, 2)).toThrow(RangeError);
    expect(() => rng.pick([])).toThrow(RangeError);
    expect(() => rng.weightedPick([{ value: "bad", weight: 0 }])).toThrow(RangeError);
  });
});
