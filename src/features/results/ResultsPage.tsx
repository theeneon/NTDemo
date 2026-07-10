import { Link } from "react-router-dom";
import { ninjas } from "../../content/demoContent";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";

export function ResultsPage() {
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
            <strong>+100</strong>
            <p>1,340 total</p>
          </div>
        </article>
        <article>
          <span>
            <Icon name="spark" />
          </span>
          <div>
            <small>Squad experience</small>
            <strong>+40</strong>
            <p>Applied to all four ninjas</p>
          </div>
        </article>
        <article className="equipment-reward">
          <span>装</span>
          <div>
            <small>Equipment drop</small>
            <strong>Scout wraps</strong>
            <p>Defense +4 · New</p>
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
              <b>+40 XP</b>
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
