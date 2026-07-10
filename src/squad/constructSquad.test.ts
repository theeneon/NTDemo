import { beforeEach, describe, expect, it } from "vitest";
import { demoContent } from "../content";
import { createDemoPlayerProfile } from "../player/profile";
import { constructSquad, SquadValidationError } from "./constructSquad";

describe("legal squad construction", () => {
  const profile = createDemoPlayerProfile(demoContent);

  beforeEach(() => {
    profile.ownedNinjas = createDemoPlayerProfile(demoContent).ownedNinjas;
  });

  it("constructs two unique four-ninja squads from mutable ownership state", () => {
    const alpha = constructSquad(demoContent, profile, "squad.alpha", "Moon Vanguard", [
      "ninja.reed",
      "ninja.ember",
      "ninja.mist",
      "ninja.kite",
    ]);
    const beta = constructSquad(demoContent, profile, "squad.beta", "Dusk Runners", [
      "ninja.moss",
      "ninja.flint",
      "ninja.rain",
      "ninja.echo",
    ]);

    expect(alpha.slots).toHaveLength(4);
    expect(beta.slots).toHaveLength(4);
    expect(new Set([...alpha.slots, ...beta.slots]).size).toBe(8);
  });

  it("rejects duplicate, enemy, and unowned ninjas", () => {
    expect(() =>
      constructSquad(demoContent, profile, "squad.duplicate", "Invalid", [
        "ninja.ember",
        "ninja.ember",
        "ninja.mist",
        "ninja.kite",
      ]),
    ).toThrow("cannot occupy more than one");

    expect(() =>
      constructSquad(demoContent, profile, "squad.enemy", "Invalid", [
        "ninja.ember",
        "ninja.reed",
        "ninja.mist",
        "ninja.raider",
      ]),
    ).toThrow("cannot join a player squad");

    delete profile.ownedNinjas["ninja.echo"];
    expect(() =>
      constructSquad(demoContent, profile, "squad.unowned", "Invalid", [
        "ninja.flint",
        "ninja.moss",
        "ninja.rain",
        "ninja.echo",
      ]),
    ).toThrow(SquadValidationError);
  });
});
