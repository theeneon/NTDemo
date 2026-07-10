import { Link } from "react-router-dom";
import { demoContent } from "../../content";
import { encounters } from "../../content/demoContent";
import { FirstRunGuide } from "../../shared/ui/FirstRunGuide";
import { Icon } from "../../shared/ui/Icon";
import { PageHeader } from "../../shared/ui/PageHeader";
import { calculateNinjaPower, usePlayerStore } from "../../stores/playerStore";

export function CampaignPage() {
  const squadIds = usePlayerStore((state) => state.squadIds);
  const ninjaProgress = usePlayerStore((state) => state.ninjaProgress);
  const equipmentLevels = usePlayerStore((state) => state.equipmentLevels);
  const startBattle = usePlayerStore((state) => state.startBattle);
  const squadPower = squadIds.reduce(
    (total, id) =>
      total + (ninjaProgress[id] ? calculateNinjaPower(id, ninjaProgress[id], equipmentLevels) : 0),
    0,
  );
  const mission = demoContent.encounters.find(
    (encounter) => encounter.id === "encounter.underground-shrine",
  )!;
  const missionReward = demoContent.rewardTables.find(
    (reward) => reward.id === mission.rewardTableId,
  )!;
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Expedition board · repeatable dungeon"
        title="Choose the next expedition."
        description="The Underground Shrine is the complete vertical-slice dungeon: deploy your saved squad, earn real rewards, improve, and replay."
        action={
          <Link className="secondary-button" to="/squad">
            Edit squad
          </Link>
        }
      />

      <FirstRunGuide />

      <div className="campaign-layout">
        <section className="campaign-map" aria-label="Campaign encounter map">
          <div className="map-watermark" aria-hidden="true">
            東
          </div>
          <div className="map-path" aria-hidden="true" />
          {encounters.map((encounter, index) => (
            <article
              className={`encounter-node node-${index + 1} node-${encounter.state}`}
              key={encounter.id}
            >
              <span className="node-marker">
                {encounter.state === "locked" ? (
                  <Icon name="lock" />
                ) : encounter.state === "complete" ? (
                  <Icon name="check" />
                ) : (
                  encounter.number
                )}
              </span>
              <div>
                <small>{encounter.location}</small>
                <strong>{encounter.name}</strong>
                <span>{encounter.power} recommended power</span>
              </div>
            </article>
          ))}
          <div className="map-legend">
            <span>
              <i className="complete" /> Complete
            </span>
            <span>
              <i className="available" /> Available
            </span>
            <span>
              <i /> Locked
            </span>
          </div>
        </section>

        <aside className="mission-panel">
          <p className="eyebrow">Repeatable dungeon · vertical slice</p>
          <h2>Underground Shrine</h2>
          <p>
            A raider cell has occupied the shrine beneath Moonfall Vale. Clear the chamber and
            recover its equipment cache.
          </p>
          <div className="enemy-preview">
            {mission.enemyTeam.map((unit) => {
              const enemy = demoContent.ninjas.find(({ id }) => id === unit.ninjaId)!;
              return (
                <span key={`${unit.ninjaId}-${unit.slot}`}>
                  <i>{enemy.name.slice(0, 1)}</i>
                  <small>Lv {unit.level}</small>
                </span>
              );
            })}
          </div>
          <dl className="mission-facts">
            <div>
              <dt>Recommended</dt>
              <dd>{mission.recommendedPower} power</dd>
            </div>
            <div>
              <dt>Battle reward</dt>
              <dd>
                {missionReward.fixedCoins} coins + {missionReward.squadExperience} XP
              </dd>
            </div>
            <div>
              <dt>Squad power</dt>
              <dd className="text-jade">
                {squadPower} · {squadPower >= mission.recommendedPower ? "Ready" : "Below target"}
              </dd>
            </div>
          </dl>
          <Link
            className={`primary-button full-button ${squadIds.length !== 4 ? "button-disabled" : ""}`}
            aria-disabled={squadIds.length !== 4}
            to={squadIds.length === 4 ? "/battle" : "/squad"}
            onClick={() => {
              if (squadIds.length === 4) startBattle(mission.id);
            }}
          >
            {squadIds.length === 4 ? "Enter dungeon" : "Complete squad"} <Icon name="arrow" />
          </Link>
          <div className="dungeon-card">
            <Icon name="shield" />
            <div>
              <span>Repeatable dungeon</span>
              <strong>Underground Shrine</strong>
              <small>Unlocked · rewards apply every victory</small>
            </div>
            <Icon name="check" />
          </div>
        </aside>
      </div>
    </div>
  );
}
