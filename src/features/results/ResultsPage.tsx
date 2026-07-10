import { Link } from "react-router-dom";
import { demoContent } from "../../content";
import { ninjas } from "../../content/demoContent";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";

export function ResultsPage() {
  const encounter = demoContent.encounters.find((item) => item.id === "encounter.bamboo-pass")!;
  const reward = demoContent.rewardTables.find((item) => item.id === encounter.rewardTableId)!;
  const equipmentDrop = reward.weightedDrops.find((drop) => drop.kind === "equipment");
  const equipment = demoContent.equipment.find((item) => item.id === equipmentDrop?.contentId);

  return (
    <div className="results-page">
      <section className="victory-hero">
        <span className="victory-seal">勝</span>
        <p className="eyebrow">Battle complete · 38 turns</p>
        <h1>Victory at Bamboo Pass</h1>
        <p>Your formation held the front line while Ember broke the raider guard.</p>
      </section>
      <section className="reward-grid">
        <article>
          <span>
            <Icon name="coin" />
          </span>
          <div>
            <small>Coins earned</small>
            <strong>+{reward.fixedCoins}</strong>
            <p>{(1_240 + reward.fixedCoins).toLocaleString()} total</p>
          </div>
        </article>
        <article>
          <span>
            <Icon name="spark" />
          </span>
          <div>
            <small>Squad experience</small>
            <strong>+{reward.squadExperience}</strong>
            <p>Applied to all four ninjas</p>
          </div>
        </article>
        <article className="equipment-reward">
          <span>装</span>
          <div>
            <small>Equipment drop</small>
            <strong>{equipment?.name ?? "Equipment"}</strong>
            <p>Validated reward table · New</p>
          </div>
        </article>
      </section>
      <section className="result-progress">
        <div className="section-toolbar">
          <div>
            <p className="eyebrow">Squad progress</p>
            <h2>Experience applied</h2>
          </div>
          <span>First-clear reward secured</span>
        </div>
        <div className="progress-list">
          {ninjas.slice(0, 4).map((ninja, index) => (
            <article key={ninja.id}>
              <NinjaAvatar ninja={ninja} size="sm" />
              <div>
                <span>
                  <strong>{ninja.name}</strong>
                  <small>Level {ninja.level}</small>
                </span>
                <div className="xp-bar">
                  <i style={{ width: `${58 + index * 8}%` }} />
                </div>
              </div>
              <b>+{reward.squadExperience} XP</b>
            </article>
          ))}
        </div>
      </section>
      <div className="result-actions">
        <Link className="secondary-button" to="/campaign">
          Campaign
        </Link>
        <Link className="secondary-button" to="/battle">
          Replay
        </Link>
        <Link className="primary-button" to="/upgrades">
          Upgrade ninja <Icon name="arrow" />
        </Link>
      </div>
    </div>
  );
}
