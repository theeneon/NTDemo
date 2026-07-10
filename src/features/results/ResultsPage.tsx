import { Link } from "react-router-dom";
import { demoContent } from "../../content";
import { ninjas } from "../../content/demoContent";
import { FirstRunGuide } from "../../shared/ui/FirstRunGuide";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";
import { usePlayerStore } from "../../stores/playerStore";

export function ResultsPage() {
  const report = usePlayerStore((state) => state.lastBattle);
  const coins = usePlayerStore((state) => state.coins);
  const ninjaProgress = usePlayerStore((state) => state.ninjaProgress);
  const startBattle = usePlayerStore((state) => state.startBattle);
  const setSelectedNinja = usePlayerStore((state) => state.setSelectedNinja);
  const setFirstRunStep = usePlayerStore((state) => state.setFirstRunStep);

  if (!report) {
    return (
      <div className="results-page empty-results-page">
        <section className="victory-hero">
          <span className="victory-seal">?</span>
          <p className="eyebrow">No expedition report</p>
          <h1>Complete a dungeon first.</h1>
          <p>Your applied rewards and squad experience will appear here.</p>
          <Link className="primary-button" to="/squad">
            Form a squad
          </Link>
        </section>
      </div>
    );
  }

  const encounter = demoContent.encounters.find(({ id }) => id === report.encounterId)!;
  const equipmentDrop =
    report.drop?.kind === "equipment"
      ? demoContent.equipment.find(({ id }) => id === report.drop?.contentId)
      : undefined;
  const isVictory = report.outcome === "victory";

  return (
    <div className="results-page">
      <FirstRunGuide />
      <section className="victory-hero">
        <span className={`victory-seal ${isVictory ? "" : "defeat-seal"}`}>
          {isVictory ? "V" : "X"}
        </span>
        <p className="eyebrow">Battle complete · {report.turns} turns</p>
        <h1>{isVictory ? `Victory at ${encounter.name}` : `Defeat at ${encounter.name}`}</h1>
        <p>
          {isVictory
            ? "Rewards were applied to the versioned local save exactly once."
            : "Improve the squad and return for another attempt."}
        </p>
      </section>

      <section className="reward-grid" aria-label="Applied battle rewards">
        <article>
          <span>
            <Icon name="coin" />
          </span>
          <div>
            <small>Coins earned</small>
            <strong>+{report.coins}</strong>
            <p>{coins.toLocaleString()} total</p>
          </div>
        </article>
        <article>
          <span>
            <Icon name="spark" />
          </span>
          <div>
            <small>Squad experience</small>
            <strong>+{report.squadExperience}</strong>
            <p>Applied to all four ninjas</p>
          </div>
        </article>
        <article className="equipment-reward">
          <span>E</span>
          <div>
            <small>{report.drop?.kind === "coins" ? "Bonus cache" : "Equipment drop"}</small>
            <strong>
              {equipmentDrop?.name ??
                (report.drop?.kind === "coins" ? `${report.drop.amount} bonus coins` : "No item")}
            </strong>
            <p>{equipmentDrop ? "Added to inventory · Level 1" : "Seeded reward result"}</p>
          </div>
        </article>
      </section>

      <section className="result-progress">
        <div className="section-toolbar">
          <div>
            <p className="eyebrow">Squad progress</p>
            <h2>Experience applied</h2>
          </div>
          <span>Saved locally · refresh safe</span>
        </div>
        <div className="progress-list">
          {report.progress.map((award) => {
            const ninja = ninjas.find(({ id }) => id === award.ninjaId)!;
            const progress = ninjaProgress[award.ninjaId]!;
            const ready = progress.experience >= 100;
            return (
              <article key={award.ninjaId}>
                <NinjaAvatar ninja={ninja} size="sm" />
                <div>
                  <span>
                    <strong>{ninja.name}</strong>
                    <small>
                      Level {progress.level} ·{" "}
                      {ready ? "Level up ready" : `${progress.experience} / 100 XP`}
                    </small>
                  </span>
                  <div className="xp-bar">
                    <i style={{ width: `${Math.min(100, progress.experience)}%` }} />
                  </div>
                </div>
                <b>+{award.gainedExperience} XP</b>
              </article>
            );
          })}
        </div>
      </section>

      <div className="result-actions">
        <Link className="secondary-button" to="/squad">
          Return to squad
        </Link>
        <Link
          className="secondary-button"
          to="/battle"
          onClick={() => startBattle(report.encounterId)}
        >
          Replay {encounter.mode === "dungeon" ? "dungeon" : "mission"}
        </Link>
        {isVictory && encounter.mode === "campaign" ? (
          <Link className="secondary-button" to="/campaign">
            Next mission unlocked
          </Link>
        ) : null}
        <Link
          className="primary-button"
          to="/upgrades"
          onClick={() => {
            const selected = report.squadIds[0];
            if (selected) setSelectedNinja(selected);
            setFirstRunStep("upgrade");
          }}
        >
          Improve squad <Icon name="arrow" />
        </Link>
      </div>
    </div>
  );
}
