import type { BattleEvent, BattleUnitId, SkillId, StatusId } from "../../domain/models";
import type { BattleResult, RuntimeUnitSnapshot } from "../../engine";

export type PresentedStatus = Readonly<{
  statusId: StatusId;
  duration: number;
  magnitude: number;
}>;

export type PresentedUnit = Readonly<{
  id: BattleUnitId;
  snapshot: RuntimeUnitSnapshot;
  health: number;
  statuses: readonly PresentedStatus[];
  defeated: boolean;
}>;

export type BattlePresentationState = Readonly<{
  units: Readonly<Record<BattleUnitId, PresentedUnit>>;
  turn: number;
  activeUnitId: BattleUnitId | null;
  activeSkillId: SkillId | null;
  outcome: BattleResult["outcome"] | null;
  rewards: BattleResult["rewards"] | null;
  completed: boolean;
  lastEvent: BattleEvent | null;
}>;

export function createBattlePresentation(result: BattleResult): BattlePresentationState {
  const units = Object.fromEntries(
    result.finalUnits.map((snapshot) => [
      snapshot.id,
      {
        id: snapshot.id,
        snapshot,
        health: snapshot.baseStats.maxHealth,
        statuses: [],
        defeated: false,
      } satisfies PresentedUnit,
    ]),
  ) as Record<BattleUnitId, PresentedUnit>;

  return {
    units,
    turn: 0,
    activeUnitId: null,
    activeSkillId: null,
    outcome: null,
    rewards: null,
    completed: false,
    lastEvent: null,
  };
}

export function applyBattleEvent(
  state: BattlePresentationState,
  event: BattleEvent,
): BattlePresentationState {
  const next = { ...state, lastEvent: event };

  switch (event.type) {
    case "turnStarted":
      return {
        ...next,
        turn: event.turn,
        activeUnitId: event.unitId,
        activeSkillId: null,
      };
    case "turnEnded":
      return {
        ...next,
        activeUnitId: state.activeUnitId === event.unitId ? null : state.activeUnitId,
        activeSkillId: null,
      };
    case "skillUsed":
      return { ...next, activeUnitId: event.sourceUnitId, activeSkillId: event.skillId };
    case "damageApplied":
      return updateUnit(next, event.targetUnitId, (unit) => ({
        ...unit,
        health: event.remainingHealth,
      }));
    case "healingApplied":
      return updateUnit(next, event.targetUnitId, (unit) => ({
        ...unit,
        health: event.remainingHealth,
      }));
    case "statusTicked":
      return updateUnit(next, event.targetUnitId, (unit) => ({
        ...unit,
        health:
          event.tickKind === "damage"
            ? Math.max(0, unit.health - event.amount)
            : Math.min(unit.snapshot.baseStats.maxHealth, unit.health + event.amount),
      }));
    case "statusApplied":
    case "statusRefreshed":
      return updateUnit(next, event.targetUnitId, (unit) => ({
        ...unit,
        statuses: [
          ...unit.statuses.filter(({ statusId }) => statusId !== event.statusId),
          {
            statusId: event.statusId,
            duration: event.duration,
            magnitude: event.magnitude,
          },
        ].sort((left, right) => left.statusId.localeCompare(right.statusId)),
      }));
    case "statusExpired":
      return updateUnit(next, event.targetUnitId, (unit) => ({
        ...unit,
        statuses: unit.statuses.filter(({ statusId }) => statusId !== event.statusId),
      }));
    case "unitDefeated":
      return updateUnit(next, event.unitId, (unit) => ({
        ...unit,
        health: 0,
        defeated: true,
        statuses: [],
      }));
    case "rewardsCalculated":
      return {
        ...next,
        rewards: {
          coins: event.coins,
          squadExperience: event.squadExperience,
          ...(event.drop ? { drop: event.drop } : {}),
        },
      };
    case "battleEnded":
      return {
        ...next,
        outcome: event.outcome,
        completed: true,
        activeUnitId: null,
        activeSkillId: null,
      };
    case "battleStarted":
    case "turnSkipped":
    case "movementIntent":
    case "passiveTriggered":
    case "cooldownChanged":
    case "turnLimitReached":
    case "triggerLimitReached":
    case "invalidState":
      return next;
  }
}

export function reduceBattleEvents(
  result: BattleResult,
  eventCount = result.events.length,
): BattlePresentationState {
  return result.events
    .slice(0, eventCount)
    .reduce(applyBattleEvent, createBattlePresentation(result));
}

function updateUnit(
  state: BattlePresentationState,
  unitId: BattleUnitId,
  update: (unit: PresentedUnit) => PresentedUnit,
): BattlePresentationState {
  const unit = state.units[unitId];
  if (!unit) return state;
  return {
    ...state,
    units: {
      ...state.units,
      [unitId]: update(unit),
    },
  };
}
