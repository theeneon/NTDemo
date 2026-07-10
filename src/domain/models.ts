export type AssetId = `asset.${string}`;
export type NinjaId = `ninja.${string}`;
export type SkillId = `skill.${string}`;
export type StatusId = `status.${string}`;
export type EquipmentId = `equipment.${string}`;
export type EncounterId = `encounter.${string}`;
export type RewardTableId = `reward.${string}`;
export type BattleUnitId = `unit.${"player" | "enemy"}.${number}`;

export type NinjaRole = "striker" | "guard" | "support" | "control";
export type NinjaRank = "common" | "skilled" | "elite";
export type FormationSlot = 0 | 1 | 2 | 3;

export type BaseStats = Readonly<{
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}>;

export type TargetSelector =
  | "self"
  | "singleEnemyLowestHealthPercent"
  | "singleEnemyHighestAttack"
  | "singleEnemyFrontFirst"
  | "allEnemies"
  | "randomEnemy"
  | "singleAllyLowestHealthPercent"
  | "singleAllyLowestHealthPercentIncludingSelf"
  | "allAllies"
  | "allAlliesIncludingSelf";

export type EffectDefinition =
  | Readonly<{
      kind: "damage";
      target: TargetSelector;
      potency: number;
      damageType: "standard" | "true";
    }>
  | Readonly<{
      kind: "heal";
      target: TargetSelector;
      potency: number;
    }>
  | Readonly<{
      kind: "applyStatus";
      target: TargetSelector;
      statusId: StatusId;
      duration: number;
      magnitude?: number;
      chance: number;
    }>
  | Readonly<{
      kind: "cleanse";
      target: TargetSelector;
      count: number;
      tag: "debuff" | "damageOverTime";
    }>;

export type SkillDefinition = Readonly<{
  id: SkillId;
  name: string;
  description: string;
  kind: "basic" | "active" | "passive";
  cooldown: number;
  aiPriority: number;
  iconAssetId: AssetId;
  effects: readonly EffectDefinition[];
}>;

export type StatusDefinition = Readonly<{
  id: StatusId;
  name: string;
  description: string;
  category:
    | "attackModifier"
    | "defenseModifier"
    | "speedModifier"
    | "damageOverTime"
    | "healingOverTime"
    | "stun";
  polarity: "buff" | "debuff";
  timing: "turnStart" | "turnEnd";
  stacking: "refreshStrongest" | "keepLonger";
  iconAssetId: AssetId;
}>;

export type NinjaDefinition = Readonly<{
  id: NinjaId;
  name: string;
  title: string;
  playable: boolean;
  role: NinjaRole;
  rank: NinjaRank;
  baseStats: BaseStats;
  skillIds: readonly SkillId[];
  portraitAssetId: AssetId;
  spriteAssetId: AssetId;
  tags: readonly string[];
}>;

export type EquipmentDefinition = Readonly<{
  id: EquipmentId;
  name: string;
  slot: "weapon" | "armor" | "charm" | "relic";
  rarity: NinjaRank;
  statModifiers: Partial<BaseStats>;
  iconAssetId: AssetId;
  upgradeCost: number;
}>;

export type WeightedReward = Readonly<{
  kind: "equipment" | "coins";
  contentId?: EquipmentId;
  amount: number;
  weight: number;
}>;

export type RewardTableDefinition = Readonly<{
  id: RewardTableId;
  fixedCoins: number;
  squadExperience: number;
  weightedDrops: readonly WeightedReward[];
}>;

export type EncounterUnit = Readonly<{
  ninjaId: NinjaId;
  level: number;
  slot: FormationSlot;
}>;

export type EncounterDefinition = Readonly<{
  id: EncounterId;
  name: string;
  mode: "campaign" | "dungeon";
  recommendedPower: number;
  enemyTeam: readonly EncounterUnit[];
  rewardTableId: RewardTableId;
  firstClearRewardTableId?: RewardTableId;
  prerequisiteEncounterIds: readonly EncounterId[];
  backgroundAssetId: AssetId;
}>;

export type AssetDefinition = Readonly<{
  id: AssetId;
  kind: "portrait" | "sprite" | "icon" | "background";
  source: `placeholder://${string}` | `/assets/${string}`;
  alt: string;
}>;

export type GameContent = Readonly<{
  version: string;
  assets: readonly AssetDefinition[];
  statuses: readonly StatusDefinition[];
  skills: readonly SkillDefinition[];
  ninjas: readonly NinjaDefinition[];
  equipment: readonly EquipmentDefinition[];
  rewardTables: readonly RewardTableDefinition[];
  encounters: readonly EncounterDefinition[];
}>;

export type OwnedNinjaState = {
  ninjaId: NinjaId;
  level: number;
  experience: number;
  equipped: Partial<Record<EquipmentDefinition["slot"], EquipmentId>>;
};

export type SquadState = {
  id: string;
  name: string;
  slots: [NinjaId, NinjaId, NinjaId, NinjaId];
};

export type PlayerProfile = {
  saveVersion: number;
  profileId: string;
  coins: number;
  summonAvailable: boolean;
  ownedNinjas: Record<NinjaId, OwnedNinjaState>;
  ownedEquipment: Partial<Record<EquipmentId, number>>;
  squads: SquadState[];
  completedEncounterIds: EncounterId[];
};

type BattleEventBase = Readonly<{
  battleId: string;
  sequence: number;
}>;

export type BattleEvent =
  | (BattleEventBase & Readonly<{ type: "battleStarted"; seed: string }>)
  | (BattleEventBase & Readonly<{ type: "turnStarted"; unitId: BattleUnitId }>)
  | (BattleEventBase &
      Readonly<{
        type: "skillUsed";
        sourceUnitId: BattleUnitId;
        skillId: SkillId;
        targetUnitIds: readonly BattleUnitId[];
      }>)
  | (BattleEventBase &
      Readonly<{
        type: "damageApplied";
        sourceUnitId: BattleUnitId;
        targetUnitId: BattleUnitId;
        amount: number;
        remainingHealth: number;
      }>)
  | (BattleEventBase &
      Readonly<{
        type: "statusApplied";
        sourceUnitId: BattleUnitId;
        targetUnitId: BattleUnitId;
        statusId: StatusId;
        duration: number;
      }>)
  | (BattleEventBase & Readonly<{ type: "unitDefeated"; unitId: BattleUnitId }>)
  | (BattleEventBase &
      Readonly<{
        type: "battleEnded";
        outcome: "victory" | "defeat" | "draw";
        turns: number;
      }>);
