import { beforeEach, describe, expect, it } from "vitest";
import { demoContent } from "../content";
import { simulateBattle } from "../engine";
import {
  PLAYER_SAVE_STORAGE_KEY,
  calculateNinjaPower,
  createInitialPlayerState,
  demoDefaultSquadIds,
  migratePlayerSave,
  ninjaIdFromSlug,
  usePlayerStore,
} from "./playerStore";

describe("persisted player progression", () => {
  beforeEach(() => {
    localStorage.clear();
    usePlayerStore.setState(createInitialPlayerState());
  });

  it("constructs a unique four-ninja squad from an empty first-run formation", () => {
    const store = usePlayerStore.getState();
    expect(store.squadIds).toEqual([]);
    demoDefaultSquadIds.forEach((id) => store.addToSquad(id));
    store.addToSquad("reed");
    store.addToSquad("flint");

    expect(usePlayerStore.getState().squadIds).toEqual(demoDefaultSquadIds);
  });

  it("migrates the legacy UI-only save into versioned progression state", () => {
    const migrated = migratePlayerSave(
      { coins: 777, crystals: 2, squadIds: ["reed", "ember", "reed", "unknown"] },
      0,
    );

    expect(migrated.saveVersion).toBe(2);
    expect(migrated.coins).toBe(777);
    expect(migrated.squadIds).toEqual(["reed", "ember"]);
    expect(migrated.ninjaProgress.reed?.level).toBe(3);
    expect(migrated.ownedEquipment["equipment.scout-wraps"]).toBe(1);
  });

  it("applies dungeon rewards and experience exactly once", () => {
    const store = usePlayerStore.getState();
    demoDefaultSquadIds.forEach((id) => store.addToSquad(id));
    expect(store.startBattle("encounter.underground-shrine")).toBe(true);
    const active = usePlayerStore.getState().activeBattle!;
    const current = usePlayerStore.getState();
    const result = simulateBattle({
      content: demoContent,
      encounterId: active.encounterId,
      seed: active.seed,
      playerTeam: active.squadIds.map((slug, slot) => ({
        ninjaId: ninjaIdFromSlug(slug),
        level: current.ninjaProgress[slug]!.level,
        slot: slot as 0 | 1 | 2 | 3,
        equipmentIds: Object.values(current.ninjaProgress[slug]!.equipped),
        equipmentLevels: current.equipmentLevels,
      })),
    });
    const startingCoins = current.coins;
    const startingExperience = current.ninjaProgress.reed!.experience;

    expect(result.outcome).toBe("victory");
    expect(store.completeBattle(result)).toBe(true);
    expect(store.completeBattle(result)).toBe(false);
    const completed = usePlayerStore.getState();
    const coinDrop = result.rewards?.drop?.kind === "coins" ? result.rewards.drop.amount : 0;
    expect(completed.coins).toBe(startingCoins + (result.rewards?.coins ?? 0) + coinDrop);
    expect(completed.ninjaProgress.reed!.experience).toBe(
      startingExperience + (result.rewards?.squadExperience ?? 0),
    );
    expect(completed.lastBattle?.battleId).toBe(result.battleId);
    expect(localStorage.getItem(PLAYER_SAVE_STORAGE_KEY)).toContain(result.battleId);
  });

  it("turns earned XP and an equipment reinforcement into persistent power", () => {
    const initial = usePlayerStore.getState();
    const reed = initial.ninjaProgress.reed!;
    usePlayerStore.setState({
      ninjaProgress: {
        ...initial.ninjaProgress,
        reed: { ...reed, experience: 110 },
      },
    });
    const beforeLevel = calculateNinjaPower("reed", reed, initial.equipmentLevels);

    expect(usePlayerStore.getState().levelUpNinja("reed")).toBe(true);
    const leveled = usePlayerStore.getState();
    expect(leveled.ninjaProgress.reed).toMatchObject({ level: 4, experience: 10 });
    expect(
      calculateNinjaPower("reed", leveled.ninjaProgress.reed!, leveled.equipmentLevels),
    ).toBeGreaterThan(beforeLevel);

    const beforeEquipment = calculateNinjaPower(
      "reed",
      leveled.ninjaProgress.reed!,
      leveled.equipmentLevels,
    );
    expect(leveled.upgradeEquipment("equipment.scout-wraps")).toBe(true);
    const upgraded = usePlayerStore.getState();
    expect(upgraded.equipmentLevels["equipment.scout-wraps"]).toBe(2);
    expect(upgraded.coins).toBe(leveled.coins - 100);
    expect(
      calculateNinjaPower("reed", upgraded.ninjaProgress.reed!, upgraded.equipmentLevels),
    ).toBeGreaterThan(beforeEquipment);
  });
});
