import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoContent } from "../content";
import { ninjas } from "../content/demoContent";
import type { EncounterId, EquipmentDefinition, EquipmentId, NinjaId } from "../domain/models";
import type { BattleResult, BattleRewardDrop } from "../engine";

export const PLAYER_SAVE_VERSION = 5;
export const PLAYER_SAVE_STORAGE_KEY = "ninja-tactics-player-save";
export const initialSquadIds: string[] = [];
export const demoDefaultSquadIds = ["reed", "ember", "mist", "kite"];
export const NINJA_LEVEL_EXPERIENCE = 100;
export const starterNinjaIds = ["reed", "ember", "mist", "kite"] as const;
export const ninjaUnlockRequirements: Readonly<Record<string, EncounterId | null>> = {
  reed: null,
  ember: null,
  mist: null,
  kite: null,
  flint: "encounter.border-watch",
  moss: "encounter.bamboo-pass",
  rain: "encounter.silent-bridge",
  echo: "encounter.moon-gate",
};
export const ninjaUnlockCosts: Readonly<Record<string, number>> = {
  reed: 150,
  ember: 150,
  mist: 150,
  kite: 150,
  flint: 300,
  moss: 300,
  rain: 320,
  echo: 350,
};

type EquipmentSlot = EquipmentDefinition["slot"];
export type FirstRunStep = "squad" | "battle" | "rewards" | "upgrade" | "complete";

export type NinjaProgress = {
  level: number;
  experience: number;
  equipped: Partial<Record<EquipmentSlot, EquipmentId>>;
};

export type ActiveBattleRun = {
  encounterId: EncounterId;
  seed: string;
  squadIds: string[];
  completed: boolean;
  isFirstClear: boolean;
};

export type BattleProgressAward = {
  ninjaId: string;
  previousExperience: number;
  experience: number;
  level: number;
  gainedExperience: number;
};

export type LastBattleReport = {
  battleId: string;
  encounterId: EncounterId;
  outcome: BattleResult["outcome"];
  turns: number;
  coins: number;
  squadExperience: number;
  drops: BattleRewardDrop[];
  squadIds: string[];
  progress: BattleProgressAward[];
  unlockedNinjaIds: string[];
};

export type PersistedPlayerState = {
  saveVersion: number;
  coins: number;
  crystals: number;
  selectedNinjaId: string;
  unlockedNinjaIds: string[];
  squadIds: string[];
  ninjaProgress: Record<string, NinjaProgress>;
  ownedEquipment: Partial<Record<EquipmentId, number>>;
  equipmentLevels: Partial<Record<EquipmentId, number>>;
  completedEncounterIds: EncounterId[];
  battleSerial: number;
  activeBattle: ActiveBattleRun | null;
  lastBattle: LastBattleReport | null;
  firstRunStep: FirstRunStep;
};

type PlayerState = PersistedPlayerState & {
  setSelectedNinja: (ninjaId: string) => void;
  unlockNinja: (ninjaId: string) => boolean;
  purchaseNinja: (ninjaId: string) => boolean;
  addToSquad: (ninjaId: string) => void;
  removeFromSquad: (ninjaId: string) => void;
  clearSquad: () => void;
  setFirstRunStep: (step: FirstRunStep) => void;
  startBattle: (encounterId: EncounterId) => boolean;
  completeBattle: (result: BattleResult) => boolean;
  levelUpNinja: (ninjaId: string) => boolean;
  equipItem: (ninjaId: string, equipmentId: EquipmentId) => boolean;
  upgradeEquipment: (equipmentId: EquipmentId) => boolean;
  resetSave: () => void;
};

export function createInitialPlayerState(): PersistedPlayerState {
  const ninjaProgress = Object.fromEntries(
    ninjas.map((ninja) => [
      ninja.id,
      {
        level: ninja.level,
        experience: 80,
        equipped:
          ninja.id === "reed"
            ? ({ armor: "equipment.scout-wraps" } satisfies NinjaProgress["equipped"])
            : {},
      },
    ]),
  );
  return {
    saveVersion: PLAYER_SAVE_VERSION,
    coins: 1_240,
    crystals: 0,
    selectedNinjaId: "reed",
    unlockedNinjaIds: [],
    squadIds: [...initialSquadIds],
    ninjaProgress,
    ownedEquipment: { "equipment.scout-wraps": 1 },
    equipmentLevels: { "equipment.scout-wraps": 1 },
    completedEncounterIds: [],
    battleSerial: 0,
    activeBattle: null,
    lastBattle: null,
    firstRunStep: "squad",
  };
}

const initialState = createInitialPlayerState();

export function migratePlayerSave(persisted: unknown, version: number): PersistedPlayerState {
  void version;
  const fallback = createInitialPlayerState();
  if (!isRecord(persisted)) return fallback;
  const unlockedNinjaIds = Array.isArray(persisted.unlockedNinjaIds)
    ? uniqueStrings(persisted.unlockedNinjaIds).filter(isPlayableSlug)
    : ninjas.map(({ id }) => id);
  const squadIds = Array.isArray(persisted.squadIds)
    ? uniqueStrings(persisted.squadIds)
        .filter((id) => unlockedNinjaIds.includes(id))
        .slice(0, 4)
    : fallback.squadIds;
  const completedEncounterIds = encounterIds(persisted.completedEncounterIds);
  const migrated: PersistedPlayerState = {
    ...fallback,
    coins: finiteNumber(persisted.coins, fallback.coins),
    crystals: finiteNumber(persisted.crystals, fallback.crystals),
    selectedNinjaId:
      typeof persisted.selectedNinjaId === "string" &&
      unlockedNinjaIds.includes(persisted.selectedNinjaId)
        ? persisted.selectedNinjaId
        : (unlockedNinjaIds[0] ?? fallback.selectedNinjaId),
    squadIds,
    unlockedNinjaIds,
  };

  return {
    ...migrated,
    saveVersion: PLAYER_SAVE_VERSION,
    ninjaProgress: mergeNinjaProgress(persisted.ninjaProgress, fallback.ninjaProgress),
    ownedEquipment: equipmentNumberRecord(persisted.ownedEquipment, fallback.ownedEquipment),
    equipmentLevels: equipmentNumberRecord(persisted.equipmentLevels, fallback.equipmentLevels),
    completedEncounterIds,
    battleSerial: finiteNumber(persisted.battleSerial, 0),
    activeBattle: validActiveBattle(persisted.activeBattle, completedEncounterIds),
    lastBattle: validLastBattle(persisted.lastBattle),
    firstRunStep: isFirstRunStep(persisted.firstRunStep) ? persisted.firstRunStep : "squad",
  };
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setSelectedNinja: (selectedNinjaId) => {
        if (get().unlockedNinjaIds.includes(selectedNinjaId)) set({ selectedNinjaId });
      },
      unlockNinja: (ninjaId) => {
        const state = get();
        if (
          !isPlayableSlug(ninjaId) ||
          state.unlockedNinjaIds.includes(ninjaId) ||
          !isNinjaUnlockAvailable(ninjaId, state.completedEncounterIds)
        ) {
          return false;
        }
        set({
          unlockedNinjaIds: [...state.unlockedNinjaIds, ninjaId],
          selectedNinjaId: state.unlockedNinjaIds.length === 0 ? ninjaId : state.selectedNinjaId,
        });
        return true;
      },
      purchaseNinja: (ninjaId) => {
        const state = get();
        const cost = getNinjaUnlockCost(ninjaId);
        if (
          !isPlayableSlug(ninjaId) ||
          state.unlockedNinjaIds.includes(ninjaId) ||
          state.coins < cost
        ) {
          return false;
        }
        set({
          coins: state.coins - cost,
          unlockedNinjaIds: [...state.unlockedNinjaIds, ninjaId],
          selectedNinjaId: state.unlockedNinjaIds.length === 0 ? ninjaId : state.selectedNinjaId,
        });
        return true;
      },
      addToSquad: (ninjaId) =>
        set((state) => {
          if (
            !isPlayableSlug(ninjaId) ||
            !state.unlockedNinjaIds.includes(ninjaId) ||
            state.squadIds.includes(ninjaId) ||
            state.squadIds.length >= 4
          ) {
            return state;
          }
          return { squadIds: [...state.squadIds, ninjaId] };
        }),
      removeFromSquad: (ninjaId) =>
        set((state) => ({ squadIds: state.squadIds.filter((id) => id !== ninjaId) })),
      clearSquad: () => set({ squadIds: [] }),
      setFirstRunStep: (firstRunStep) => set({ firstRunStep }),
      startBattle: (encounterId) => {
        const state = get();
        if (
          state.squadIds.length !== 4 ||
          !state.squadIds.every((ninjaId) => state.unlockedNinjaIds.includes(ninjaId)) ||
          !isEncounterUnlocked(encounterId, state.completedEncounterIds)
        ) {
          return false;
        }
        const battleSerial = state.battleSerial + 1;
        set({
          battleSerial,
          activeBattle: {
            encounterId,
            seed: `vertical-slice-${encounterId.replace("encounter.", "")}-${battleSerial}`,
            squadIds: [...state.squadIds],
            completed: false,
            isFirstClear: !state.completedEncounterIds.includes(encounterId),
          },
          firstRunStep: "battle",
        });
        return true;
      },
      completeBattle: (result) => {
        const state = get();
        const activeBattle = state.activeBattle;
        if (!activeBattle || state.lastBattle?.battleId === result.battleId) return false;
        const rewards = result.rewards;
        const squadExperience = rewards?.squadExperience ?? 0;
        const drops = rewards?.drops ?? [];
        const coinDrop = drops.reduce(
          (total, drop) => total + (drop.kind === "coins" ? drop.amount : 0),
          0,
        );
        const coins = (rewards?.coins ?? 0) + coinDrop;
        const ninjaProgress = { ...state.ninjaProgress };
        const progress = activeBattle.squadIds.map((ninjaId) => {
          const previous = ninjaProgress[ninjaId] ?? { level: 1, experience: 0, equipped: {} };
          const next = { ...previous, experience: previous.experience + squadExperience };
          ninjaProgress[ninjaId] = next;
          return {
            ninjaId,
            previousExperience: previous.experience,
            experience: next.experience,
            level: next.level,
            gainedExperience: squadExperience,
          };
        });
        const ownedEquipment = { ...state.ownedEquipment };
        const equipmentLevels = { ...state.equipmentLevels };
        const unlockedNinjaIds = [...state.unlockedNinjaIds];
        if (result.outcome === "victory") {
          for (const ninja of ninjas) {
            if (
              !unlockedNinjaIds.includes(ninja.id) &&
              isNinjaUnlockAvailable(ninja.id, [
                ...state.completedEncounterIds,
                activeBattle.encounterId,
              ])
            ) {
              unlockedNinjaIds.push(ninja.id);
            }
          }
        }
        const newlyUnlockedNinjaIds = unlockedNinjaIds.filter(
          (ninjaId) => !state.unlockedNinjaIds.includes(ninjaId),
        );
        for (const drop of drops) {
          if (drop.kind !== "equipment" || !drop.contentId) continue;
          ownedEquipment[drop.contentId] = (ownedEquipment[drop.contentId] ?? 0) + drop.amount;
          equipmentLevels[drop.contentId] ??= 1;
        }
        set({
          coins: state.coins + coins,
          ninjaProgress,
          ownedEquipment,
          equipmentLevels,
          unlockedNinjaIds,
          completedEncounterIds:
            result.outcome === "victory"
              ? [...new Set([...state.completedEncounterIds, activeBattle.encounterId])]
              : state.completedEncounterIds,
          activeBattle: { ...activeBattle, completed: true },
          lastBattle: {
            battleId: result.battleId,
            encounterId: activeBattle.encounterId,
            outcome: result.outcome,
            turns: result.summary.turns,
            coins,
            squadExperience,
            drops: [...drops],
            squadIds: [...activeBattle.squadIds],
            progress,
            unlockedNinjaIds: newlyUnlockedNinjaIds,
          },
          firstRunStep: "rewards",
        });
        return true;
      },
      levelUpNinja: (ninjaId) => {
        const state = get();
        const progress = state.ninjaProgress[ninjaId];
        if (
          !state.unlockedNinjaIds.includes(ninjaId) ||
          !progress ||
          progress.experience < NINJA_LEVEL_EXPERIENCE
        ) {
          return false;
        }
        set({
          ninjaProgress: {
            ...state.ninjaProgress,
            [ninjaId]: {
              ...progress,
              level: progress.level + 1,
              experience: progress.experience - NINJA_LEVEL_EXPERIENCE,
            },
          },
          firstRunStep: "complete",
        });
        return true;
      },
      equipItem: (ninjaId, equipmentId) => {
        const state = get();
        const progress = state.ninjaProgress[ninjaId];
        const equipment = demoContent.equipment.find(({ id }) => id === equipmentId);
        if (
          !state.unlockedNinjaIds.includes(ninjaId) ||
          !progress ||
          !equipment ||
          !(state.ownedEquipment[equipmentId] ?? 0)
        ) {
          return false;
        }
        set({
          ninjaProgress: {
            ...state.ninjaProgress,
            [ninjaId]: {
              ...progress,
              equipped: { ...progress.equipped, [equipment.slot]: equipmentId },
            },
          },
        });
        return true;
      },
      upgradeEquipment: (equipmentId) => {
        const state = get();
        const equipment = demoContent.equipment.find(({ id }) => id === equipmentId);
        const currentLevel = state.equipmentLevels[equipmentId] ?? 1;
        const cost = equipment ? equipment.upgradeCost * currentLevel : Number.POSITIVE_INFINITY;
        if (!equipment || !(state.ownedEquipment[equipmentId] ?? 0) || state.coins < cost) {
          return false;
        }
        set({
          coins: state.coins - cost,
          equipmentLevels: { ...state.equipmentLevels, [equipmentId]: currentLevel + 1 },
          firstRunStep: "complete",
        });
        return true;
      },
      resetSave: () => set(createInitialPlayerState()),
    }),
    {
      name: PLAYER_SAVE_STORAGE_KEY,
      version: PLAYER_SAVE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => migratePlayerSave(persisted, version),
      partialize: (state): PersistedPlayerState => ({
        saveVersion: PLAYER_SAVE_VERSION,
        coins: state.coins,
        crystals: state.crystals,
        selectedNinjaId: state.selectedNinjaId,
        unlockedNinjaIds: state.unlockedNinjaIds,
        squadIds: state.squadIds,
        ninjaProgress: state.ninjaProgress,
        ownedEquipment: state.ownedEquipment,
        equipmentLevels: state.equipmentLevels,
        completedEncounterIds: state.completedEncounterIds,
        battleSerial: state.battleSerial,
        activeBattle: state.activeBattle,
        lastBattle: state.lastBattle,
        firstRunStep: state.firstRunStep,
      }),
    },
  ),
);

export function calculateNinjaPower(
  ninjaId: string,
  progress: NinjaProgress,
  equipmentLevels: PersistedPlayerState["equipmentLevels"],
) {
  const presentation = ninjas.find(({ id }) => id === ninjaId);
  if (!presentation) return 0;
  const levelPower = Math.round(presentation.power * (1 + (progress.level - 1) * 0.05));
  const equipmentPower = Object.values(progress.equipped).reduce((total, equipmentId) => {
    const equipment = demoContent.equipment.find(({ id }) => id === equipmentId);
    if (!equipment) return total;
    const itemLevel = equipmentLevels[equipment.id] ?? 1;
    const modifiers = equipment.statModifiers;
    return (
      total +
      Math.round(
        ((modifiers.maxHealth ?? 0) * 0.035 +
          (modifiers.attack ?? 0) * 0.45 +
          (modifiers.defense ?? 0) * 0.25 +
          (modifiers.speed ?? 0) * 0.15) *
          itemLevel,
      )
    );
  }, 0);
  return levelPower + equipmentPower;
}

export function equipmentUpgradeCost(equipmentId: EquipmentId, level: number) {
  const equipment = demoContent.equipment.find(({ id }) => id === equipmentId);
  return equipment ? equipment.upgradeCost * level : 0;
}

export function isEncounterUnlocked(
  encounterId: EncounterId,
  completedEncounterIds: readonly EncounterId[],
) {
  const encounter = demoContent.encounters.find(({ id }) => id === encounterId);
  return Boolean(
    encounter &&
    (encounter.mode === "dungeon" ||
      encounter.prerequisiteEncounterIds.every((id) => completedEncounterIds.includes(id))),
  );
}

export function getNinjaUnlockRequirement(ninjaId: string): EncounterId | null {
  return ninjaUnlockRequirements[ninjaId] ?? null;
}

export function getNinjaUnlockCost(ninjaId: string) {
  return ninjaUnlockCosts[ninjaId] ?? Number.POSITIVE_INFINITY;
}

export function isNinjaUnlockAvailable(
  ninjaId: string,
  completedEncounterIds: readonly EncounterId[],
) {
  const requirement = getNinjaUnlockRequirement(ninjaId);
  return requirement === null || completedEncounterIds.includes(requirement);
}

function isPlayableSlug(value: string) {
  return ninjas.some(({ id }) => id === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function finiteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function uniqueStrings(values: unknown[]) {
  return [...new Set(values.filter((value): value is string => typeof value === "string"))];
}

function mergeNinjaProgress(value: unknown, fallback: Record<string, NinjaProgress>) {
  if (!isRecord(value)) return fallback;
  return Object.fromEntries(
    Object.entries(fallback).map(([ninjaId, initial]) => {
      const stored = value[ninjaId];
      return [
        ninjaId,
        isRecord(stored)
          ? {
              level: Math.max(1, Math.floor(finiteNumber(stored.level, initial.level))),
              experience: Math.floor(finiteNumber(stored.experience, initial.experience)),
              equipped: isRecord(stored.equipped)
                ? (stored.equipped as NinjaProgress["equipped"])
                : initial.equipped,
            }
          : initial,
      ];
    }),
  );
}

function equipmentNumberRecord(value: unknown, fallback: Partial<Record<EquipmentId, number>>) {
  if (!isRecord(value)) return fallback;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([id, amount]) => id.startsWith("equipment.") && typeof amount === "number")
      .map(([id, amount]) => [id, Math.max(0, Math.floor(amount as number))]),
  ) as Partial<Record<EquipmentId, number>>;
}

function encounterIds(value: unknown): EncounterId[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (id): id is EncounterId =>
      typeof id === "string" && demoContent.encounters.some((encounter) => encounter.id === id),
  );
}

function validActiveBattle(
  value: unknown,
  completedEncounterIds: readonly EncounterId[] = [],
): ActiveBattleRun | null {
  if (!isRecord(value) || typeof value.encounterId !== "string" || typeof value.seed !== "string") {
    return null;
  }
  const squadIds = Array.isArray(value.squadIds)
    ? uniqueStrings(value.squadIds).filter(isPlayableSlug).slice(0, 4)
    : [];
  if (squadIds.length !== 4) return null;
  return {
    encounterId: value.encounterId as EncounterId,
    seed: value.seed,
    squadIds,
    completed: Boolean(value.completed),
    isFirstClear:
      typeof value.isFirstClear === "boolean"
        ? value.isFirstClear
        : !completedEncounterIds.includes(value.encounterId as EncounterId),
  };
}

function validLastBattle(value: unknown): LastBattleReport | null {
  if (!isRecord(value)) return null;
  const legacyDrop = isRecord(value.drop) ? (value.drop as BattleRewardDrop) : undefined;
  const drops = Array.isArray(value.drops)
    ? (value.drops as BattleRewardDrop[])
    : legacyDrop
      ? [legacyDrop]
      : [];
  return { ...(value as LastBattleReport), drops };
}

function isFirstRunStep(value: unknown): value is FirstRunStep {
  return ["squad", "battle", "rewards", "upgrade", "complete"].includes(String(value));
}

export function ninjaIdFromSlug(slug: string): NinjaId {
  return `ninja.${slug}`;
}
