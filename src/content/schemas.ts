import { z } from "zod";

const id = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}\\.[a-z0-9][a-z0-9-]*$`), `Expected ${prefix}.<slug>`);

export const assetIdSchema = id("asset");
export const ninjaIdSchema = id("ninja");
export const skillIdSchema = id("skill");
export const statusIdSchema = id("status");
export const equipmentIdSchema = id("equipment");
export const encounterIdSchema = id("encounter");
export const rewardTableIdSchema = id("reward");

const positiveStat = z.number().int().positive().max(999_999);

export const baseStatsSchema = z.object({
  maxHealth: positiveStat,
  attack: positiveStat,
  defense: z.number().int().nonnegative().max(999_999),
  speed: positiveStat,
});

export const targetSelectorSchema = z.enum([
  "self",
  "singleEnemyLowestHealthPercent",
  "singleEnemyHighestAttack",
  "singleEnemyFrontFirst",
  "allEnemies",
  "randomEnemy",
  "singleAllyLowestHealthPercent",
  "singleAllyLowestHealthPercentIncludingSelf",
  "allAllies",
  "allAlliesIncludingSelf",
]);

const damageEffectSchema = z.object({
  kind: z.literal("damage"),
  target: targetSelectorSchema,
  potency: z.number().int().positive().max(2_000),
  damageType: z.enum(["standard", "true"]),
});

const healEffectSchema = z.object({
  kind: z.literal("heal"),
  target: targetSelectorSchema,
  potency: z.number().int().positive().max(2_000),
});

const applyStatusEffectSchema = z.object({
  kind: z.literal("applyStatus"),
  target: targetSelectorSchema,
  statusId: statusIdSchema,
  duration: z.number().int().positive().max(20),
  magnitude: z.number().min(-10).max(10).optional(),
  chance: z.number().int().min(0).max(100),
});

const cleanseEffectSchema = z.object({
  kind: z.literal("cleanse"),
  target: targetSelectorSchema,
  count: z.number().int().positive().max(20),
  tag: z.enum(["debuff", "damageOverTime"]),
});

export const effectSchema = z.discriminatedUnion("kind", [
  damageEffectSchema,
  healEffectSchema,
  applyStatusEffectSchema,
  cleanseEffectSchema,
]);

export const skillSchema = z.object({
  id: skillIdSchema,
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(300),
  kind: z.enum(["basic", "active", "passive"]),
  cooldown: z.number().int().min(0).max(20),
  aiPriority: z.number().int().min(0).max(100),
  iconAssetId: assetIdSchema,
  effects: z.array(effectSchema).min(1).max(12),
});

export const statusSchema = z.object({
  id: statusIdSchema,
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(300),
  category: z.enum([
    "attackModifier",
    "defenseModifier",
    "speedModifier",
    "damageOverTime",
    "healingOverTime",
    "stun",
  ]),
  polarity: z.enum(["buff", "debuff"]),
  timing: z.enum(["turnStart", "turnEnd"]),
  stacking: z.enum(["refreshStrongest", "keepLonger"]),
  iconAssetId: assetIdSchema,
});

export const ninjaSchema = z.object({
  id: ninjaIdSchema,
  name: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(120),
  playable: z.boolean(),
  role: z.enum(["striker", "guard", "support", "control"]),
  rank: z.enum(["common", "skilled", "elite"]),
  baseStats: baseStatsSchema,
  skillIds: z.array(skillIdSchema).min(1).max(8),
  portraitAssetId: assetIdSchema,
  spriteAssetId: assetIdSchema,
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
});

export const equipmentSchema = z.object({
  id: equipmentIdSchema,
  name: z.string().trim().min(1).max(80),
  slot: z.enum(["weapon", "armor", "charm", "relic"]),
  rarity: z.enum(["common", "skilled", "elite"]),
  statModifiers: baseStatsSchema.partial(),
  iconAssetId: assetIdSchema,
  upgradeCost: z.number().int().nonnegative().max(10_000_000),
});

export const weightedRewardSchema = z
  .object({
    kind: z.enum(["equipment", "coins"]),
    contentId: equipmentIdSchema.optional(),
    amount: z.number().int().positive().max(10_000_000),
    weight: z.number().int().positive().max(1_000_000),
  })
  .superRefine((reward, context) => {
    if (reward.kind === "equipment" && !reward.contentId) {
      context.addIssue({
        code: "custom",
        path: ["contentId"],
        message: "Equipment rewards require contentId",
      });
    }
    if (reward.kind === "coins" && reward.contentId) {
      context.addIssue({
        code: "custom",
        path: ["contentId"],
        message: "Coin rewards cannot reference equipment",
      });
    }
  });

export const rewardTableSchema = z.object({
  id: rewardTableIdSchema,
  fixedCoins: z.number().int().nonnegative().max(10_000_000),
  squadExperience: z.number().int().nonnegative().max(10_000_000),
  weightedDrops: z.array(weightedRewardSchema).max(100),
});

export const encounterUnitSchema = z.object({
  ninjaId: ninjaIdSchema,
  level: z.number().int().positive().max(100),
  slot: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});

export const encounterSchema = z.object({
  id: encounterIdSchema,
  name: z.string().trim().min(1).max(120),
  mode: z.enum(["campaign", "dungeon"]),
  recommendedPower: z.number().int().positive().max(10_000_000),
  enemyTeam: z.array(encounterUnitSchema).length(4),
  rewardTableId: rewardTableIdSchema,
  firstClearRewardTableId: rewardTableIdSchema.optional(),
  prerequisiteEncounterIds: z.array(encounterIdSchema).max(20),
  backgroundAssetId: assetIdSchema,
});

export const assetSchema = z.object({
  id: assetIdSchema,
  kind: z.enum(["portrait", "sprite", "icon", "background"]),
  source: z.union([
    z.string().regex(/^placeholder:\/\/[a-z0-9][a-z0-9/-]*$/),
    z.string().regex(/^\/assets\/[a-zA-Z0-9._/-]+$/),
  ]),
  alt: z.string().trim().min(1).max(200),
});

export const gameContentSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  assets: z.array(assetSchema).min(1),
  statuses: z.array(statusSchema).min(1),
  skills: z.array(skillSchema).min(1),
  ninjas: z.array(ninjaSchema).min(8),
  equipment: z.array(equipmentSchema).min(1),
  rewardTables: z.array(rewardTableSchema).min(1),
  encounters: z.array(encounterSchema).min(2),
});

export type RawGameContent = z.input<typeof gameContentSchema>;
