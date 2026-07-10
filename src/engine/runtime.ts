import type { BaseStats, BattleUnitId, GameContent, SkillId } from "../domain/models";
import type { BattleParticipant, BattleSide, RuntimeStatus, RuntimeUnitSnapshot } from "./types";

export type RuntimeUnit = {
  id: BattleUnitId;
  side: BattleSide;
  slot: BattleParticipant["slot"];
  ninjaId: BattleParticipant["ninjaId"];
  name: string;
  level: number;
  baseStats: BaseStats;
  health: number;
  nextActionAt: number;
  skillIds: SkillId[];
  cooldowns: Partial<Record<SkillId, number>>;
  statuses: RuntimeStatus[];
  defeated: boolean;
  usedPassives: Set<SkillId>;
};

const levelScale = (level: number) => 1 + (Math.max(1, level) - 1) * 0.05;

export function createRuntimeUnits(
  content: GameContent,
  participants: readonly BattleParticipant[],
  side: BattleSide,
): RuntimeUnit[] {
  const ninjas = new Map(content.ninjas.map((ninja) => [ninja.id, ninja]));
  const equipment = new Map(content.equipment.map((item) => [item.id, item]));

  return participants
    .slice()
    .sort((left, right) => left.slot - right.slot)
    .map((participant, index) => {
      const ninja = ninjas.get(participant.ninjaId);
      if (!ninja) throw new Error(`Unknown ninja '${participant.ninjaId}'`);
      const modifiers = (participant.equipmentIds ?? []).reduce<
        Partial<Record<keyof BaseStats, number>>
      >((total, equipmentId) => {
        const item = equipment.get(equipmentId);
        if (!item) throw new Error(`Unknown equipment '${equipmentId}'`);
        const itemLevel = Math.max(1, participant.equipmentLevels?.[equipmentId] ?? 1);
        for (const stat of ["maxHealth", "attack", "defense", "speed"] as const) {
          total[stat] = (total[stat] ?? 0) + (item.statModifiers[stat] ?? 0) * itemLevel;
        }
        return total;
      }, {});
      const scale = levelScale(participant.level);
      const baseStats: BaseStats = {
        maxHealth: Math.round(ninja.baseStats.maxHealth * scale + (modifiers.maxHealth ?? 0)),
        attack: Math.round(ninja.baseStats.attack * scale + (modifiers.attack ?? 0)),
        defense: Math.round(ninja.baseStats.defense * scale + (modifiers.defense ?? 0)),
        speed: Math.max(1, Math.round(ninja.baseStats.speed * scale + (modifiers.speed ?? 0))),
      };

      return {
        id: `unit.${side}.${index}`,
        side,
        slot: participant.slot,
        ninjaId: participant.ninjaId,
        name: ninja.name,
        level: participant.level,
        baseStats,
        health: baseStats.maxHealth,
        nextActionAt: 1_000 / baseStats.speed,
        skillIds: [...ninja.skillIds],
        cooldowns: {},
        statuses: [],
        defeated: false,
        usedPassives: new Set(),
      };
    });
}

export function snapshotRuntimeUnit(unit: RuntimeUnit): RuntimeUnitSnapshot {
  return {
    id: unit.id,
    side: unit.side,
    slot: unit.slot,
    ninjaId: unit.ninjaId,
    name: unit.name,
    level: unit.level,
    baseStats: { ...unit.baseStats },
    health: unit.health,
    nextActionAt: unit.nextActionAt,
    skillIds: [...unit.skillIds],
    cooldowns: { ...unit.cooldowns },
    statuses: unit.statuses.map((status) => ({ ...status })),
    defeated: unit.defeated,
  };
}
