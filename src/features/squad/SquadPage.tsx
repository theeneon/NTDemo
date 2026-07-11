import { Link } from "react-router-dom";
import "./SquadPage.css";
import { ninjas } from "../../content/demoContent";
import { FirstRunGuide } from "../../shared/ui/FirstRunGuide";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";
import { PageHeader } from "../../shared/ui/PageHeader";
import { calculateNinjaPower, usePlayerStore } from "../../stores/playerStore";

const slotNames = ["Front left", "Front right", "Back left", "Back right"];

export function SquadPage() {
  const squadIds = usePlayerStore((state) => state.squadIds);
  const addToSquad = usePlayerStore((state) => state.addToSquad);
  const removeFromSquad = usePlayerStore((state) => state.removeFromSquad);
  const clearSquad = usePlayerStore((state) => state.clearSquad);
  const ninjaProgress = usePlayerStore((state) => state.ninjaProgress);
  const equipmentLevels = usePlayerStore((state) => state.equipmentLevels);
  const unlockedNinjaIds = usePlayerStore((state) => state.unlockedNinjaIds);
  const setFirstRunStep = usePlayerStore((state) => state.setFirstRunStep);
  const squad = squadIds.map((id) => ninjas.find((ninja) => ninja.id === id)).filter(Boolean);
  const available = ninjas.filter(
    (ninja) => unlockedNinjaIds.includes(ninja.id) && !squadIds.includes(ninja.id),
  );
  const power = squad.reduce(
    (sum, ninja) =>
      sum + (ninja ? calculateNinjaPower(ninja.id, ninjaProgress[ninja.id]!, equipmentLevels) : 0),
    0,
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Formation · four unit limit"
        title="Build a balanced squad."
        description="Choose four owned ninjas for the expedition. Formation, levels, and equipment persist across refreshes and replays."
        action={
          <Link
            className={`primary-button ${squad.length !== 4 ? "button-disabled" : ""}`}
            aria-disabled={squad.length !== 4}
            to={squad.length === 4 ? "/campaign" : "#"}
            onClick={() => {
              if (squad.length === 4) setFirstRunStep("battle");
            }}
          >
            Choose mission <Icon name="arrow" />
          </Link>
        }
      />

      <FirstRunGuide />

      <div className="squad-layout">
        <section className="formation-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Active formation</p>
              <h2>{squad.length} of 4 selected</h2>
            </div>
            <button className="text-button" type="button" onClick={clearSquad}>
              Clear all
            </button>
          </div>
          <div className="formation-grid">
            {slotNames.map((slot, index) => {
              const ninja = squad[index];
              return (
                <div
                  className={`formation-slot ${index < 2 ? "front-slot" : "back-slot"}`}
                  key={slot}
                >
                  <span className="slot-label">{slot}</span>
                  {ninja ? (
                    <>
                      <button
                        type="button"
                        className="remove-unit"
                        aria-label={`Remove ${ninja.name}`}
                        onClick={() => removeFromSquad(ninja.id)}
                      >
                        ×
                      </button>
                      <NinjaAvatar ninja={ninja} size="lg" />
                      <strong>{ninja.name}</strong>
                      <small>
                        {ninja.role} · Lv {ninjaProgress[ninja.id]?.level ?? 1} ·{" "}
                        {calculateNinjaPower(ninja.id, ninjaProgress[ninja.id]!, equipmentLevels)}{" "}
                        power
                      </small>
                    </>
                  ) : (
                    <>
                      <span className="empty-seal">＋</span>
                      <strong>Open slot</strong>
                      <small>Select from the roster</small>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="formation-summary">
            <div>
              <span>Formation power</span>
              <strong>{power}</strong>
            </div>
            <div>
              <span>Role coverage</span>
              <strong>{new Set(squad.map((ninja) => ninja?.role)).size} / 4</strong>
            </div>
            <div>
              <span>Status</span>
              <strong className={squad.length === 4 ? "text-jade" : "text-amber"}>
                {squad.length === 4 ? "Battle ready" : "Incomplete"}
              </strong>
            </div>
          </div>
        </section>

        <aside className="available-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Available</p>
              <h2>Roster</h2>
            </div>
            <span>{available.length} ninjas</span>
          </div>
          <div className="available-list">
            {available.map((ninja) => (
              <article key={ninja.id}>
                <NinjaAvatar ninja={ninja} size="sm" />
                <div>
                  <strong>{ninja.name}</strong>
                  <small>
                    {ninja.role} · Lv {ninjaProgress[ninja.id]?.level ?? 1} ·{" "}
                    {calculateNinjaPower(ninja.id, ninjaProgress[ninja.id]!, equipmentLevels)} power
                  </small>
                </div>
                <button
                  type="button"
                  disabled={squad.length >= 4}
                  aria-label={`Add ${ninja.name}`}
                  onClick={() => addToSquad(ninja.id)}
                >
                  ＋
                </button>
              </article>
            ))}
            {available.length === 0 ? (
              <div className="empty-note">
                <Icon name="check" />
                <p>
                  <strong>Full formation</strong>
                  <span>Remove a unit to choose another.</span>
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
