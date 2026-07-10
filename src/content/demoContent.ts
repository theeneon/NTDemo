import type { NinjaId, NinjaRole as DomainNinjaRole } from "../domain/models";
import { demoContent } from "./index";

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

const presentation: Partial<Record<NinjaId, { accent: string; glyph: string; trait: string }>> = {
  "ninja.ember": { accent: "#e36b4b", glyph: "火", trait: "Single-target burst" },
  "ninja.reed": { accent: "#6f9d85", glyph: "守", trait: "Front-line protection" },
  "ninja.mist": { accent: "#65a8a3", glyph: "癒", trait: "Healing and regeneration" },
  "ninja.kite": { accent: "#8a83b8", glyph: "風", trait: "Speed disruption" },
  "ninja.flint": { accent: "#d58a4d", glyph: "刃", trait: "Area damage" },
  "ninja.moss": { accent: "#748f5d", glyph: "岩", trait: "Self-sustain" },
  "ninja.rain": { accent: "#5a8fb5", glyph: "水", trait: "Attack support" },
  "ninja.echo": { accent: "#9a6d9a", glyph: "響", trait: "Stun and debuff" },
  "ninja.raider": { accent: "#a8614f", glyph: "賊", trait: "Basic pressure" },
  "ninja.brute": { accent: "#8f554c", glyph: "鬼", trait: "Heavy front attack" },
  "ninja.scout": { accent: "#9b6a55", glyph: "目", trait: "Speed disruption" },
  "ninja.hexer": { accent: "#85556e", glyph: "呪", trait: "Attack suppression" },
};

function getPresentation(ninjaId: NinjaId) {
  const value = presentation[ninjaId];
  if (!value) throw new Error(`Missing presentation metadata for '${ninjaId}'`);
  return value;
}

const roleLabels: Record<DomainNinjaRole, NinjaRole> = {
  striker: "Striker",
  guard: "Guard",
  support: "Support",
  control: "Control",
};

function calculatePresentationPower(ninja: (typeof demoContent.ninjas)[number]) {
  const { maxHealth, attack, defense, speed } = ninja.baseStats;
  return Math.round((attack * 0.45 + defense * 0.25 + speed * 0.15 + maxHealth * 0.035) * 0.9);
}

export const ninjas: Ninja[] = demoContent.ninjas
  .filter((ninja) => ninja.playable)
  .map((ninja, index) => ({
    id: ninja.id.replace("ninja.", ""),
    name: ninja.name,
    title: ninja.title,
    role: roleLabels[ninja.role],
    level: index < 4 ? 3 : 1,
    power: calculatePresentationPower(ninja),
    ...getPresentation(ninja.id),
  }));

const locations: Record<string, string> = {
  "encounter.border-watch": "Dawn road",
  "encounter.bamboo-pass": "Eastern grove",
  "encounter.silent-bridge": "River crossing",
  "encounter.moon-gate": "Old capital",
  "encounter.shoguns-shadow": "Inner keep",
};

export const encounters = demoContent.encounters
  .filter((encounter) => encounter.mode === "campaign")
  .map((encounter, index) => ({
    id: encounter.id.replace("encounter.", ""),
    number: index + 1,
    name: encounter.name,
    location: locations[encounter.id] ?? "Unknown region",
    power: encounter.recommendedPower,
    reward:
      demoContent.rewardTables.find((reward) => reward.id === encounter.rewardTableId)
        ?.fixedCoins ?? 0,
    state: index === 0 ? "complete" : index === 1 ? "available" : "locked",
  }));

const bambooPass = demoContent.encounters.find(
  (encounter) => encounter.id === "encounter.bamboo-pass",
)!;
const enemyHealth = [84, 100, 61, 72];

export const battleEnemies = bambooPass.enemyTeam.map((unit, index) => {
  const definition = demoContent.ninjas.find((ninja) => ninja.id === unit.ninjaId)!;
  return {
    name: definition.name,
    health: enemyHealth[index]!,
    glyph: getPresentation(definition.id).glyph,
  };
});
