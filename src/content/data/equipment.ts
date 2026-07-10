import type { EquipmentDefinition } from "../../domain/models";

export const equipment: EquipmentDefinition[] = [
  {
    id: "equipment.scout-wraps",
    name: "Scout Wraps",
    slot: "armor",
    rarity: "common",
    statModifiers: { defense: 4, speed: 1 },
    iconAssetId: "asset.icon-equipment-scout-wraps",
    upgradeCost: 100,
  },
  {
    id: "equipment.ember-kunai",
    name: "Ember Kunai",
    slot: "weapon",
    rarity: "skilled",
    statModifiers: { attack: 9 },
    iconAssetId: "asset.icon-equipment-ember-kunai",
    upgradeCost: 180,
  },
  {
    id: "equipment.river-charm",
    name: "River Charm",
    slot: "charm",
    rarity: "skilled",
    statModifiers: { maxHealth: 45, defense: 3 },
    iconAssetId: "asset.icon-equipment-river-charm",
    upgradeCost: 220,
  },
  {
    id: "equipment.moon-relic",
    name: "Moon Relic",
    slot: "relic",
    rarity: "elite",
    statModifiers: { attack: 6, speed: 3 },
    iconAssetId: "asset.icon-equipment-moon-relic",
    upgradeCost: 340,
  },
];
