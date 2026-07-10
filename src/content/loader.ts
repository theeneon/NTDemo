import type {
  AssetDefinition,
  EncounterDefinition,
  GameContent,
  NinjaDefinition,
  RewardTableDefinition,
  SkillDefinition,
  StatusDefinition,
} from "../domain/models";
import { gameContentSchema } from "./schemas";

export type ContentIssue = Readonly<{
  path: string;
  message: string;
}>;

export class ContentValidationError extends Error {
  readonly issues: readonly ContentIssue[];

  constructor(issues: readonly ContentIssue[]) {
    super(`Content validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}`);
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

export type ContentValidationResult =
  | Readonly<{ success: true; content: GameContent; issues: readonly [] }>
  | Readonly<{ success: false; issues: readonly ContentIssue[] }>;

function issue(path: string, message: string): ContentIssue {
  return { path, message };
}

function checkUniqueIds(
  collectionName: string,
  values: readonly Readonly<{ id: string }>[],
  issues: ContentIssue[],
) {
  const seen = new Map<string, number>();
  values.forEach((value, index) => {
    const firstIndex = seen.get(value.id);
    if (firstIndex !== undefined) {
      issues.push(
        issue(
          `${collectionName}[${index}].id`,
          `Duplicate ID '${value.id}' (first declared at ${collectionName}[${firstIndex}])`,
        ),
      );
      return;
    }
    seen.set(value.id, index);
  });
}

function checkAssetReference(
  assets: ReadonlyMap<string, AssetDefinition>,
  assetId: string,
  path: string,
  expectedKind: AssetDefinition["kind"],
  issues: ContentIssue[],
) {
  const asset = assets.get(assetId);
  if (!asset) {
    issues.push(issue(path, `Missing asset '${assetId}'`));
  } else if (asset.kind !== expectedKind) {
    issues.push(issue(path, `Asset '${assetId}' is '${asset.kind}', expected '${expectedKind}'`));
  }
}

function checkStatusReferences(
  skill: SkillDefinition,
  skillIndex: number,
  statuses: ReadonlyMap<string, StatusDefinition>,
  issues: ContentIssue[],
) {
  skill.effects.forEach((effect, effectIndex) => {
    if (effect.kind === "applyStatus" && !statuses.has(effect.statusId)) {
      issues.push(
        issue(
          `skills[${skillIndex}].effects[${effectIndex}].statusId`,
          `Unknown status '${effect.statusId}'`,
        ),
      );
    }
  });
}

function checkNinjaReferences(
  ninja: NinjaDefinition,
  ninjaIndex: number,
  skills: ReadonlyMap<string, SkillDefinition>,
  assets: ReadonlyMap<string, AssetDefinition>,
  issues: ContentIssue[],
) {
  const seenSkills = new Set<string>();
  ninja.skillIds.forEach((skillId, skillIndex) => {
    if (seenSkills.has(skillId)) {
      issues.push(
        issue(
          `ninjas[${ninjaIndex}].skillIds[${skillIndex}]`,
          `Ninja '${ninja.id}' repeats skill '${skillId}'`,
        ),
      );
    }
    seenSkills.add(skillId);
    if (!skills.has(skillId)) {
      issues.push(
        issue(`ninjas[${ninjaIndex}].skillIds[${skillIndex}]`, `Unknown skill '${skillId}'`),
      );
    }
  });

  checkAssetReference(
    assets,
    ninja.portraitAssetId,
    `ninjas[${ninjaIndex}].portraitAssetId`,
    "portrait",
    issues,
  );
  checkAssetReference(
    assets,
    ninja.spriteAssetId,
    `ninjas[${ninjaIndex}].spriteAssetId`,
    "sprite",
    issues,
  );
}

function checkRewardReferences(
  rewardTable: RewardTableDefinition,
  rewardIndex: number,
  equipmentIds: ReadonlySet<string>,
  issues: ContentIssue[],
) {
  rewardTable.weightedDrops.forEach((drop, dropIndex) => {
    if (drop.kind === "equipment" && drop.contentId && !equipmentIds.has(drop.contentId)) {
      issues.push(
        issue(
          `rewardTables[${rewardIndex}].weightedDrops[${dropIndex}].contentId`,
          `Unknown equipment '${drop.contentId}'`,
        ),
      );
    }
  });
}

function checkEncounterReferences(
  encounter: EncounterDefinition,
  encounterIndex: number,
  ninjas: ReadonlyMap<string, NinjaDefinition>,
  rewardIds: ReadonlySet<string>,
  encounterIds: ReadonlySet<string>,
  assets: ReadonlyMap<string, AssetDefinition>,
  issues: ContentIssue[],
) {
  const slots = new Set<number>();
  encounter.enemyTeam.forEach((unit, unitIndex) => {
    const ninja = ninjas.get(unit.ninjaId);
    if (!ninja) {
      issues.push(
        issue(
          `encounters[${encounterIndex}].enemyTeam[${unitIndex}].ninjaId`,
          `Unknown ninja '${unit.ninjaId}'`,
        ),
      );
    } else if (ninja.playable) {
      issues.push(
        issue(
          `encounters[${encounterIndex}].enemyTeam[${unitIndex}].ninjaId`,
          `Encounter enemy '${unit.ninjaId}' must have playable=false`,
        ),
      );
    }
    if (slots.has(unit.slot)) {
      issues.push(
        issue(
          `encounters[${encounterIndex}].enemyTeam[${unitIndex}].slot`,
          `Formation slot ${unit.slot} is occupied more than once`,
        ),
      );
    }
    slots.add(unit.slot);
  });

  if (!rewardIds.has(encounter.rewardTableId)) {
    issues.push(
      issue(
        `encounters[${encounterIndex}].rewardTableId`,
        `Unknown reward table '${encounter.rewardTableId}'`,
      ),
    );
  }
  if (encounter.firstClearRewardTableId && !rewardIds.has(encounter.firstClearRewardTableId)) {
    issues.push(
      issue(
        `encounters[${encounterIndex}].firstClearRewardTableId`,
        `Unknown reward table '${encounter.firstClearRewardTableId}'`,
      ),
    );
  }
  encounter.prerequisiteEncounterIds.forEach((prerequisiteId, prerequisiteIndex) => {
    if (!encounterIds.has(prerequisiteId)) {
      issues.push(
        issue(
          `encounters[${encounterIndex}].prerequisiteEncounterIds[${prerequisiteIndex}]`,
          `Unknown encounter '${prerequisiteId}'`,
        ),
      );
    } else if (prerequisiteId === encounter.id) {
      issues.push(
        issue(
          `encounters[${encounterIndex}].prerequisiteEncounterIds[${prerequisiteIndex}]`,
          "An encounter cannot require itself",
        ),
      );
    }
  });
  checkAssetReference(
    assets,
    encounter.backgroundAssetId,
    `encounters[${encounterIndex}].backgroundAssetId`,
    "background",
    issues,
  );
}

function checkEncounterCycles(encounters: readonly EncounterDefinition[], issues: ContentIssue[]) {
  const byId = new Map(encounters.map((encounter, index) => [encounter.id, { encounter, index }]));
  const visiting = new Set<EncounterDefinition["id"]>();
  const visited = new Set<EncounterDefinition["id"]>();

  const visit = (encounterId: EncounterDefinition["id"], trail: EncounterDefinition["id"][]) => {
    if (visiting.has(encounterId)) {
      const entry = byId.get(encounterId);
      issues.push(
        issue(
          `encounters[${entry?.index ?? 0}].prerequisiteEncounterIds`,
          `Encounter prerequisite cycle detected: ${[...trail, encounterId].join(" -> ")}`,
        ),
      );
      return;
    }
    if (visited.has(encounterId)) return;

    const entry = byId.get(encounterId);
    if (!entry) return;
    visiting.add(encounterId);
    entry.encounter.prerequisiteEncounterIds.forEach((prerequisiteId) =>
      visit(prerequisiteId, [...trail, encounterId]),
    );
    visiting.delete(encounterId);
    visited.add(encounterId);
  };

  encounters.forEach((encounter) => visit(encounter.id, []));
}

function deepFreeze<T>(value: T, visited = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object" || visited.has(value)) return value;
  visited.add(value);
  Object.getOwnPropertyNames(value).forEach((property) => {
    deepFreeze((value as Record<string, unknown>)[property], visited);
  });
  return Object.freeze(value);
}

function crossValidate(content: GameContent): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const collections = [
    ["assets", content.assets],
    ["statuses", content.statuses],
    ["skills", content.skills],
    ["ninjas", content.ninjas],
    ["equipment", content.equipment],
    ["rewardTables", content.rewardTables],
    ["encounters", content.encounters],
  ] as const;
  collections.forEach(([name, values]) => checkUniqueIds(name, values, issues));

  const assets = new Map(content.assets.map((asset) => [asset.id, asset]));
  const statuses = new Map(content.statuses.map((status) => [status.id, status]));
  const skills = new Map(content.skills.map((skill) => [skill.id, skill]));
  const ninjas = new Map(content.ninjas.map((ninja) => [ninja.id, ninja]));
  const equipmentIds = new Set(content.equipment.map((item) => item.id));
  const rewardIds = new Set(content.rewardTables.map((reward) => reward.id));
  const encounterIds = new Set(content.encounters.map((encounter) => encounter.id));

  content.statuses.forEach((status, index) =>
    checkAssetReference(
      assets,
      status.iconAssetId,
      `statuses[${index}].iconAssetId`,
      "icon",
      issues,
    ),
  );
  content.skills.forEach((skill, index) => {
    checkAssetReference(assets, skill.iconAssetId, `skills[${index}].iconAssetId`, "icon", issues);
    checkStatusReferences(skill, index, statuses, issues);
  });
  content.ninjas.forEach((ninja, index) =>
    checkNinjaReferences(ninja, index, skills, assets, issues),
  );
  content.equipment.forEach((item, index) =>
    checkAssetReference(
      assets,
      item.iconAssetId,
      `equipment[${index}].iconAssetId`,
      "icon",
      issues,
    ),
  );
  content.rewardTables.forEach((reward, index) =>
    checkRewardReferences(reward, index, equipmentIds, issues),
  );
  content.encounters.forEach((encounter, index) =>
    checkEncounterReferences(encounter, index, ninjas, rewardIds, encounterIds, assets, issues),
  );
  checkEncounterCycles(content.encounters, issues);

  if (content.ninjas.filter((ninja) => ninja.playable).length < 8) {
    issues.push(issue("ninjas", "Demo content requires at least eight playable ninjas"));
  }

  return issues;
}

export function loadGameContent(input: unknown): GameContent {
  const parsed = gameContentSchema.safeParse(input);
  if (!parsed.success) {
    throw new ContentValidationError(
      parsed.error.issues.map((schemaIssue) =>
        issue(
          schemaIssue.path.length ? schemaIssue.path.join(".") : "content",
          schemaIssue.message,
        ),
      ),
    );
  }

  const content = parsed.data as GameContent;
  const issues = crossValidate(content);
  if (issues.length) throw new ContentValidationError(issues);
  return deepFreeze(content);
}

export function validateGameContent(input: unknown): ContentValidationResult {
  try {
    return { success: true, content: loadGameContent(input), issues: [] };
  } catch (error) {
    if (error instanceof ContentValidationError) {
      return { success: false, issues: error.issues };
    }
    throw error;
  }
}
