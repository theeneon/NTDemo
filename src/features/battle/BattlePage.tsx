import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoContent } from "../../content";
import type { BattleEvent, BattleUnitId, FormationSlot, NinjaId } from "../../domain/models";
import { formatBattleLog, simulateBattle } from "../../engine";
import { Icon } from "../../shared/ui/Icon";
import { initialSquadIds, usePlayerStore } from "../../stores/playerStore";
import { BattleEffectsLayer } from "./BattleEffectsLayer";
import { BattleUnitCard } from "./BattleUnitCard";
import { useBattlePlayback } from "./useBattlePlayback";

const encounterId = "encounter.bamboo-pass" as const;
const battleSeed = "phase-4-bamboo-pass";

export function BattlePage() {
  const navigate = useNavigate();
  const selectedSquadIds = usePlayerStore((state) => state.squadIds);
  const squadIds = selectedSquadIds.length === 4 ? selectedSquadIds : initialSquadIds;
  const squadKey = squadIds.join("|");
  const result = useMemo(() => {
    const playerTeam = squadKey.split("|").map((slug, slot) => ({
      ninjaId: `ninja.${slug}` as NinjaId,
      level: 3,
      slot: slot as FormationSlot,
    }));
    return simulateBattle({
      content: demoContent,
      encounterId,
      playerTeam,
      seed: battleSeed,
    });
  }, [squadKey]);
  const playback = useBattlePlayback(result);
  const [isLogOpen, setLogOpen] = useState(false);
  const [battlefieldElement, setBattlefieldElement] = useState<HTMLElement | null>(null);
  const unitElements = useRef(new Map<BattleUnitId, HTMLElement>());
  const registerUnit = useCallback((unitId: BattleUnitId, element: HTMLElement | null) => {
    if (element) unitElements.current.set(unitId, element);
    else unitElements.current.delete(unitId);
  }, []);
  const getUnitElement = useCallback(
    (unitId: BattleUnitId) => unitElements.current.get(unitId),
    [],
  );

  const units = Object.values(playback.presentation.units).sort(
    (left, right) => left.snapshot.slot - right.snapshot.slot,
  );
  const playerUnits = units.filter(({ snapshot }) => snapshot.side === "player");
  const enemyUnits = units.filter(({ snapshot }) => snapshot.side === "enemy");
  const upcomingTurns = result.events
    .slice(playback.cursor)
    .filter(
      (event): event is Extract<BattleEvent, { type: "turnStarted" }> =>
        event.type === "turnStarted",
    )
    .slice(0, 6);
  const formattedLog = useMemo(
    () => formatBattleLog(result.events.slice(0, playback.cursor), demoContent, result.finalUnits),
    [playback.cursor, result],
  );
  const currentMessage = describeCurrentEvent(playback.currentEvent, result.finalUnits);
  const activeName = playback.presentation.activeUnitId
    ? result.finalUnits.find(({ id }) => id === playback.presentation.activeUnitId)?.name
    : undefined;

  return (
    <div className="battle-page battle-presentation-page">
      <header className="battle-header">
        <div>
          <p className="eyebrow">Campaign · Encounter 02</p>
          <h1>Bamboo Pass</h1>
        </div>
        <div className="battle-status" aria-label="Battle progress">
          <span>Turn {playback.presentation.turn || "—"}</span>
          <i />
          <span>{Math.round(playback.progress * 100)}% resolved</span>
          {playback.reducedMotion ? <small>Reduced motion</small> : null}
        </div>
        <div className="battle-controls" aria-label="Battle playback controls">
          <button
            type="button"
            aria-pressed={playback.isPaused}
            disabled={playback.presentation.completed}
            onClick={() => playback.setPaused(!playback.isPaused)}
          >
            <Icon name={playback.isPaused ? "play" : "pause"} />
            {playback.isPaused ? "Resume" : "Pause"}
          </button>
          <div className="speed-toggle" aria-label="Battle speed">
            {(
              [
                { value: "normal", label: "Normal" },
                { value: "2x", label: "2×" },
                { value: "3x", label: "3×" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={`${option.label} battle speed`}
                aria-pressed={playback.speed === option.value}
                onClick={() => playback.setSpeed(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {playback.presentation.completed ? (
            <button className="skip-button" type="button" onClick={playback.replay}>
              <Icon name="play" /> Replay
            </button>
          ) : (
            <button className="skip-button" type="button" onClick={playback.skip}>
              <Icon name="skip" /> Skip
            </button>
          )}
        </div>
      </header>

      <section className="turn-order" aria-label="Upcoming turn order">
        <span>Next</span>
        {upcomingTurns.map((event, index) => {
          const unit = result.finalUnits.find(({ id }) => id === event.unitId);
          return (
            <i key={event.sequence} className={index === 0 ? "current" : ""} title={unit?.name}>
              {unit?.name.slice(0, 1) ?? "?"}
            </i>
          );
        })}
        {!upcomingTurns.length ? <b>Battle complete</b> : null}
        <small>Seed · {result.seed}</small>
      </section>

      <section
        ref={setBattlefieldElement}
        className="battlefield live-battlefield"
        aria-label="Animated four versus four battlefield"
      >
        <div className="battlefield-horizon" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="battlefield-copy" aria-live="polite">
          <span>
            Eastern grove · Event {playback.cursor} of {result.events.length}
          </span>
          <strong>{activeName ? `${activeName} · ${currentMessage}` : currentMessage}</strong>
          <small>
            {playback.isPaused && !playback.presentation.completed
              ? "Battle paused"
              : "Sequential event playback"}
          </small>
        </div>

        <div
          className="battle-formation battle-formation-player"
          aria-label="Moon Vanguard formation"
        >
          <div className="team-label">
            <span>Moon Vanguard</span>
            <strong>{playerUnits.filter(({ defeated }) => !defeated).length} standing</strong>
          </div>
          {playerUnits.map((unit) => (
            <BattleUnitCard
              key={unit.id}
              unit={unit}
              isActive={playback.presentation.activeUnitId === unit.id}
              currentEvent={playback.currentEvent}
              elementRef={(element) => registerUnit(unit.id, element)}
            />
          ))}
        </div>

        <div
          className="battle-formation battle-formation-enemy"
          aria-label="Bamboo Pass raider formation"
        >
          <div className="team-label">
            <span>Bamboo Raiders</span>
            <strong>{enemyUnits.filter(({ defeated }) => !defeated).length} standing</strong>
          </div>
          {enemyUnits.map((unit) => (
            <BattleUnitCard
              key={unit.id}
              unit={unit}
              isActive={playback.presentation.activeUnitId === unit.id}
              currentEvent={playback.currentEvent}
              elementRef={(element) => registerUnit(unit.id, element)}
            />
          ))}
        </div>

        <span className="versus-mark" aria-hidden="true">
          VS
        </span>
        <BattleEffectsLayer
          event={playback.currentEvent}
          battlefield={battlefieldElement}
          getUnitElement={getUnitElement}
          speed={playback.speed}
          reducedMotion={playback.reducedMotion}
        />

        {playback.presentation.completed ? (
          <div className="battle-result-overlay" role="status" aria-label="Battle result">
            <span>Encounter resolved</span>
            <strong>{playback.presentation.outcome}</strong>
            <p>
              {playback.presentation.rewards
                ? `${playback.presentation.rewards.coins} coins · ${playback.presentation.rewards.squadExperience} squad XP`
                : "No rewards granted"}
            </p>
            <div>
              <button type="button" onClick={playback.replay}>
                <Icon name="play" /> Replay battle
              </button>
              <button type="button" onClick={() => navigate("/results")}>
                View spoils <Icon name="arrow" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className={`battle-log-preview ${isLogOpen ? "battle-log-preview-open" : ""}`}>
        <div>
          <span className="event-icon">
            <Icon name="battle" />
          </span>
          <p>
            <strong>{currentMessage}</strong>
            <span>{formattedLog.at(-1) ?? "Formations enter Bamboo Pass."}</span>
          </p>
        </div>
        <button type="button" aria-expanded={isLogOpen} onClick={() => setLogOpen(!isLogOpen)}>
          {isLogOpen ? "Close combat log" : "Open combat log"} <Icon name="chevron" />
        </button>
        {isLogOpen ? (
          <ol aria-label="Live combat log">
            {formattedLog.slice(-12).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        ) : null}
      </section>
    </div>
  );
}

function describeCurrentEvent(
  event: BattleEvent | null,
  units: readonly { id: BattleUnitId; name: string }[],
) {
  if (!event) return "Formations ready";
  const name = (unitId: BattleUnitId) => units.find(({ id }) => id === unitId)?.name ?? unitId;
  if (event.type === "battleStarted") return "Battle begins";
  if (event.type === "turnStarted") return "takes the turn";
  if (event.type === "movementIntent") {
    return event.intent === "projectile"
      ? "launches a projectile"
      : event.intent === "stationary"
        ? "channels power"
        : "closes the distance";
  }
  if (event.type === "skillUsed") {
    return demoContent.skills.find(({ id }) => id === event.skillId)?.name ?? "uses a skill";
  }
  if (event.type === "damageApplied")
    return `${name(event.targetUnitId)} takes ${event.amount} damage`;
  if (event.type === "healingApplied")
    return `${name(event.targetUnitId)} recovers ${event.amount} health`;
  if (event.type === "statusApplied" || event.type === "statusRefreshed") {
    return demoContent.statuses.find(({ id }) => id === event.statusId)?.name ?? "Status changed";
  }
  if (event.type === "statusTicked")
    return `${name(event.targetUnitId)} · ${event.statusId.replace("status.", "")}`;
  if (event.type === "unitDefeated") return `${name(event.unitId)} is defeated`;
  if (event.type === "passiveTriggered") {
    return demoContent.skills.find(({ id }) => id === event.skillId)?.name ?? "Passive triggered";
  }
  if (event.type === "turnSkipped") return `${name(event.unitId)} is stunned`;
  if (event.type === "battleEnded") return `${event.outcome} · ${event.turns} turns`;
  if (event.type === "rewardsCalculated") return "Rewards secured";
  return "Battle state updated";
}
