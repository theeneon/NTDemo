import { create } from "zustand";

type PlaybackSpeed = 1 | 2;

type PresentationState = {
  isMenuOpen: boolean;
  isBattlePaused: boolean;
  playbackSpeed: PlaybackSpeed;
  setMenuOpen: (isMenuOpen: boolean) => void;
  toggleBattlePause: () => void;
  setPlaybackSpeed: (playbackSpeed: PlaybackSpeed) => void;
};

export const usePresentationStore = create<PresentationState>((set) => ({
  isMenuOpen: false,
  isBattlePaused: false,
  playbackSpeed: 1,
  setMenuOpen: (isMenuOpen) => set({ isMenuOpen }),
  toggleBattlePause: () => set((state) => ({ isBattlePaused: !state.isBattlePaused })),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
}));
