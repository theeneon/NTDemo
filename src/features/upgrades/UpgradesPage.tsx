import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import "./UpgradesPage.css";
import { demoContent } from "../../content";
import { ninjas } from "../../content/demoContent";
import type { EquipmentDefinition } from "../../domain/models";
import { FirstRunGuide } from "../../shared/ui/FirstRunGuide";
import { Icon } from "../../shared/ui/Icon";
import { NinjaAvatar } from "../../shared/ui/NinjaAvatar";
import { PageHeader } from "../../shared/ui/PageHeader";
import {
  NINJA_LEVEL_EXPERIENCE,
  calculateNinjaPower,
  equipmentUpgradeCost,
  usePlayerStore,
} from "../../stores/playerStore";

const equipmentSlots: EquipmentDefinition["slot"][] = ["weapon", "armor", "charm", "relic"];

export function UpgradesPage() {
  const [message, setMessage] = useState("Choose an improvement for the next expedition.");
  const selectedId = usePlayerStore((state) => state.selectedNinjaId);
  const setSelected = usePlayerStore((state) => state.setSelectedNinja);
  const ninjaProgress = usePlayerStore((state) => state.ninjaProgress);
  const equipmentLevels = usePlayerStore((state) => state.equipmentLevels);
  const unlockedNinjaIds = usePlayerStore((state) => state.unlockedNinjaIds);
  const ownedEquipment = usePlayerStore((state) => state.ownedEquipment);
  const coins = usePlayerStore((state) => state.coins);
  const levelUpNinja = usePlayerStore((state) => state.levelUpNinja);
  const equipItem = usePlayerStore((state) => state.equipItem);
  const upgradeEquipment = usePlayerStore((state) => state.upgradeEquipment);
  const unlockedNinjas = ninjas.filter((item) => unlockedNinjaIds.includes(item.id));
  const ninja = unlockedNinjas.find((item) => item.id === selectedId) ?? unlockedNinjas[0];
  if (!ninja) {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Training grounds"
          title="Unlock a ninja to begin training."
          description="Claim your founding team from the roster before spending experience or equipping gear."
          action={
            <Link className="primary-button" to="/roster">
              Open roster <Icon name="arrow" />
            </Link>
          }
        />
      </div>
    );
  }
  const progress = ninjaProgress[ninja.id]!;
  const definition = demoContent.ninjas.find(({ id }) => id === `ninja.${ninja.id}`)!;
  const power = calculateNinjaPower(ninja.id, progress, equipmentLevels);
  const stats = effectiveStats(
    definition.baseStats,
    progress.level,
    progress.equipped,
    equipmentLevels,
  );
  const canLevel = progress.experience >= NINJA_LEVEL_EXPERIENCE;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Training grounds · persistent progression"
        title="Turn rewards into power."
        description="Spend squad experience on ninja levels or reinforce owned equipment. Every improvement changes saved power and the next battle runtime."
        action={
          <Link className="primary-button" to="/squad">
            Return to squad <Icon name="arrow" />
          </Link>
        }
      />
      <FirstRunGuide />
      <div className="upgrade-layout">
        <aside className="ninja-selector">
          <p className="eyebrow">Select ninja</p>
          {unlockedNinjas.map((item) => {
            const itemProgress = ninjaProgress[item.id]!;
            return (
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
                    {item.role} · Lv {itemProgress.level}
                  </small>
                </span>
                <b>{calculateNinjaPower(item.id, itemProgress, equipmentLevels)}</b>
              </button>
            );
          })}
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
            <p>{ninja.trait}. Improvements are included in future deterministic battle inputs.</p>
            <div className="level-progress">
              <span>
                <strong>Level {progress.level}</strong>
                <small>
                  {progress.experience} / {NINJA_LEVEL_EXPERIENCE} XP
                </small>
              </span>
              <div>
                <i style={{ width: `${Math.min(100, progress.experience)}%` }} />
              </div>
            </div>
            <button
              className="primary-button full-button"
              type="button"
              disabled={!canLevel}
              onClick={() => {
                if (levelUpNinja(ninja.id))
                  setMessage(`${ninja.name} reached level ${progress.level + 1}.`);
              }}
            >
              {canLevel
                ? `Level up · ${NINJA_LEVEL_EXPERIENCE} XP`
                : `${NINJA_LEVEL_EXPERIENCE - progress.experience} XP needed`}
              <Icon name="spark" />
            </button>
          </div>
        </section>

        <section className="stats-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Saved combat power</p>
              <h2>
                {power} <span>· Level {progress.level}</span>
              </h2>
            </div>
            <span className="delta-pill">{coins.toLocaleString()} coins</span>
          </div>
          <p className="upgrade-message" aria-live="polite">
            {message}
          </p>
          <div className="stat-bars">
            {stats.map((stat) => (
              <div key={stat.label}>
                <span>
                  <strong>{stat.label}</strong>
                  <small>{stat.value}</small>
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
              <h3>Persistent loadout</h3>
            </div>
            <span>{Object.keys(progress.equipped).length} / 4 equipped</span>
          </div>
          <div className="equipment-grid">
            {equipmentSlots.map((slot) => {
              const equipmentId = progress.equipped[slot];
              const equipped = demoContent.equipment.find(({ id }) => id === equipmentId);
              const available = demoContent.equipment.find(
                (item) => item.slot === slot && (ownedEquipment[item.id] ?? 0) > 0,
              );
              const item = equipped ?? available;
              if (!item) {
                return (
                  <article className="empty-equipment" key={slot}>
                    <span>+</span>
                    <div>
                      <strong>{capitalize(slot)}</strong>
                      <small>No owned item</small>
                    </div>
                    <button type="button" disabled>
                      Empty
                    </button>
                  </article>
                );
              }
              const itemLevel = equipmentLevels[item.id] ?? 1;
              const cost = equipmentUpgradeCost(item.id, itemLevel);
              return (
                <article key={slot}>
                  <span>E</span>
                  <div>
                    <strong>
                      {item.name} · +{itemLevel}
                    </strong>
                    <small>
                      {capitalize(slot)} · {modifierText(item)}
                    </small>
                  </div>
                  {equipped ? (
                    <button
                      type="button"
                      disabled={coins < cost}
                      onClick={() => {
                        if (upgradeEquipment(item.id))
                          setMessage(`${item.name} reinforced to +${itemLevel + 1}.`);
                      }}
                    >
                      Upgrade · {cost}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (equipItem(ninja.id, item.id))
                          setMessage(`${item.name} equipped by ${ninja.name}.`);
                      }}
                    >
                      Equip
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function effectiveStats(
  base: (typeof demoContent.ninjas)[number]["baseStats"],
  level: number,
  equipped: Record<string, string | undefined>,
  equipmentLevels: Record<string, number | undefined>,
) {
  const scale = 1 + (level - 1) * 0.05;
  const values = {
    maxHealth: Math.round(base.maxHealth * scale),
    attack: Math.round(base.attack * scale),
    defense: Math.round(base.defense * scale),
    speed: Math.round(base.speed * scale),
  };
  for (const equipmentId of Object.values(equipped)) {
    if (!equipmentId) continue;
    const item = demoContent.equipment.find(({ id }) => id === equipmentId);
    if (!item) continue;
    const itemLevel = equipmentLevels[equipmentId] ?? 1;
    for (const stat of ["maxHealth", "attack", "defense", "speed"] as const) {
      values[stat] += (item.statModifiers[stat] ?? 0) * itemLevel;
    }
  }
  return [
    { label: "Health", value: values.maxHealth, width: Math.min(100, values.maxHealth / 14) },
    { label: "Attack", value: values.attack, width: Math.min(100, values.attack / 2.2) },
    { label: "Defense", value: values.defense, width: Math.min(100, values.defense / 1.8) },
    { label: "Speed", value: values.speed, width: Math.min(100, values.speed / 1.5) },
  ];
}

function modifierText(item: EquipmentDefinition) {
  return Object.entries(item.statModifiers)
    .map(([stat, value]) => `${capitalize(stat)} +${value}`)
    .join(" · ");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
