import type { RewardTableDefinition } from "../../domain/models";

export const rewardTables: RewardTableDefinition[] = [
  {
    id: "reward.bamboo-pass",
    fixedCoins: 100,
    squadExperience: 40,
    weightedDrops: [
      { kind: "equipment", contentId: "equipment.scout-wraps", amount: 1, weight: 70 },
      { kind: "coins", amount: 50, weight: 30 },
    ],
  },
  {
    id: "reward.bamboo-pass-first-clear",
    fixedCoins: 75,
    squadExperience: 20,
    weightedDrops: [
      { kind: "equipment", contentId: "equipment.ember-kunai", amount: 1, weight: 100 },
    ],
  },
  {
    id: "reward.underground-shrine",
    fixedCoins: 80,
    squadExperience: 30,
    weightedDrops: [
      { kind: "equipment", contentId: "equipment.river-charm", amount: 1, weight: 60 },
      { kind: "equipment", contentId: "equipment.moon-relic", amount: 1, weight: 15 },
      { kind: "coins", amount: 60, weight: 25 },
    ],
  },
];
