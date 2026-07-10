import { Link } from "react-router-dom";
import { encounters } from "../../content/demoContent";
import { Icon } from "../../shared/ui/Icon";
import { PageHeader } from "../../shared/ui/PageHeader";

export function CampaignPage() {
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
            {["賊", "鬼", "目", "呪"].map((glyph, index) => (
              <span key={glyph}>
                <i>{glyph}</i>
                <small>Lv {3 + index}</small>
              </span>
            ))}
          </div>
          <dl className="mission-facts">
            <div>
              <dt>Recommended</dt>
              <dd>430 power</dd>
            </div>
            <div>
              <dt>First clear</dt>
              <dd>100 coins + wraps</dd>
            </div>
            <div>
              <dt>Squad power</dt>
              <dd className="text-jade">477 · Ready</dd>
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
