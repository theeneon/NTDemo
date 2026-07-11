import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import "./RosterPage.css";
import { ninjas, type Ninja, type NinjaRole } from "../../content/demoContent";
import { FirstRunGuide } from "../../shared/ui/FirstRunGuide";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";
import { PageHeader } from "../../shared/ui/PageHeader";
import {
  calculateNinjaPower,
  getNinjaUnlockCost,
  getNinjaUnlockRequirement,
  usePlayerStore,
} from "../../stores/playerStore";

type Filter = "All" | NinjaRole;
const filters: Filter[] = ["All", "Striker", "Guard", "Support", "Control"];

export function RosterPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const squadIds = usePlayerStore((state) => state.squadIds);
  const setSelectedNinja = usePlayerStore((state) => state.setSelectedNinja);
  const ninjaProgress = usePlayerStore((state) => state.ninjaProgress);
  const equipmentLevels = usePlayerStore((state) => state.equipmentLevels);
  const unlockedNinjaIds = usePlayerStore((state) => state.unlockedNinjaIds);
  const coins = usePlayerStore((state) => state.coins);
  const purchaseNinja = usePlayerStore((state) => state.purchaseNinja);
  const activeSquad = squadIds
    .map((id) => ninjas.find((ninja) => ninja.id === id))
    .filter((ninja): ninja is Ninja => Boolean(ninja));
  const activePower = activeSquad.reduce(
    (total, ninja) =>
      total + calculateNinjaPower(ninja.id, ninjaProgress[ninja.id]!, equipmentLevels),
    0,
  );
  const roleCoverage = new Set(activeSquad.map((ninja) => ninja.role)).size;
  const visibleNinjas = useMemo(
    () => (filter === "All" ? ninjas : ninjas.filter((ninja) => ninja.role === filter)),
    [filter],
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`Village roster · ${unlockedNinjaIds.length} of ${ninjas.length} unlocked`}
        title="Unlock your next formation."
        description="Spend gold to recruit any locked ninja, or earn the later characters by clearing their campaign missions. Levels, equipment, and formation choices persist between expeditions."
        action={
          <Link className="primary-button" to="/squad">
            Build squad <Icon name="arrow" />
          </Link>
        }
      />

      <FirstRunGuide />

      <section className="overview-strip" aria-label="Roster overview">
        <div>
          <span>Active squad</span>
          <strong>{squadIds.length} / 4</strong>
          <small>ready for deployment</small>
        </div>
        <div>
          <span>Combined power</span>
          <strong>{activePower}</strong>
          <small>recommended: 430</small>
        </div>
        <div>
          <span>Role coverage</span>
          <strong>{roleCoverage} / 4</strong>
          <small>balanced formation</small>
        </div>
        <Link to="/campaign">
          <Icon name="summon" />
          <span>
            <strong>Character unlocks</strong>
            <small>
              {unlockedNinjaIds.length === ninjas.length
                ? "All ninjas claimed"
                : "Clear missions to unlock more"}
            </small>
          </span>
          <Icon name="arrow" />
        </Link>
      </section>

      <section>
        <div className="section-toolbar">
          <div>
            <p className="eyebrow">Your ninjas</p>
            <h2>Roster</h2>
          </div>
          <div className="filter-group" aria-label="Filter roster by role">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="ninja-grid">
          {visibleNinjas.map((ninja) => {
            const selected = squadIds.includes(ninja.id);
            const unlocked = unlockedNinjaIds.includes(ninja.id);
            const requirement = getNinjaUnlockRequirement(ninja.id);
            const cost = getNinjaUnlockCost(ninja.id);
            return (
              <article
                className={`ninja-card ${unlocked ? "" : "ninja-card-locked"}`}
                key={ninja.id}
                style={{ "--card-accent": ninja.accent } as CSSProperties}
              >
                <div className="card-topline">
                  <span className={`role-badge role-${ninja.role.toLowerCase()}`}>
                    {ninja.role}
                  </span>
                  {selected ? (
                    <span className="squad-badge">
                      <Icon name="check" /> Squad
                    </span>
                  ) : unlocked ? (
                    <span className="squad-badge">Unlocked</span>
                  ) : (
                    <span className="squad-badge squad-badge-locked">
                      <Icon name="lock" /> Locked
                    </span>
                  )}
                </div>
                <NinjaAvatar ninja={ninja} size="lg" />
                <div className="ninja-card-copy">
                  <div>
                    <p>{ninja.title}</p>
                    <h3>{ninja.name}</h3>
                  </div>
                  <span className="rank-mark">III</span>
                </div>
                <p className="trait-copy">{ninja.trait}</p>
                <div className="ninja-stats">
                  <span>
                    <small>Level</small>
                    <strong>{ninjaProgress[ninja.id]?.level ?? 1}</strong>
                  </span>
                  <span>
                    <small>Power</small>
                    <strong>
                      {calculateNinjaPower(ninja.id, ninjaProgress[ninja.id]!, equipmentLevels)}
                    </strong>
                  </span>
                </div>
                {unlocked ? (
                  <Link
                    className="card-action"
                    to="/upgrades"
                    onClick={() => setSelectedNinja(ninja.id)}
                  >
                    View details <Icon name="arrow" />
                  </Link>
                ) : (
                  <button
                    className="card-action card-action-button"
                    type="button"
                    disabled={coins < cost}
                    onClick={() => purchaseNinja(ninja.id)}
                  >
                    {coins < cost
                      ? `Need ${cost} gold for ${ninja.name}`
                      : `Recruit ${ninja.name} · ${cost} gold`}{" "}
                    <Icon name="coin" />
                  </button>
                )}
                {!unlocked && requirement ? (
                  <small className="unlock-alternative">
                    or clear the required campaign mission
                  </small>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
