import type { GameContent, NinjaId, PlayerProfile } from "../domain/models";

export function createDemoPlayerProfile(content: GameContent): PlayerProfile {
  const playableNinjas = content.ninjas.filter((ninja) => ninja.playable);
  const ownedNinjas = Object.fromEntries(
    playableNinjas.map((ninja) => [
      ninja.id,
      {
        ninjaId: ninja.id,
        level: 1,
        experience: 0,
        equipped: {},
      },
    ]),
  ) as PlayerProfile["ownedNinjas"];

  return {
    saveVersion: 1,
    profileId: "profile.local-demo",
    coins: 1_240,
    ownedNinjas,
    ownedEquipment: { "equipment.scout-wraps": 1 },
    squads: [],
    completedEncounterIds: [],
  };
}

export function getOwnedNinjaIds(profile: PlayerProfile): NinjaId[] {
  return Object.keys(profile.ownedNinjas) as NinjaId[];
}
