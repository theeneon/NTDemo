import { Link } from "react-router-dom";
import { Icon } from "../../shared/ui/Icon";

export function SummonPage() {
  return (
    <div className="summon-page">
      <header>
        <Link to="/roster">← Back to roster</Link>
        <span>Free summon demo</span>
      </header>
      <section className="summon-stage">
        <div className="summon-rings" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>召</span>
        </div>
        <div className="summon-copy">
          <p className="eyebrow">One free recruit available</p>
          <h1>Call a ninja from the mist.</h1>
          <p>
            This demonstration contains no payment flow or repeat purchase. The final seeded result
            and save transaction arrive with progression.
          </p>
          <div className="odds-row">
            <span>
              <small>Common</small>
              <strong>60%</strong>
            </span>
            <span>
              <small>Skilled</small>
              <strong>30%</strong>
            </span>
            <span>
              <small>Elite</small>
              <strong>10%</strong>
            </span>
          </div>
          <button className="primary-button summon-button" type="button">
            Use free summon <Icon name="spark" />
          </button>
          <small className="summon-note">Demo probabilities · no purchase available</small>
        </div>
      </section>
      <div className="summon-footer">
        <span>Phase 1 placeholder presentation</span>
        <span>Result logic connects to the seeded content pipeline in Phase 2</span>
      </div>
    </div>
  );
}
