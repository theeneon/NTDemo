import { useNavigate } from "react-router-dom";
import { demoContent } from "../../content";
import { battleEnemies, ninjas } from "../../content/demoContent";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";
import { usePlayerStore } from "../../stores/playerStore";
import { usePresentationStore } from "../../stores/presentationStore";

export function BattlePage() {
  const navigate = useNavigate();
  const squadIds = usePlayerStore((state) => state.squadIds);
  const squad = squadIds.map((id) => ninjas.find((ninja) => ninja.id === id)).filter(Boolean);
  const squadPower = squad.reduce((total, ninja) => total + (ninja?.power ?? 0), 0);
  const enemyPower = demoContent.encounters.find(
    (encounter) => encounter.id === "encounter.bamboo-pass",
  )!.recommendedPower;
  const isPaused = usePresentationStore((state) => state.isBattlePaused);
  const speed = usePresentationStore((state) => state.playbackSpeed);
  const togglePause = usePresentationStore((state) => state.toggleBattlePause);
  const setSpeed = usePresentationStore((state) => state.setPlaybackSpeed);

  return (
    <div className="battle-page">
      <header className="battle-header">
        <div>
          <p className="eyebrow">Campaign · Encounter 02</p>
          <h1>Bamboo Pass</h1>
        </div>
        <div className="battle-status">
          <span>Turn 12</span>
          <i />
          <span>Wave 1 of 1</span>
        </div>
        <div className="battle-controls">
          <button type="button" onClick={togglePause}>
            <Icon name={isPaused ? "play" : "pause"} />
            {isPaused ? "Resume" : "Pause"}
          </button>
          <div className="speed-toggle" aria-label="Battle speed">
            {([1, 2] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={speed === value}
                onClick={() => setSpeed(value)}
              >
                {value}×
              </button>
            ))}
          </div>
          <button className="skip-button" type="button" onClick={() => navigate("/results")}>
            <Icon name="skip" /> Skip
          </button>
        </div>
      </header>

      <section className="turn-order" aria-label="Upcoming turn order">
        <span>Next</span>
        {["ember", "raider", "mist", "brute", "kite", "reed"].map((name, index) => (
          <i key={`${name}-${index}`} className={index === 0 ? "current" : ""}>
            {name.slice(0, 1).toUpperCase()}
          </i>
        ))}
        <small>Deterministic event preview</small>
      </section>

      <section className="battlefield" aria-label="Static battle presentation placeholder">
        <div className="battlefield-copy">
          <span>Eastern grove</span>
          <strong>{isPaused ? "Battle paused" : "Ember prepares Cinder Arc"}</strong>
          <small>Presentation placeholder · engine connects in Phase 3</small>
        </div>
        <div className="team team-player">
          <div className="team-label">
            <span>Your squad</span>
            <strong>{squadPower} power</strong>
          </div>
          {squad.map((ninja, index) =>
            ninja ? (
              <article className={`battle-unit unit-${index + 1}`} key={ninja.id}>
                <div className="unit-turn-marker">{index === 1 ? "Acting" : ""}</div>
                <NinjaAvatar ninja={ninja} size="lg" />
                <div className="unit-name">
                  <strong>{ninja.name}</strong>
                  <span>Lv {ninja.level}</span>
                </div>
                <div className="health-bar">
                  <span style={{ width: `${95 - index * 9}%` }} />
                </div>
                <div className="status-row">
                  <i>ATK</i>
                  {index === 2 ? <i>HOT</i> : null}
                </div>
              </article>
            ) : null,
          )}
        </div>
        <div className="team team-enemy">
          <div className="team-label">
            <span>Raiders</span>
            <strong>{enemyPower} power</strong>
          </div>
          {battleEnemies.map((enemy, index) => (
            <article className={`battle-unit unit-${index + 1}`} key={enemy.name}>
              <div className="enemy-avatar">
                <span>{enemy.glyph}</span>
              </div>
              <div className="unit-name">
                <strong>{enemy.name}</strong>
                <span>Lv {3 + index}</span>
              </div>
              <div className="health-bar enemy-health">
                <span style={{ width: `${enemy.health}%` }} />
              </div>
              <div className="status-row">{index === 2 ? <i>STUN</i> : <i>—</i>}</div>
            </article>
          ))}
        </div>
        <span className="versus-mark" aria-hidden="true">
          対
        </span>
      </section>

      <section className="battle-log-preview">
        <div>
          <span className="event-icon">
            <Icon name="battle" />
          </span>
          <p>
            <strong>Ember used Cinder Arc</strong>
            <span>Raider took 84 damage · Defense down applied</span>
          </p>
        </div>
        <button type="button">
          Open combat log <Icon name="chevron" />
        </button>
      </section>
    </div>
  );
}
