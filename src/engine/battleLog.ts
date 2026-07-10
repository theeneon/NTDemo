import type { BattleEvent, GameContent } from "../domain/models";
import type { RuntimeUnitSnapshot } from "./types";

export function formatBattleLog(
  events: readonly BattleEvent[],
  content?: GameContent,
  units?: readonly RuntimeUnitSnapshot[],
): string[] {
  const skillNames = new Map(content?.skills.map((skill) => [skill.id, skill.name]) ?? []);
  const statusNames = new Map(content?.statuses.map((status) => [status.id, status.name]) ?? []);
  const unitNames = new Map<string, string>(units?.map((unit) => [unit.id, unit.name]) ?? []);

  const name = (unitId: string) => unitNames.get(unitId) ?? unitId.replace("unit.", "");
  const lines: string[] = [];

  for (const event of events) {
    const prefix = `${String(event.sequence).padStart(3, "0")} |`;
    switch (event.type) {
      case "battleStarted":
        lines.push(`${prefix} Battle started with seed ${event.seed}.`);
        break;
      case "turnStarted":
        lines.push(
          `${prefix} Turn ${event.turn}: ${name(event.unitId)} acts at ${event.timeline}.`,
        );
        break;
      case "skillUsed":
        lines.push(
          `${prefix} ${name(event.sourceUnitId)} uses ${skillNames.get(event.skillId) ?? event.skillId} -> ${event.targetUnitIds.map(name).join(", ")}.`,
        );
        break;
      case "damageApplied":
        lines.push(
          `${prefix} ${name(event.targetUnitId)} takes ${event.amount} damage (${event.remainingHealth} HP).`,
        );
        break;
      case "healingApplied":
        lines.push(
          `${prefix} ${name(event.targetUnitId)} recovers ${event.amount} health (${event.remainingHealth} HP).`,
        );
        break;
      case "statusApplied":
      case "statusRefreshed":
        lines.push(
          `${prefix} ${statusNames.get(event.statusId) ?? event.statusId} ${event.type === "statusApplied" ? "applied to" : "refreshed on"} ${name(event.targetUnitId)} for ${event.duration} turns.`,
        );
        break;
      case "statusTicked":
        lines.push(
          `${prefix} ${statusNames.get(event.statusId) ?? event.statusId} ${event.tickKind === "damage" ? "damages" : "heals"} ${name(event.targetUnitId)} for ${event.amount}.`,
        );
        break;
      case "statusExpired":
        lines.push(
          `${prefix} ${statusNames.get(event.statusId) ?? event.statusId} expires on ${name(event.targetUnitId)}.`,
        );
        break;
      case "passiveTriggered":
        lines.push(
          `${prefix} ${name(event.unitId)} triggers ${skillNames.get(event.skillId) ?? event.skillId} (${event.trigger}).`,
        );
        break;
      case "unitDefeated":
        lines.push(`${prefix} ${name(event.unitId)} is defeated.`);
        break;
      case "turnSkipped":
        lines.push(`${prefix} ${name(event.unitId)} loses the turn to ${event.reason}.`);
        break;
      case "battleEnded":
        lines.push(
          `${prefix} Battle ended: ${event.outcome} after ${event.turns} turns (${event.reason}).`,
        );
        break;
      case "rewardsCalculated":
        lines.push(`${prefix} Rewards: ${event.coins} coins, ${event.squadExperience} squad XP.`);
        break;
      case "turnLimitReached":
        lines.push(`${prefix} Turn limit reached (${event.maximumTurns}).`);
        break;
      case "triggerLimitReached":
        lines.push(`${prefix} Passive trigger limit reached (${event.maximumTriggers}).`);
        break;
      case "invalidState":
        lines.push(`${prefix} Invalid state: ${event.message}`);
        break;
      case "movementIntent":
      case "turnEnded":
      case "cooldownChanged":
        break;
    }
  }
  return lines;
}
