import type {
  BaseStats,
  BattleEvent,
  BattleUnitId,
  EncounterId,
  EquipmentId,
  FormationSlot,
  GameContent,
  NinjaId,
  SkillId,
  StatusId,
} from "../domain/models";
import type { Seed } from "../shared/random/seededRng";

export type BattleSide = "player" | "enemy";

export type BattleParticipant = Readonly<{
  ninjaId: NinjaId;
  level: number;
  slot: FormationSlot;
  equipmentIds?: readonly EquipmentId[];
}>;

export type BattleInput = Readonly<{
  content: GameContent;
  encounterId: EncounterId;
  playerTeam: readonly BattleParticipant[];
  seed: Seed;
  maximumTurns?: number;
  maximumPassiveTriggers?: number;
}>;

export type RuntimeStatus = Readonly<{
  statusId: StatusId;
  sourceUnitId: BattleUnitId;
  remainingTurns: number;
  magnitude: number;
}>;

export type RuntimeUnitSnapshot = Readonly<{
  id: BattleUnitId;
  side: BattleSide;
  slot: FormationSlot;
  ninjaId: NinjaId;
  name: string;
  level: number;
  baseStats: BaseStats;
  health: number;
  nextActionAt: number;
  skillIds: readonly SkillId[];
  cooldowns: Readonly<Partial<Record<SkillId, number>>>;
  statuses: readonly RuntimeStatus[];
  defeated: boolean;
}>;

export type BattleRewards = Readonly<{
  coins: number;
  squadExperience: number;
  drop?: Readonly<{
    kind: "equipment" | "coins";
    contentId?: EquipmentId;
    amount: number;
  }>;
}>;

export type BattleSummary = Readonly<{
  turns: number;
  timeline: number;
  damageBySide: Readonly<Record<BattleSide, number>>;
  healingBySide: Readonly<Record<BattleSide, number>>;
  defeatedUnitIds: readonly BattleUnitId[];
  eventCount: number;
}>;

export type BattleResult = Readonly<{
  battleId: string;
  seed: string;
  outcome: "victory" | "defeat" | "draw";
  reason: "elimination" | "turnLimit" | "invalidState";
  events: readonly BattleEvent[];
  finalUnits: readonly RuntimeUnitSnapshot[];
  rewards?: BattleRewards;
  summary: BattleSummary;
}>;
