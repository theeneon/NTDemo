import type { AssetDefinition, AssetId } from "../../domain/models";

const combatants = [
  ["ember", "Ember"],
  ["reed", "Reed"],
  ["mist", "Mist"],
  ["kite", "Kite"],
  ["flint", "Flint"],
  ["moss", "Moss"],
  ["rain", "Rain"],
  ["echo", "Echo"],
  ["raider", "Raider"],
  ["brute", "Brute"],
  ["scout", "Scout"],
  ["hexer", "Hexer"],
] as const;

const skillIcons = [
  "basic-strike",
  "cinder-arc",
  "iron-stance",
  "quiet-spring",
  "gale-thread",
  "ash-sweep",
  "stone-root",
  "silver-rain",
  "hollow-bell",
  "brutal-crush",
  "hamstring",
  "weakening-hex",
] as const;

const statusIcons = [
  "attack-up",
  "attack-down",
  "defense-up",
  "defense-down",
  "speed-down",
  "regeneration",
  "stun",
] as const;

export const assets: AssetDefinition[] = [
  ...combatants.flatMap(([slug, name]) => [
    {
      id: `asset.portrait-${slug}` as AssetId,
      kind: "portrait" as const,
      source: `placeholder://portraits/${slug}` as const,
      alt: `${name} portrait placeholder`,
    },
    {
      id: `asset.sprite-${slug}` as AssetId,
      kind: "sprite" as const,
      source: `placeholder://sprites/${slug}` as const,
      alt: `${name} battle sprite placeholder`,
    },
  ]),
  ...skillIcons.map((slug) => ({
    id: `asset.icon-skill-${slug}` as AssetId,
    kind: "icon" as const,
    source: `placeholder://icons/skills/${slug}` as const,
    alt: `${slug.replaceAll("-", " ")} skill icon`,
  })),
  ...statusIcons.map((slug) => ({
    id: `asset.icon-status-${slug}` as AssetId,
    kind: "icon" as const,
    source: `placeholder://icons/statuses/${slug}` as const,
    alt: `${slug.replaceAll("-", " ")} status icon`,
  })),
  ...(["scout-wraps", "ember-kunai", "river-charm", "moon-relic"] as const).map((slug) => ({
    id: `asset.icon-equipment-${slug}` as AssetId,
    kind: "icon" as const,
    source: `placeholder://icons/equipment/${slug}` as const,
    alt: `${slug.replaceAll("-", " ")} equipment icon`,
  })),
  ...(
    [
      ["border-watch", "Dawn road border watch"],
      ["bamboo-pass", "Moonlit bamboo pass"],
      ["silent-bridge", "Silent river bridge"],
      ["moon-gate", "Old capital moon gate"],
      ["shoguns-shadow", "Inner keep courtyard"],
      ["underground-shrine", "Underground shrine dungeon"],
    ] as const
  ).map(([slug, alt]) => ({
    id: `asset.background-${slug}` as AssetId,
    kind: "background" as const,
    source: `placeholder://backgrounds/${slug}` as const,
    alt: `${alt} battlefield`,
  })),
];
