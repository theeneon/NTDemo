import type { CSSProperties, Ref } from "react";
import { demoContent } from "../../content";
import type { BattleEvent, BattleUnitId } from "../../domain/models";
import type { PresentedUnit } from "./battlePresentation";

const accents: Record<string, string> = {
  guard: "#78a789",
  striker: "#d86b4d",
  support: "#65aaa2",
  control: "#8e82ba",
};

export function BattleUnitCard({
  unit,
  isActive,
  currentEvent,
  elementRef,
}: {
  unit: PresentedUnit;
  isActive: boolean;
  currentEvent: BattleEvent | null;
  elementRef: Ref<HTMLElement>;
}) {
  const definition = demoContent.ninjas.find(({ id }) => id === unit.snapshot.ninjaId)!;
  const maxHealth = unit.snapshot.baseStats.maxHealth;
  const healthPercent = Math.max(0, Math.min(100, (unit.health / maxHealth) * 100));
  const cue = eventCueForUnit(currentEvent, unit.id);
  const visibleStatuses = unit.statuses.slice(0, 3);

  return (
    <article
      ref={elementRef}
      data-unit-id={unit.id}
      className={[
        "battle-combatant",
        `battle-combatant-${unit.snapshot.side}`,
        isActive ? "battle-combatant-active" : "",
        unit.defeated ? "battle-combatant-defeated" : "",
        cue ? `battle-combatant-${cue}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--unit-accent": accents[definition.role] } as CSSProperties}
      aria-label={`${unit.snapshot.name}, ${unit.health} of ${maxHealth} health${unit.defeated ? ", defeated" : ""}`}
    >
      <div className="combatant-turn-badge" aria-hidden={!isActive}>
        {isActive ? "Acting" : `Slot ${unit.snapshot.slot + 1}`}
      </div>
      <div className="combatant-portrait" aria-hidden="true">
        <span>{unit.snapshot.name.slice(0, 1)}</span>
        <i>{roleGlyph(definition.role)}</i>
      </div>
      <div className="combatant-nameplate">
        <div>
          <strong>{unit.snapshot.name}</strong>
          <small>
            Lv {unit.snapshot.level} · {definition.role}
          </small>
        </div>
        <b>{unit.health}</b>
      </div>
      <div className="combatant-health">
        <span style={{ width: `${healthPercent}%` }} />
      </div>
      <div className="combatant-statuses" aria-label={`${unit.snapshot.name} statuses`}>
        {visibleStatuses.map((status) => {
          const statusDefinition = demoContent.statuses.find(({ id }) => id === status.statusId)!;
          return (
            <span
              key={status.statusId}
              className={`combat-status combat-status-${statusDefinition.polarity}`}
              title={`${statusDefinition.name}: ${status.duration} turns`}
            >
              {statusDefinition.name.slice(0, 3).toUpperCase()}
              <b>{status.duration}</b>
            </span>
          );
        })}
        {unit.statuses.length > visibleStatuses.length ? (
          <span className="combat-status combat-status-more">
            +{unit.statuses.length - visibleStatuses.length}
          </span>
        ) : null}
        {!unit.statuses.length ? <small>No effects</small> : null}
      </div>
      {unit.defeated ? <div className="combatant-defeated-mark">Defeated</div> : null}
    </article>
  );
}

function eventCueForUnit(event: BattleEvent | null, unitId: BattleUnitId) {
  if (!event) return null;
  if (event.type === "movementIntent" && event.unitId === unitId && event.intent !== "stationary") {
    return event.intent === "retreat" ? "retreat" : "acting";
  }
  if (event.type === "damageApplied" && event.targetUnitId === unitId) return "hit";
  if (event.type === "healingApplied" && event.targetUnitId === unitId) return "healed";
  if (event.type === "statusTicked" && event.targetUnitId === unitId) {
    return event.tickKind === "damage" ? "hit" : "healed";
  }
  if (
    (event.type === "statusApplied" || event.type === "statusRefreshed") &&
    event.targetUnitId === unitId
  ) {
    return "statused";
  }
  return null;
}

function roleGlyph(role: (typeof demoContent.ninjas)[number]["role"]) {
  return role === "guard" ? "◇" : role === "support" ? "+" : role === "control" ? "◎" : "×";
}
