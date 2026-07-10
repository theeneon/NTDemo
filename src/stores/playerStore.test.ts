import { beforeEach, describe, expect, it } from "vitest";
import { initialSquadIds, usePlayerStore } from "./playerStore";

describe("player store squad selection", () => {
  beforeEach(() => {
    usePlayerStore.setState({ squadIds: [...initialSquadIds], selectedNinjaId: "ember" });
  });

  it("does not add duplicate ninjas or exceed four slots", () => {
    const store = usePlayerStore.getState();
    store.addToSquad("ember");
    store.addToSquad("flint");
    expect(usePlayerStore.getState().squadIds).toEqual(initialSquadIds);
  });

  it("removes a ninja and fills the open slot", () => {
    usePlayerStore.getState().removeFromSquad("kite");
    usePlayerStore.getState().addToSquad("flint");
    expect(usePlayerStore.getState().squadIds).toEqual(["reed", "ember", "mist", "flint"]);
  });
});
