import type { EncounterDefinition, EncounterId } from "../../domain/models";

const enemyTeam: EncounterDefinition["enemyTeam"] = [
  { ninjaId: "ninja.raider", level: 3, slot: 0 },
  { ninjaId: "ninja.brute", level: 4, slot: 1 },
  { ninjaId: "ninja.scout", level: 5, slot: 2 },
  { ninjaId: "ninja.hexer", level: 6, slot: 3 },
];

type CampaignSeed = {
  slug: string;
  name: string;
  recommendedPower: number;
  prerequisite?: EncounterId;
  background: EncounterDefinition["backgroundAssetId"];
};

const campaignSeeds: CampaignSeed[] = [
  {
    slug: "border-watch",
    name: "Border Watch",
    recommendedPower: 360,
    background: "asset.background-border-watch",
  },
  {
    slug: "bamboo-pass",
    name: "Bamboo Pass",
    recommendedPower: 430,
    prerequisite: "encounter.border-watch",
    background: "asset.background-bamboo-pass",
  },
  {
    slug: "silent-bridge",
    name: "Silent Bridge",
    recommendedPower: 510,
    prerequisite: "encounter.bamboo-pass",
    background: "asset.background-silent-bridge",
  },
  {
    slug: "moon-gate",
    name: "Moon Gate",
    recommendedPower: 600,
    prerequisite: "encounter.silent-bridge",
    background: "asset.background-moon-gate",
  },
  {
    slug: "shoguns-shadow",
    name: "Shogun's Shadow",
    recommendedPower: 710,
    prerequisite: "encounter.moon-gate",
    background: "asset.background-shoguns-shadow",
  },
];

export const encounters: EncounterDefinition[] = [
  ...campaignSeeds.map((seed, index) => ({
    id: `encounter.${seed.slug}` as EncounterId,
    name: seed.name,
    mode: "campaign" as const,
    recommendedPower: seed.recommendedPower,
    enemyTeam: enemyTeam.map((unit) => ({ ...unit, level: unit.level + index })),
    rewardTableId: "reward.bamboo-pass" as const,
    firstClearRewardTableId: "reward.bamboo-pass-first-clear" as const,
    prerequisiteEncounterIds: seed.prerequisite ? [seed.prerequisite] : [],
    backgroundAssetId: seed.background,
  })),
  {
    id: "encounter.underground-shrine",
    name: "Underground Shrine",
    mode: "dungeon",
    recommendedPower: 520,
    enemyTeam: [
      { ninjaId: "ninja.brute", level: 6, slot: 0 },
      { ninjaId: "ninja.brute", level: 6, slot: 1 },
      { ninjaId: "ninja.hexer", level: 7, slot: 2 },
      { ninjaId: "ninja.scout", level: 7, slot: 3 },
    ],
    rewardTableId: "reward.underground-shrine",
    prerequisiteEncounterIds: ["encounter.silent-bridge"],
    backgroundAssetId: "asset.background-underground-shrine",
  },
];
