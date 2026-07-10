import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ninjas } from "../../content/demoContent";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";
import { PageHeader } from "../../shared/ui/PageHeader";
import { usePlayerStore } from "../../stores/playerStore";

const stats = [
  { label: "Health", value: 812, delta: 32, width: 78 },
  { label: "Attack", value: 164, delta: 9, width: 66 },
  { label: "Defense", value: 92, delta: 4, width: 47 },
  { label: "Speed", value: 108, delta: 1, width: 58 },
];

export function UpgradesPage() {
  const selectedId = usePlayerStore((state) => state.selectedNinjaId);
  const setSelected = usePlayerStore((state) => state.setSelectedNinja);
  const ninja = ninjas.find((item) => item.id === selectedId) ?? ninjas[0]!;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Training grounds · progression preview"
        title="Turn rewards into power."
        description="The upgrade screen establishes information hierarchy and cost previews. Reward transactions and persistent progression arrive in Phase 5."
        action={
          <Link className="primary-button" to="/squad">
            Return to squad <Icon name="arrow" />
          </Link>
        }
      />
      <div className="upgrade-layout">
        <aside className="ninja-selector">
          <p className="eyebrow">Select ninja</p>
          {ninjas.map((item) => (
            <button
              className={item.id === ninja.id ? "active" : ""}
              type="button"
              key={item.id}
              onClick={() => setSelected(item.id)}
            >
              <NinjaAvatar ninja={item} size="sm" />
              <span>
                <strong>{item.name}</strong>
                <small>
                  {item.role} · Lv {item.level}
                </small>
              </span>
              <b>{item.power}</b>
            </button>
          ))}
        </aside>
        <section className="upgrade-profile">
          <div
            className="profile-art"
            style={{ "--profile-accent": ninja.accent } as CSSProperties}
          >
            <NinjaAvatar ninja={ninja} size="lg" />
            <span>{ninja.glyph}</span>
          </div>
          <div className="profile-copy">
            <span className={`role-badge role-${ninja.role.toLowerCase()}`}>{ninja.role}</span>
            <p>{ninja.title}</p>
            <h2>{ninja.name}</h2>
            <p>{ninja.trait}. Built to demonstrate clear before-and-after progression.</p>
            <div className="level-progress">
              <span>
                <strong>Level {ninja.level}</strong>
                <small>80 / 100 XP</small>
              </span>
              <div>
                <i />
              </div>
            </div>
            <button className="primary-button full-button" type="button">
              Level up · 100 <Icon name="coin" />
            </button>
          </div>
        </section>
        <section className="stats-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Power preview</p>
              <h2>
                {ninja.power} <span>→ {ninja.power + 15}</span>
              </h2>
            </div>
            <span className="delta-pill">+15 power</span>
          </div>
          <div className="stat-bars">
            {stats.map((stat) => (
              <div key={stat.label}>
                <span>
                  <strong>{stat.label}</strong>
                  <small>
                    {stat.value} <b>+{stat.delta}</b>
                  </small>
                </span>
                <div>
                  <i style={{ width: `${stat.width}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="equipment-heading">
            <div>
              <p className="eyebrow">Equipment</p>
              <h3>Loadout</h3>
            </div>
            <span>1 / 4 equipped</span>
          </div>
          <div className="equipment-grid">
            <article>
              <span>装</span>
              <div>
                <strong>Scout wraps</strong>
                <small>Armor · Defense +4</small>
              </div>
              <button type="button">Equipped</button>
            </article>
            {["Weapon", "Charm", "Relic"].map((slot) => (
              <article className="empty-equipment" key={slot}>
                <span>＋</span>
                <div>
                  <strong>{slot}</strong>
                  <small>Empty slot</small>
                </div>
                <button type="button">Choose</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
