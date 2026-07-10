import { create } from "zustand";

type PlayerState = {
  coins: number;
  crystals: number;
  selectedNinjaId: string;
  squadIds: string[];
  setSelectedNinja: (ninjaId: string) => void;
  addToSquad: (ninjaId: string) => void;
  removeFromSquad: (ninjaId: string) => void;
  clearSquad: () => void;
};

export const initialSquadIds = ["reed", "ember", "mist", "kite"];

export const usePlayerStore = create<PlayerState>((set) => ({
  coins: 1240,
  crystals: 0,
  selectedNinjaId: "ember",
  squadIds: initialSquadIds,
  setSelectedNinja: (selectedNinjaId) => set({ selectedNinjaId }),
  addToSquad: (ninjaId) =>
    set((state) => {
      if (state.squadIds.includes(ninjaId) || state.squadIds.length >= 4) return state;
      return { squadIds: [...state.squadIds, ninjaId] };
    }),
  removeFromSquad: (ninjaId) =>
    set((state) => ({ squadIds: state.squadIds.filter((id) => id !== ninjaId) })),
  clearSquad: () => set({ squadIds: [] }),
}));
