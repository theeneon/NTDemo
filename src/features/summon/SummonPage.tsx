import { useState } from "react";
import { Link } from "react-router-dom";
import { ninjas } from "../../content/demoContent";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";
import { PLAYER_SAVE_VERSION, usePlayerStore } from "../../stores/playerStore";

export function SummonPage() {
  const summonAvailable = usePlayerStore((state) => state.summonAvailable);
  const savedResult = usePlayerStore((state) => state.summonedNinjaId);
  const performFreeSummon = usePlayerStore((state) => state.performFreeSummon);
  const [revealedId, setRevealedId] = useState(savedResult);
  const result = ninjas.find(({ id }) => id === revealedId);

  return (
    <div className="summon-page">
      <header>
        <Link to="/roster">← Back to roster</Link>
        <span>{summonAvailable ? "Free summon ready" : "Summon complete · saved"}</span>
      </header>
      <section className={`summon-stage ${result ? "summon-stage-revealed" : ""}`}>
        <div className="summon-rings" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>召</span>
        </div>
        <div className="summon-copy" aria-live="polite">
          {result ? (
            <>
              <p className="eyebrow">Seeded summon result · saved locally</p>
              <div className="summon-result-avatar">
                <NinjaAvatar ninja={result} size="lg" />
              </div>
              <h1>{result.name} answered the call.</h1>
              <p>
                {result.title} · {result.role}. This one-time result will remain after refresh. The
                demo roster already exposes every Phase 5 test ninja, so the summon is presented as
                a recruit showcase rather than a paid unlock.
              </p>
              <Link className="primary-button summon-button" to="/squad">
                Add to squad <Icon name="arrow" />
              </Link>
            </>
          ) : (
            <>
              <p className="eyebrow">One free recruit available</p>
              <h1>Call a ninja from the mist.</h1>
              <p>
                Use the one-time seeded summon. The result is written to the versioned local save,
                with no payment or repeat-purchase flow.
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
              <button
                className="primary-button summon-button"
                type="button"
                onClick={() => setRevealedId(performFreeSummon())}
              >
                Use free summon <Icon name="spark" />
              </button>
              <small className="summon-note">Demo probabilities · no purchase available</small>
            </>
          )}
        </div>
      </section>
      <div className="summon-footer">
        <span>One deterministic free summon per reset save</span>
        <span>Result persists through LocalStorage version {PLAYER_SAVE_VERSION}</span>
      </div>
    </div>
  );
}
