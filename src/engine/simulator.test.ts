import { describe, expect, it } from "vitest";
import { demoContent } from "../content";
import type { GameContent, NinjaDefinition, SkillDefinition } from "../domain/models";
import { formatBattleLog, simulateBattle, type BattleInput } from "./index";

const playerTeam = [
  { ninjaId: "ninja.reed", level: 3, slot: 0 },
  { ninjaId: "ninja.ember", level: 3, slot: 1 },
  { ninjaId: "ninja.mist", level: 3, slot: 2 },
  { ninjaId: "ninja.kite", level: 3, slot: 3 },
] as const;

function input(overrides: Partial<BattleInput> = {}): BattleInput {
  return {
    content: demoContent,
    encounterId: "encounter.bamboo-pass",
    playerTeam,
    seed: "phase-3-replay",
    ...overrides,
  };
}

function replaceSkill(content: GameContent, replacement: SkillDefinition): GameContent {
  return {
    ...content,
    skills: content.skills.map((skill) => (skill.id === replacement.id ? replacement : skill)),
  };
}

function replaceNinja(
  content: GameContent,
  ninjaId: NinjaDefinition["id"],
  update: (ninja: NinjaDefinition) => NinjaDefinition,
): GameContent {
  return {
    ...content,
    ninjas: content.ninjas.map((ninja) => (ninja.id === ninjaId ? update(ninja) : ninja)),
  };
}

describe("deterministic combat simulation", () => {
  it("replays the same battle and reward stream from the same seed", () => {
    const first = simulateBattle(input());
    const replay = simulateBattle(input());

    expect(replay).toEqual(first);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    expect(first.summary.turns).toBeGreaterThan(0);
    expect(first.events.at(-1)?.type).toBe("battleEnded");
    expect(first.events.at(-2)?.type).toBe("rewardsCalculated");
  });

  it("adds the guaranteed first-clear reward table to the regular rewards", () => {
    const firstClear = simulateBattle(input({ isFirstClear: true }));
    const replay = simulateBattle(input({ isFirstClear: false }));

    expect(firstClear.outcome).toBe("victory");
    expect(firstClear.rewards).toMatchObject({ coins: 175, squadExperience: 60 });
    expect(firstClear.rewards?.drops).toContainEqual({
      kind: "equipment",
      contentId: "equipment.ember-kunai",
      amount: 1,
    });
    expect(firstClear.rewards?.drops).toHaveLength(2);
    expect(replay.rewards).toMatchObject({ coins: 100, squadExperience: 40 });
    expect(replay.rewards?.drops).not.toContainEqual(
      expect.objectContaining({ contentId: "equipment.ember-kunai" }),
    );
  });

  it("orders turns by timeline and deterministic tie breakers", () => {
    const result = simulateBattle(input({ maximumTurns: 1 }));
    const firstTurn = result.events.find((event) => event.type === "turnStarted");

    expect(firstTurn).toMatchObject({ type: "turnStarted", unitId: "unit.enemy.2", turn: 1 });
    expect(result.outcome).toBe("defeat");
    expect(result.reason).toBe("turnLimit");
  });

  it("targets the highest-attack enemy with a stable unit identity", () => {
    const result = simulateBattle(input({ maximumTurns: 1 }));
    const skill = result.events.find((event) => event.type === "skillUsed");

    expect(skill).toMatchObject({
      type: "skillUsed",
      sourceUnitId: "unit.enemy.2",
      skillId: "skill.hamstring",
      targetUnitIds: ["unit.player.1"],
    });
  });

  it("applies, consumes, and expires a one-turn stun on the owner's turn", () => {
    const original = demoContent.skills.find((skill) => skill.id === "skill.gale-thread")!;
    let content = replaceSkill(demoContent, {
      ...original,
      cooldown: 99,
      effects: [
        {
          kind: "applyStatus",
          target: "singleEnemyFrontFirst",
          statusId: "status.stun",
          duration: 1,
          chance: 100,
        },
      ],
    });
    content = replaceNinja(content, "ninja.kite", (ninja) => ({
      ...ninja,
      baseStats: { ...ninja.baseStats, speed: 500 },
    }));

    const result = simulateBattle(input({ content, maximumTurns: 40 }));
    const applied = result.events.find(
      (event) => event.type === "statusApplied" && event.statusId === "status.stun",
    );
    const skipped = result.events.find(
      (event) => event.type === "turnSkipped" && event.unitId === "unit.enemy.0",
    );
    const expired = result.events.find(
      (event) =>
        event.type === "statusExpired" &&
        event.targetUnitId === "unit.enemy.0" &&
        event.statusId === "status.stun",
    );

    expect(applied?.sequence).toBeLessThan(skipped?.sequence ?? 0);
    expect(skipped?.sequence).toBeLessThan(expired?.sequence ?? 0);
  });

  it("resolves multi-target damage from a snapshot before defeat cleanup", () => {
    const original = demoContent.skills.find((skill) => skill.id === "skill.gale-thread")!;
    let content = replaceSkill(demoContent, {
      ...original,
      effects: [{ kind: "damage", target: "allEnemies", potency: 10_000, damageType: "true" }],
    });
    content = replaceNinja(content, "ninja.kite", (ninja) => ({
      ...ninja,
      baseStats: { ...ninja.baseStats, speed: 500 },
    }));

    const result = simulateBattle(input({ content }));
    const damage = result.events.filter((event) => event.type === "damageApplied");
    const defeats = result.events.filter((event) => event.type === "unitDefeated");

    expect(damage).toHaveLength(4);
    expect(defeats).toHaveLength(4);
    expect(Math.max(...damage.map(({ sequence }) => sequence))).toBeLessThan(
      Math.min(...defeats.map(({ sequence }) => sequence)),
    );
    expect(result.outcome).toBe("victory");
  });

  it("ticks source-scaled damage-over-time and executes battle-start passives", () => {
    const result = simulateBattle(input());

    expect(result.events).toContainEqual(
      expect.objectContaining({
        type: "passiveTriggered",
        skillId: "skill.guardian-oath",
        trigger: "battleStarted",
      }),
    );
    expect(result.events).toContainEqual(
      expect.objectContaining({
        type: "statusTicked",
        statusId: "status.bleed",
        tickKind: "damage",
      }),
    );
    expect(result.events.some((event) => event.type === "healingApplied")).toBe(true);
    expect(
      result.events.some((event) => event.type === "statusTicked" && event.tickKind === "healing"),
    ).toBe(true);
  });

  it("counts cooldowns on future owner turns before reusing an active skill", () => {
    const result = simulateBattle(input());
    const scoutActions = result.events.filter(
      (event) => event.type === "skillUsed" && event.sourceUnitId === "unit.enemy.2",
    );
    const firstHamstring = scoutActions.findIndex(
      (event) => event.type === "skillUsed" && event.skillId === "skill.hamstring",
    );
    const nextHamstring = scoutActions.findIndex(
      (event, index) =>
        index > firstHamstring && event.type === "skillUsed" && event.skillId === "skill.hamstring",
    );

    expect(firstHamstring).toBe(0);
    expect(nextHamstring).toBeGreaterThanOrEqual(3);
    expect(
      result.events.some(
        (event) =>
          event.type === "cooldownChanged" &&
          event.skillId === "skill.hamstring" &&
          event.remaining === 0,
      ),
    ).toBe(true);
  });

  it("resolves ordered cleanse effects before a new DOT can tick", () => {
    const original = demoContent.skills.find((skill) => skill.id === "skill.gale-thread")!;
    let content = replaceSkill(demoContent, {
      ...original,
      effects: [
        {
          kind: "applyStatus",
          target: "self",
          statusId: "status.bleed",
          duration: 2,
          magnitude: 0.5,
          chance: 100,
        },
        { kind: "cleanse", target: "self", count: 1, tag: "damageOverTime" },
      ],
    });
    content = replaceNinja(content, "ninja.kite", (ninja) => ({
      ...ninja,
      baseStats: { ...ninja.baseStats, speed: 500 },
    }));

    const result = simulateBattle(input({ content, maximumTurns: 2 }));
    const appliedIndex = result.events.findIndex(
      (event) => event.type === "statusApplied" && event.statusId === "status.bleed",
    );
    const removedIndex = result.events.findIndex(
      (event) => event.type === "statusExpired" && event.statusId === "status.bleed",
    );

    expect(appliedIndex).toBeGreaterThan(-1);
    expect(removedIndex).toBeGreaterThan(appliedIndex);
    expect(
      result.events.some(
        (event) => event.type === "statusTicked" && event.statusId === "status.bleed",
      ),
    ).toBe(false);
  });

  it("triggers ally-defeat passives for surviving allies", () => {
    const hamstring = demoContent.skills.find((skill) => skill.id === "skill.hamstring")!;
    let content = replaceSkill(demoContent, {
      ...hamstring,
      effects: [
        {
          kind: "damage",
          target: "singleEnemyFrontFirst",
          potency: 10_000,
          damageType: "true",
        },
      ],
    });
    content = replaceNinja(content, "ninja.scout", (ninja) => ({
      ...ninja,
      baseStats: { ...ninja.baseStats, speed: 500 },
    }));
    const echoTeam = [
      playerTeam[0],
      playerTeam[1],
      playerTeam[2],
      { ninjaId: "ninja.echo", level: 3, slot: 3 },
    ] as const;

    const result = simulateBattle(input({ content, playerTeam: echoTeam, maximumTurns: 1 }));

    expect(result.events).toContainEqual(
      expect.objectContaining({
        type: "passiveTriggered",
        unitId: "unit.player.3",
        skillId: "skill.last-echo",
        trigger: "allyDefeated",
      }),
    );
  });

  it("returns an invalid-state draw when either formation is empty", () => {
    const result = simulateBattle(input({ playerTeam: [] }));

    expect(result.outcome).toBe("draw");
    expect(result.reason).toBe("invalidState");
    expect(result.events.map(({ type }) => type)).toEqual([
      "battleStarted",
      "invalidState",
      "battleEnded",
    ]);
  });

  it("emits readable logs and never mutates content definitions", () => {
    const result = simulateBattle(input());
    const lines = formatBattleLog(result.events, demoContent, result.finalUnits);

    expect(lines[0]).toContain("Battle started with seed phase-3-replay");
    expect(lines.some((line) => line.includes("uses"))).toBe(true);
    expect(lines.some((line) => line.includes("Battle ended"))).toBe(true);
    expect(result.finalUnits.every((unit) => Array.isArray(unit.statuses))).toBe(true);
    expect(demoContent.ninjas[0]?.baseStats.maxHealth).toBe(780);
  });

  it("scales equipped stat modifiers with persistent equipment levels", () => {
    const levelOne = simulateBattle(
      input({
        maximumTurns: 1,
        playerTeam: [
          {
            ninjaId: "ninja.reed",
            level: 3,
            slot: 0,
            equipmentIds: ["equipment.scout-wraps"],
            equipmentLevels: { "equipment.scout-wraps": 1 },
          },
        ],
      }),
    );
    const levelTwo = simulateBattle(
      input({
        maximumTurns: 1,
        playerTeam: [
          {
            ninjaId: "ninja.reed",
            level: 3,
            slot: 0,
            equipmentIds: ["equipment.scout-wraps"],
            equipmentLevels: { "equipment.scout-wraps": 2 },
          },
        ],
      }),
    );

    expect(levelTwo.finalUnits[0]!.baseStats.defense).toBe(
      levelOne.finalUnits[0]!.baseStats.defense + 4,
    );
    expect(levelTwo.finalUnits[0]!.baseStats.speed).toBe(
      levelOne.finalUnits[0]!.baseStats.speed + 1,
    );
  });
});
