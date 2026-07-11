import { useState } from "react";
import { Link } from "react-router-dom";
import "./CampaignPage.css";
import { demoContent } from "../../content";
import { encounters as encounterPresentation } from "../../content/demoContent";
import type { EncounterId } from "../../domain/models";
import { FirstRunGuide } from "../../shared/ui/FirstRunGuide";
import { Icon } from "../../shared/ui/Icon";
import { PageHeader } from "../../shared/ui/PageHeader";
import { calculateNinjaPower, isEncounterUnlocked, usePlayerStore } from "../../stores/playerStore";

const campaignEncounters = demoContent.encounters.filter(({ mode }) => mode === "campaign");
const dungeon = demoContent.encounters.find(({ id }) => id === "encounter.underground-shrine")!;

export function CampaignPage() {
  const squadIds = usePlayerStore((state) => state.squadIds);
  const ninjaProgress = usePlayerStore((state) => state.ninjaProgress);
  const equipmentLevels = usePlayerStore((state) => state.equipmentLevels);
  const completedEncounterIds = usePlayerStore((state) => state.completedEncounterIds);
  const unlockedNinjaIds = usePlayerStore((state) => state.unlockedNinjaIds);
  const startBattle = usePlayerStore((state) => state.startBattle);
  const firstAvailable =
    campaignEncounters.find(
      ({ id }) =>
        !completedEncounterIds.includes(id) && isEncounterUnlocked(id, completedEncounterIds),
    ) ?? dungeon;
  const [selectedEncounterId, setSelectedEncounterId] = useState<EncounterId>(firstAvailable.id);
  const selectedEncounter =
    demoContent.encounters.find(({ id }) => id === selectedEncounterId) ?? firstAvailable;
  const selectedUnlocked = isEncounterUnlocked(selectedEncounter.id, completedEncounterIds);
  const selectedComplete = completedEncounterIds.includes(selectedEncounter.id);
  const reward = demoContent.rewardTables.find(({ id }) => id === selectedEncounter.rewardTableId)!;
  const squadPower = squadIds.reduce(
    (total, id) =>
      total + (ninjaProgress[id] ? calculateNinjaPower(id, ninjaProgress[id], equipmentLevels) : 0),
    0,
  );
  const canDeploy = squadIds.length === 4 && selectedUnlocked;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Expedition board · campaign and dungeon"
        title="Choose the next expedition."
        description="Clear campaign missions in order or replay the Underground Shrine. Victories, unlocks, rewards, and squad power are saved locally."
        action={
          <Link className="secondary-button" to="/squad">
            Edit squad · {squadPower} power
          </Link>
        }
      />

      <FirstRunGuide />

      <div className="campaign-layout">
        <section className="campaign-map" aria-label="Campaign encounter map">
          <div className="map-watermark" aria-hidden="true">
            東
          </div>
          <div className="map-path" aria-hidden="true" />
          {campaignEncounters.map((encounter, index) => {
            const complete = completedEncounterIds.includes(encounter.id);
            const unlocked = isEncounterUnlocked(encounter.id, completedEncounterIds);
            const state = complete ? "complete" : unlocked ? "available" : "locked";
            const presentation = encounterPresentation.find(
              ({ id }) => `encounter.${id}` === encounter.id,
            );
            return (
              <button
                type="button"
                className={`encounter-node node-${index + 1} node-${state} ${
                  selectedEncounter.id === encounter.id ? "node-selected" : ""
                }`}
                key={encounter.id}
                disabled={!unlocked}
                aria-label={`${encounter.name} · ${complete ? "complete" : unlocked ? "available" : "locked"}`}
                aria-pressed={selectedEncounter.id === encounter.id}
                onClick={() => setSelectedEncounterId(encounter.id)}
              >
                <span className="node-marker">
                  {!unlocked ? <Icon name="lock" /> : complete ? <Icon name="check" /> : index + 1}
                </span>
                <span>
                  <small>{presentation?.location ?? `Campaign mission ${index + 1}`}</small>
                  <strong>{encounter.name}</strong>
                  <span>{encounter.recommendedPower} recommended power</span>
                </span>
              </button>
            );
          })}
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
          <p className="eyebrow">
            {selectedEncounter.mode === "dungeon" ? "Repeatable dungeon" : "Campaign mission"} ·{" "}
            {selectedComplete ? "cleared" : selectedUnlocked ? "available" : "locked"}
          </p>
          <h2>{selectedEncounter.name}</h2>
          <p>
            {selectedEncounter.mode === "dungeon"
              ? "Clear the shrine for repeatable experience, coins, and a seeded equipment cache."
              : selectedUnlocked
                ? "Win this mission to save the clear and unlock the next location on the campaign path."
                : "Complete the previous campaign mission to open this route."}
          </p>
          <div className="enemy-preview">
            {selectedEncounter.enemyTeam.map((unit) => {
              const enemy = demoContent.ninjas.find(({ id }) => id === unit.ninjaId)!;
              return (
                <span key={`${unit.ninjaId}-${unit.slot}`}>
                  <i>{enemy.name.slice(0, 1)}</i>
                  <small>Lv {unit.level}</small>
                </span>
              );
            })}
          </div>
          <dl className="mission-facts">
            <div>
              <dt>Recommended</dt>
              <dd>{selectedEncounter.recommendedPower} power</dd>
            </div>
            <div>
              <dt>Battle reward</dt>
              <dd>
                {reward.fixedCoins} coins + {reward.squadExperience} XP
              </dd>
            </div>
            <div>
              <dt>Squad power</dt>
              <dd className="text-jade">
                {squadPower} ·{" "}
                {squadPower >= selectedEncounter.recommendedPower ? "Ready" : "Below target"}
              </dd>
            </div>
          </dl>
          <Link
            className={`primary-button full-button ${!canDeploy ? "button-disabled" : ""}`}
            aria-disabled={!canDeploy}
            to={canDeploy ? "/battle" : squadIds.length === 4 ? "#" : "/squad"}
            onClick={(event) => {
              if (!canDeploy || !startBattle(selectedEncounter.id)) event.preventDefault();
            }}
          >
            {squadIds.length !== 4
              ? "Complete squad"
              : !selectedUnlocked
                ? "Mission locked"
                : selectedComplete
                  ? "Replay mission"
                  : "Start mission"}{" "}
            <Icon name="arrow" />
          </Link>
          <button
            className={`dungeon-card ${selectedEncounter.id === dungeon.id ? "selected" : ""}`}
            type="button"
            onClick={() => setSelectedEncounterId(dungeon.id)}
          >
            <Icon name="shield" />
            <span>
              <span>Repeatable dungeon</span>
              <strong>Underground Shrine</strong>
              <small>Always unlocked · rewards apply every victory</small>
            </span>
            <Icon name={completedEncounterIds.includes(dungeon.id) ? "check" : "arrow"} />
          </button>
          <Link className="campaign-summon-link" to="/roster">
            <Icon name="summon" />
            <span>
              <strong>{unlockedNinjaIds.length} / 8 ninjas unlocked</strong>
              <small>Claim starters, then clear campaign missions for more</small>
            </span>
            <Icon name="arrow" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
