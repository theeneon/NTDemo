import { demoContent, rawDemoContent, validateGameContent } from "../../content";
import type { NinjaId } from "../../domain/models";
import { createDemoPlayerProfile } from "../../player/profile";
import { createSeededRng } from "../../shared/random/seededRng";
import { Icon } from "../../shared/ui/Icon";
import { PageHeader } from "../../shared/ui/PageHeader";
import { constructSquad } from "../../squad/constructSquad";

const profile = createDemoPlayerProfile(demoContent);
const alphaSquad = constructSquad(demoContent, profile, "squad.alpha", "Moon Vanguard", [
  "ninja.reed",
  "ninja.ember",
  "ninja.mist",
  "ninja.kite",
]);
const betaSquad = constructSquad(demoContent, profile, "squad.beta", "Dusk Runners", [
  "ninja.moss",
  "ninja.flint",
  "ninja.rain",
  "ninja.echo",
]);

const rng = createSeededRng("phase-2-content-codex");
const seededPreview = Array.from({ length: 5 }, () => rng.integer(1, 100));
const malformedResult = validateGameContent({
  ...rawDemoContent,
  ninjas: [...rawDemoContent.ninjas, rawDemoContent.ninjas[0]!],
});

function ninjaName(ninjaId: NinjaId) {
  return demoContent.ninjas.find((ninja) => ninja.id === ninjaId)?.name ?? ninjaId;
}

export function ContentLabPage() {
  const playableCount = demoContent.ninjas.filter((ninja) => ninja.playable).length;
  const enemyCount = demoContent.ninjas.length - playableCount;

  return (
    <div className="page-stack content-codex-page">
      <PageHeader
        eyebrow={`Content pipeline · schema ${demoContent.version}`}
        title="The Content Codex"
        description="Every definition below was parsed, cross-referenced, and frozen before this screen rendered. Mutable player ownership and squads are constructed separately."
        action={
          <span className="codex-valid-badge">
            <Icon name="check" /> Validation passed
          </span>
        }
      />

      <section className="codex-metrics" aria-label="Validated content totals">
        <article>
          <span>Definitions</span>
          <strong>
            {demoContent.ninjas.length +
              demoContent.skills.length +
              demoContent.statuses.length +
              demoContent.equipment.length +
              demoContent.encounters.length}
          </strong>
          <small>domain records</small>
        </article>
        <article>
          <span>Ninjas</span>
          <strong>
            {playableCount} + {enemyCount}
          </strong>
          <small>playable + enemy</small>
        </article>
        <article>
          <span>References</span>
          <strong>{demoContent.assets.length}</strong>
          <small>declared assets</small>
        </article>
        <article>
          <span>Content state</span>
          <strong>Frozen</strong>
          <small>{Object.isFrozen(demoContent) ? "runtime immutable" : "unexpected mutable"}</small>
        </article>
      </section>

      <div className="codex-layout">
        <section className="codex-panel">
          <div className="codex-panel-heading">
            <div>
              <p className="eyebrow">Shared contracts</p>
              <h2>Validated collections</h2>
            </div>
            <span>Cross-references resolved</span>
          </div>
          <div className="codex-collection-list">
            {[
              [
                "NinjaDefinition",
                demoContent.ninjas.length,
                "roles · ranks · base stats · skill references",
              ],
              [
                "SkillDefinition",
                demoContent.skills.length,
                "ordered effects · cooldowns · targets",
              ],
              ["StatusDefinition", demoContent.statuses.length, "timing · polarity · stacking"],
              [
                "EquipmentDefinition",
                demoContent.equipment.length,
                "slots · modifiers · upgrade costs",
              ],
              [
                "EncounterDefinition",
                demoContent.encounters.length,
                "four-unit teams · rewards · prerequisites",
              ],
              [
                "RewardTableDefinition",
                demoContent.rewardTables.length,
                "fixed grants · weighted drops",
              ],
            ].map(([name, count, detail]) => (
              <article key={name}>
                <span className="codex-rune">{String(name).slice(0, 1)}</span>
                <div>
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </div>
                <b>{count}</b>
              </article>
            ))}
          </div>
        </section>

        <section className="codex-panel">
          <div className="codex-panel-heading">
            <div>
              <p className="eyebrow">Mutable player state</p>
              <h2>Two legal squads</h2>
            </div>
            <span>8 unique owned ninjas</span>
          </div>
          <div className="codex-squads">
            {[alphaSquad, betaSquad].map((squad, squadIndex) => (
              <article key={squad.id}>
                <header>
                  <span>Squad {String.fromCharCode(65 + squadIndex)}</span>
                  <strong>{squad.name}</strong>
                </header>
                <ol>
                  {squad.slots.map((ninjaId, slot) => (
                    <li key={ninjaId}>
                      <span>{slot + 1}</span>
                      <div>
                        <strong>{ninjaName(ninjaId)}</strong>
                        <small>{slot < 2 ? "Front line" : "Back line"}</small>
                      </div>
                      <Icon name="check" />
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="codex-lower-grid">
        <section className="codex-panel codex-rng-panel">
          <div className="codex-panel-heading">
            <div>
              <p className="eyebrow">Reproducible simulation</p>
              <h2>Seeded random preview</h2>
            </div>
            <span>phase-2-content-codex</span>
          </div>
          <div className="seeded-rolls">
            {seededPreview.map((roll, index) => (
              <span key={`${roll}-${index}`}>
                <small>Roll {index + 1}</small>
                <strong>{roll}</strong>
              </span>
            ))}
          </div>
          <p>
            The same seed produces this exact sequence in tests, summon selection, loot tables, and
            future combat scenarios.
          </p>
        </section>
        <section className="codex-panel codex-rejection-panel">
          <div className="codex-panel-heading">
            <div>
              <p className="eyebrow">Development guardrail</p>
              <h2>Malformed fixture rejected</h2>
            </div>
            <span className="rejected-label">Expected failure</span>
          </div>
          {malformedResult.success ? (
            <p>Unexpectedly accepted malformed content.</p>
          ) : (
            <div className="validation-error">
              <Icon name="shield" />
              <div>
                <strong>{malformedResult.issues[0]?.message}</strong>
                <small>{malformedResult.issues[0]?.path}</small>
              </div>
            </div>
          )}
          <p>
            The lab intentionally duplicates a stable ninja ID. The readable error proves invalid
            content cannot silently enter the demo.
          </p>
        </section>
      </div>
    </div>
  );
}
