import type { GameContent, NinjaId, PlayerProfile, SquadState } from "../domain/models";

export class SquadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SquadValidationError";
  }
}

export function constructSquad(
  content: GameContent,
  profile: PlayerProfile,
  squadId: string,
  name: string,
  ninjaIds: readonly NinjaId[],
): SquadState {
  if (ninjaIds.length !== 4) {
    throw new SquadValidationError(
      `A legal squad requires exactly four ninjas; received ${ninjaIds.length}`,
    );
  }
  if (new Set(ninjaIds).size !== ninjaIds.length) {
    throw new SquadValidationError("A ninja cannot occupy more than one squad slot");
  }

  const ninjaById = new Map(content.ninjas.map((ninja) => [ninja.id, ninja]));
  ninjaIds.forEach((ninjaId) => {
    const definition = ninjaById.get(ninjaId);
    if (!definition) throw new SquadValidationError(`Unknown ninja '${ninjaId}'`);
    if (!definition.playable) {
      throw new SquadValidationError(`Enemy definition '${ninjaId}' cannot join a player squad`);
    }
    if (!profile.ownedNinjas[ninjaId]) {
      throw new SquadValidationError(`Player does not own '${ninjaId}'`);
    }
  });

  const [slot0, slot1, slot2, slot3] = ninjaIds;
  return {
    id: squadId,
    name,
    slots: [slot0!, slot1!, slot2!, slot3!],
  };
}
