export type NinjaRole = "Striker" | "Guard" | "Support" | "Control";

export type Ninja = {
  id: string;
  name: string;
  title: string;
  role: NinjaRole;
  level: number;
  power: number;
  accent: string;
  glyph: string;
  trait: string;
};

export const ninjas: Ninja[] = [
  {
    id: "ember",
    name: "Ember",
    title: "Cinder Blade",
    role: "Striker",
    level: 3,
    power: 128,
    accent: "#e36b4b",
    glyph: "火",
    trait: "Single-target burst",
  },
  {
    id: "reed",
    name: "Reed",
    title: "Iron Current",
    role: "Guard",
    level: 3,
    power: 121,
    accent: "#6f9d85",
    glyph: "守",
    trait: "Front-line protection",
  },
  {
    id: "mist",
    name: "Mist",
    title: "Quiet Spring",
    role: "Support",
    level: 3,
    power: 116,
    accent: "#65a8a3",
    glyph: "癒",
    trait: "Healing and cleanse",
  },
  {
    id: "kite",
    name: "Kite",
    title: "Gale Thread",
    role: "Control",
    level: 3,
    power: 112,
    accent: "#8a83b8",
    glyph: "風",
    trait: "Speed disruption",
  },
  {
    id: "flint",
    name: "Flint",
    title: "Ash Runner",
    role: "Striker",
    level: 1,
    power: 107,
    accent: "#d58a4d",
    glyph: "刃",
    trait: "Area damage",
  },
  {
    id: "moss",
    name: "Moss",
    title: "Stone Root",
    role: "Guard",
    level: 1,
    power: 102,
    accent: "#748f5d",
    glyph: "岩",
    trait: "Self-sustain",
  },
  {
    id: "rain",
    name: "Rain",
    title: "Silver Drop",
    role: "Support",
    level: 1,
    power: 98,
    accent: "#5a8fb5",
    glyph: "水",
    trait: "Attack support",
  },
  {
    id: "echo",
    name: "Echo",
    title: "Hollow Bell",
    role: "Control",
    level: 1,
    power: 96,
    accent: "#9a6d9a",
    glyph: "響",
    trait: "Stun and debuff",
  },
];

export const encounters = [
  {
    id: "border-watch",
    number: 1,
    name: "Border Watch",
    location: "Dawn road",
    power: 360,
    reward: 80,
    state: "complete",
  },
  {
    id: "bamboo-pass",
    number: 2,
    name: "Bamboo Pass",
    location: "Eastern grove",
    power: 430,
    reward: 100,
    state: "available",
  },
  {
    id: "silent-bridge",
    number: 3,
    name: "Silent Bridge",
    location: "River crossing",
    power: 510,
    reward: 120,
    state: "locked",
  },
  {
    id: "moon-gate",
    number: 4,
    name: "Moon Gate",
    location: "Old capital",
    power: 600,
    reward: 150,
    state: "locked",
  },
  {
    id: "shoguns-shadow",
    number: 5,
    name: "Shogun's Shadow",
    location: "Inner keep",
    power: 710,
    reward: 200,
    state: "locked",
  },
] as const;

export const battleEnemies = [
  { name: "Raider", health: 84, glyph: "賊" },
  { name: "Brute", health: 100, glyph: "鬼" },
  { name: "Scout", health: 61, glyph: "目" },
  { name: "Hexer", health: 72, glyph: "呪" },
];
