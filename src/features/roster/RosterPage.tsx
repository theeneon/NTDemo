import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import "./RosterPage.css";
import { ninjas, type Ninja, type NinjaRole } from "../../content/demoContent";
import { FirstRunGuide } from "../../shared/ui/FirstRunGuide";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";
import { PageHeader } from "../../shared/ui/PageHeader";
import { calculateNinjaPower, usePlayerStore } from "../../stores/playerStore";

type Filter = "All" | NinjaRole;
const filters: Filter[] = ["All", "Striker", "Guard", "Support", "Control"];

export function RosterPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const squadIds = usePlayerStore((state) => state.squadIds);
  const setSelectedNinja = usePlayerStore((state) => state.setSelectedNinja);
  const ninjaProgress = usePlayerStore((state) => state.ninjaProgress);
  const equipmentLevels = usePlayerStore((state) => state.equipmentLevels);
  const summonAvailable = usePlayerStore((state) => state.summonAvailable);
  const summonedNinjaId = usePlayerStore((state) => state.summonedNinjaId);
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
        eyebrow="Village roster · 8 available"
        title="Choose your next formation."
        description="Every ninja brings a distinct tactical role. Levels, experience, equipment, and formation choices now persist between expeditions."
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
        <Link to="/summon">
          <Icon name="summon" />
          <span>
            <strong>Free summon</strong>
            <small>
              {summonAvailable
                ? "One demo recruit available"
                : `${ninjas.find(({ id }) => id === summonedNinjaId)?.name ?? "Recruit"} summoned · saved`}
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
            return (
              <article
                className="ninja-card"
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
                  ) : null}
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
                <Link
                  className="card-action"
                  to="/upgrades"
                  onClick={() => setSelectedNinja(ninja.id)}
                >
                  View details <Icon name="arrow" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
