import { useMemo, useState } from "react";
import "./CombatLabPage.css";
import { demoContent } from "../../content";
import type { BattleEvent } from "../../domain/models";
import { formatBattleLog, simulateBattle } from "../../engine";
import { Icon } from "../../shared/ui/Icon";
import { PageHeader } from "../../shared/ui/PageHeader";

const playerTeam = [
  { ninjaId: "ninja.reed", level: 3, slot: 0 },
  { ninjaId: "ninja.ember", level: 3, slot: 1 },
  { ninjaId: "ninja.mist", level: 3, slot: 2 },
  { ninjaId: "ninja.kite", level: 3, slot: 3 },
] as const;

function countEvents(events: readonly BattleEvent[]) {
  return events.reduce<Record<string, number>>((counts, event) => {
    counts[event.type] = (counts[event.type] ?? 0) + 1;
    return counts;
  }, {});
}

export function CombatLabPage() {
  const [seed, setSeed] = useState("moonfall-phase-3");
  const [runSeed, setRunSeed] = useState(seed);
  const result = useMemo(
    () =>
      simulateBattle({
        content: demoContent,
        encounterId: "encounter.bamboo-pass",
        playerTeam,
        seed: runSeed,
      }),
    [runSeed],
  );
  const log = formatBattleLog(result.events, demoContent, result.finalUnits);
  const eventCounts = countEvents(result.events);

  return (
    <div className="page-stack combat-lab-page">
      <PageHeader
        eyebrow="Combat engine · deterministic simulation"
        title="The Combat Forge"
        description="Run a complete 4v4 encounter instantly. The engine has no visual dependencies: this screen renders its serializable event stream after the battle is already resolved."
        action={
          <span className={`combat-outcome combat-outcome-${result.outcome}`}>
            <Icon name={result.outcome === "victory" ? "check" : "battle"} /> {result.outcome}
          </span>
        }
      />

      <section className="combat-seed-panel" aria-label="Seed controls">
        <label htmlFor="combat-seed">
          <span>Battle seed</span>
          <input
            id="combat-seed"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            spellCheck={false}
          />
        </label>
        <button type="button" onClick={() => setRunSeed(seed || "moonfall-phase-3")}>
          <Icon name="play" /> Run seeded battle
        </button>
        <p>
          Replay ID <code>{result.battleId}</code>
        </p>
      </section>

      <section className="combat-arena" aria-label="Final battle state">
        <header>
          <span>Moon Vanguard</span>
          <b>Final formation</b>
          <span>Bamboo Pass</span>
        </header>
        <div className="combat-team combat-team-player">
          {result.finalUnits
            .filter((unit) => unit.side === "player")
            .map((unit) => (
              <article key={unit.id} className={unit.defeated ? "unit-fallen" : ""}>
                <span>{unit.slot + 1}</span>
                <div>
                  <strong>{unit.name}</strong>
                  <small>Level {unit.level}</small>
                </div>
                <progress value={unit.health} max={unit.baseStats.maxHealth} />
                <b>
                  {unit.health} / {unit.baseStats.maxHealth}
                </b>
              </article>
            ))}
        </div>
        <div className="combat-versus" aria-hidden="true">
          <span />
          <b>VS</b>
          <span />
        </div>
        <div className="combat-team combat-team-enemy">
          {result.finalUnits
            .filter((unit) => unit.side === "enemy")
            .map((unit) => (
              <article key={unit.id} className={unit.defeated ? "unit-fallen" : ""}>
                <span>{unit.slot + 1}</span>
                <div>
                  <strong>{unit.name}</strong>
                  <small>Level {unit.level}</small>
                </div>
                <progress value={unit.health} max={unit.baseStats.maxHealth} />
                <b>
                  {unit.health} / {unit.baseStats.maxHealth}
                </b>
              </article>
            ))}
        </div>
      </section>

      <section className="combat-metrics" aria-label="Simulation summary">
        <article>
          <span>Turns</span>
          <strong>{result.summary.turns}</strong>
          <small>{result.summary.timeline.toFixed(3)} timeline units</small>
        </article>
        <article>
          <span>Damage dealt</span>
          <strong>{result.summary.damageBySide.player.toLocaleString()}</strong>
          <small>{result.summary.damageBySide.enemy.toLocaleString()} received</small>
        </article>
        <article>
          <span>Healing</span>
          <strong>{result.summary.healingBySide.player.toLocaleString()}</strong>
          <small>capped at maximum health</small>
        </article>
        <article>
          <span>Event stream</span>
          <strong>{result.summary.eventCount}</strong>
          <small>JSON-safe records</small>
        </article>
      </section>

      <div className="combat-lab-grid">
        <section className="combat-console">
          <header>
            <div>
              <p className="eyebrow">Developer-readable replay</p>
              <h2>Battle event log</h2>
            </div>
            <span>{log.length} visible events</span>
          </header>
          <ol aria-label="Battle event log">
            {log.map((line, index) => (
              <li key={`${index}-${line}`}>{line}</li>
            ))}
          </ol>
        </section>

        <aside className="combat-event-ledger">
          <p className="eyebrow">Event ledger</p>
          <h2>Resolver audit</h2>
          <dl>
            {Object.entries(eventCounts)
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([type, count]) => (
                <div key={type}>
                  <dt>{type}</dt>
                  <dd>{count}</dd>
                </div>
              ))}
          </dl>
          {result.rewards ? (
            <div className="combat-reward">
              <Icon name="coin" />
              <div>
                <span>Victory rewards</span>
                <strong>{result.rewards.coins} coins</strong>
                <small>{result.rewards.squadExperience} squad experience</small>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
