import { Link } from "react-router-dom";
import { demoContent } from "../../content";
import { battleEnemies, encounters, ninjas } from "../../content/demoContent";
import { Icon } from "../../shared/ui/Icon";
import { PageHeader } from "../../shared/ui/PageHeader";
import { usePlayerStore } from "../../stores/playerStore";

export function CampaignPage() {
  const squadIds = usePlayerStore((state) => state.squadIds);
  const squadPower = squadIds.reduce(
    (total, id) => total + (ninjas.find((ninja) => ninja.id === id)?.power ?? 0),
    0,
  );
  const mission = demoContent.encounters.find(
    (encounter) => encounter.id === "encounter.bamboo-pass",
  )!;
  const missionReward = demoContent.rewardTables.find(
    (reward) => reward.id === mission.rewardTableId,
  )!;
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Chapter one · eastern province"
        title="Follow the moonlit trail."
        description="Five campaign encounters establish the demo progression arc. The first completed node and next available mission are represented in this foundation."
        action={
          <Link className="secondary-button" to="/squad">
            Edit squad
          </Link>
        }
      />

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
          <p className="eyebrow">Next mission · 02</p>
          <h2>Bamboo Pass</h2>
          <p>
            Raiders have blocked the eastern trade road. Break their formation before the scout
            escapes.
          </p>
          <div className="enemy-preview">
            {battleEnemies.map((enemy, index) => (
              <span key={enemy.name}>
                <i>{enemy.glyph}</i>
                <small>Lv {mission.enemyTeam[index]?.level}</small>
              </span>
            ))}
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
          <Link className="primary-button full-button" to="/battle">
            Enter battle <Icon name="arrow" />
          </Link>
          <div className="dungeon-card">
            <Icon name="shield" />
            <div>
              <span>Repeatable dungeon</span>
              <strong>Underground Shrine</strong>
              <small>Unlocks after encounter 3</small>
            </div>
            <Icon name="lock" />
          </div>
        </aside>
      </div>
    </div>
  );
}
