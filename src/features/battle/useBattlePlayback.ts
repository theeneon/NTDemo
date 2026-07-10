import { useCallback, useEffect, useState } from "react";
import type { BattleEvent } from "../../domain/models";
import type { BattleResult } from "../../engine";
import {
  applyBattleEvent,
  createBattlePresentation,
  reduceBattleEvents,
  type BattlePresentationState,
} from "./battlePresentation";

export type PlaybackSpeed = 1 | 2;

export type BattlePlayback = Readonly<{
  presentation: BattlePresentationState;
  cursor: number;
  progress: number;
  currentEvent: BattleEvent | null;
  isPaused: boolean;
  speed: PlaybackSpeed;
  reducedMotion: boolean;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  skip: () => void;
  replay: () => void;
}>;

export function useBattlePlayback(result: BattleResult): BattlePlayback {
  const [presentation, setPresentation] = useState(() => createBattlePresentation(result));
  const [cursor, setCursor] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (isPaused || cursor >= result.events.length) return;
    const previousEvent = cursor > 0 ? result.events[cursor - 1] : undefined;
    const delay = cursor === 0 ? 0 : eventDisplayDuration(previousEvent!, speed, reducedMotion);
    const timeoutId = window.setTimeout(() => {
      const event = result.events[cursor];
      if (!event) return;
      setPresentation((current) => applyBattleEvent(current, event));
      setCursor((current) => current + 1);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [cursor, isPaused, reducedMotion, result, speed]);

  const skip = useCallback(() => {
    setPresentation(reduceBattleEvents(result));
    setCursor(result.events.length);
    setPaused(true);
  }, [result]);

  const replay = useCallback(() => {
    setPresentation(createBattlePresentation(result));
    setCursor(0);
    setPaused(false);
  }, [result]);

  return {
    presentation,
    cursor,
    progress: result.events.length ? cursor / result.events.length : 1,
    currentEvent: cursor > 0 ? (result.events[cursor - 1] ?? null) : null,
    isPaused,
    speed,
    reducedMotion,
    setPaused,
    setSpeed,
    skip,
    replay,
  };
}

export function eventDisplayDuration(
  event: BattleEvent,
  speed: PlaybackSpeed,
  reducedMotion: boolean,
) {
  if (reducedMotion) return Math.max(4, Math.round(8 / speed));
  const durationByType: Partial<Record<BattleEvent["type"], number>> = {
    turnStarted: 90,
    movementIntent: 150,
    skillUsed: 175,
    damageApplied: 180,
    healingApplied: 180,
    statusApplied: 150,
    statusRefreshed: 150,
    statusTicked: 165,
    statusExpired: 90,
    passiveTriggered: 155,
    turnSkipped: 150,
    unitDefeated: 280,
    rewardsCalculated: 200,
    battleEnded: 300,
  };
  return Math.round((durationByType[event.type] ?? 18) / speed);
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === "undefined" || typeof window.matchMedia !== "function"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}
