import type {
  BattleEvent,
  BattleUnitId,
  EffectDefinition,
  GameContent,
  PassiveTriggerEvent,
  SkillId,
  SkillDefinition,
  StatusId,
  StatusDefinition,
  TargetSelector,
} from "../domain/models";
import { createSeededRng, type SeededRng } from "../shared/random/seededRng";
import { createRuntimeUnits, snapshotRuntimeUnit, type RuntimeUnit } from "./runtime";
import type { BattleInput, BattleResult, BattleRewards, BattleSide } from "./types";

const DEFAULT_MAXIMUM_TURNS = 100;
const DEFAULT_MAXIMUM_PASSIVE_TRIGGERS = 50;

type IndexedContent = Readonly<{
  content: GameContent;
  skills: Map<string, SkillDefinition>;
  statuses: Map<string, StatusDefinition>;
}>;

type MutableSummary = {
  damageBySide: Record<BattleSide, number>;
  healingBySide: Record<BattleSide, number>;
  defeatedUnitIds: BattleUnitId[];
};

type EmittableBattleEvent = BattleEvent extends infer Event
  ? Event extends BattleEvent
    ? Omit<Event, "battleId" | "sequence">
    : never
  : never;

class BattleSimulation {
  private readonly input: BattleInput;
  private readonly battleId: string;
  private readonly rng: SeededRng;
  private readonly indexed: IndexedContent;
  private readonly maximumTurns: number;
  private readonly maximumPassiveTriggers: number;
  private readonly units: RuntimeUnit[];
  private readonly events: BattleEvent[] = [];
  private readonly summary: MutableSummary = {
    damageBySide: { player: 0, enemy: 0 },
    healingBySide: { player: 0, enemy: 0 },
    defeatedUnitIds: [],
  };
  private turns = 0;
  private timeline = 0;
  private passiveTriggers = 0;
  private triggerLimitReached = false;
  private outcome: BattleResult["outcome"] | undefined;
  private reason: BattleResult["reason"] | undefined;
  private rewards: BattleRewards | undefined;

  constructor(input: BattleInput) {
    this.input = input;
    this.rng = createSeededRng(input.seed);
    this.battleId = `battle:${input.encounterId}:${this.rng.seed}`;
    this.maximumTurns = positiveInteger(input.maximumTurns, DEFAULT_MAXIMUM_TURNS);
    this.maximumPassiveTriggers = positiveInteger(
      input.maximumPassiveTriggers,
      DEFAULT_MAXIMUM_PASSIVE_TRIGGERS,
    );
    this.indexed = {
      content: input.content,
      skills: new Map(input.content.skills.map((skill) => [skill.id, skill])),
      statuses: new Map(input.content.statuses.map((status) => [status.id, status])),
    };

    const encounter = input.content.encounters.find(({ id }) => id === input.encounterId);
    if (!encounter) throw new Error(`Unknown encounter '${input.encounterId}'`);
    this.units = [
      ...createRuntimeUnits(input.content, input.playerTeam, "player"),
      ...createRuntimeUnits(input.content, encounter.enemyTeam, "enemy"),
    ];
  }

  run(): BattleResult {
    const playerUnitIds = this.units.filter(({ side }) => side === "player").map(({ id }) => id);
    const enemyUnitIds = this.units.filter(({ side }) => side === "enemy").map(({ id }) => id);
    const started = this.emit({
      type: "battleStarted",
      seed: this.rng.seed,
      playerUnitIds,
      enemyUnitIds,
    });

    if (!playerUnitIds.length || !enemyUnitIds.length) {
      this.emit({ type: "invalidState", message: "A battle requires units on both sides." });
      this.finish("draw", "invalidState");
      return this.result();
    }

    this.triggerPassives("battleStarted", undefined, started.sequence);
    this.evaluateElimination();

    while (!this.outcome && this.turns < this.maximumTurns) {
      const active = this.nextUnit();
      if (!active || !Number.isFinite(active.nextActionAt)) {
        this.emit({ type: "invalidState", message: "No finite legal turn remained." });
        this.finish("draw", "invalidState");
        break;
      }
      this.takeTurn(active);
    }

    if (!this.outcome) {
      this.emit({ type: "turnLimitReached", maximumTurns: this.maximumTurns });
      this.finish("defeat", "turnLimit");
    }

    return this.result();
  }

  private takeTurn(unit: RuntimeUnit) {
    this.turns += 1;
    this.timeline = unit.nextActionAt;
    const started = this.emit({
      type: "turnStarted",
      unitId: unit.id,
      turn: this.turns,
      timeline: roundTimeline(this.timeline),
    });

    this.tickStatuses(unit, "turnStart");
    this.evaluateElimination();
    if (this.outcome || unit.defeated) return;

    this.triggerPassives("turnStarted", unit, started.sequence);
    this.evaluateElimination();
    if (this.outcome || unit.defeated) return;

    const stunned = unit.statuses.some(
      (runtimeStatus) => this.status(runtimeStatus.statusId).category === "stun",
    );
    let usedSkillId: string | undefined;

    if (stunned) {
      this.emit({ type: "turnSkipped", unitId: unit.id, reason: "stun" });
    } else {
      const skill = this.selectSkill(unit);
      if (!skill) {
        this.emit({ type: "invalidState", message: `${unit.name} has no usable action.` });
        this.finish("draw", "invalidState");
        return;
      }
      usedSkillId = skill.id;
      this.resolveSkill(unit, skill);
    }

    this.tickStatuses(unit, "turnEnd");
    this.decrementCooldowns(unit, usedSkillId);
    this.decrementStatuses(unit);
    this.evaluateElimination();
    if (this.outcome) return;

    unit.nextActionAt = this.timeline + 1_000 / this.effectiveStat(unit, "speed");
    this.emit({
      type: "turnEnded",
      unitId: unit.id,
      turn: this.turns,
      timeline: roundTimeline(unit.nextActionAt),
    });
  }

  private selectSkill(unit: RuntimeUnit) {
    const skills = unit.skillIds.map((id) => this.skill(id));
    const active = skills
      .filter(
        (skill) =>
          skill.kind === "active" &&
          (unit.cooldowns[skill.id] ?? 0) <= 0 &&
          this.isSkillUsable(unit, skill),
      )
      .sort((left, right) => left.aiPriority - right.aiPriority || left.id.localeCompare(right.id));
    return (
      active[0] ?? skills.find((skill) => skill.kind === "basic" && this.isSkillUsable(unit, skill))
    );
  }

  private isSkillUsable(source: RuntimeUnit, skill: SkillDefinition) {
    return skill.effects.some((effect) => {
      const targets = this.candidateTargets(source, effect.target);
      if (effect.kind === "heal")
        return targets.some((target) => target.health < target.baseStats.maxHealth);
      return targets.length > 0;
    });
  }

  private resolveSkill(source: RuntimeUnit, skill: SkillDefinition, passive = false) {
    const targetCache = new Map<TargetSelector, RuntimeUnit[]>();
    for (const effect of skill.effects) {
      if (!targetCache.has(effect.target)) {
        targetCache.set(effect.target, this.selectTargets(source, effect.target));
      }
    }
    const targetUnitIds = unique([...targetCache.values()].flat().map((target) => target.id));

    if (!passive) {
      this.emit({
        type: "movementIntent",
        unitId: source.id,
        targetUnitIds,
        intent: movementIntent(skill),
      });
      this.emit({ type: "skillUsed", sourceUnitId: source.id, skillId: skill.id, targetUnitIds });
      if (skill.cooldown > 0) {
        source.cooldowns[skill.id] = skill.cooldown;
        this.emit({
          type: "cooldownChanged",
          unitId: source.id,
          skillId: skill.id,
          remaining: skill.cooldown,
        });
      }
    }

    skill.effects.forEach((effect, effectIndex) => {
      const targets = (targetCache.get(effect.target) ?? []).filter((target) => !target.defeated);
      this.applyEffect(source, effect, targets, effectIndex);
    });
  }

  private applyEffect(
    source: RuntimeUnit,
    effect: EffectDefinition,
    targets: RuntimeUnit[],
    effectIndex: number,
  ) {
    if (effect.kind === "damage") {
      const calculated = targets.map((target) => ({
        target,
        amount: this.calculateDamage(source, target, effect.potency, effect.damageType),
      }));
      for (const entry of calculated) {
        const amount = Math.min(entry.target.health, entry.amount);
        entry.target.health -= amount;
        this.summary.damageBySide[source.side] += amount;
        const damageEvent = this.emit({
          type: "damageApplied",
          sourceUnitId: source.id,
          targetUnitId: entry.target.id,
          amount,
          calculatedAmount: entry.amount,
          remainingHealth: entry.target.health,
          effectIndex,
        });
        if (entry.target.health > 0) {
          this.triggerPassives("afterDamageTaken", entry.target, damageEvent.sequence);
        }
      }
      this.markDefeats();
      return;
    }

    if (effect.kind === "heal") {
      const calculatedAmount = Math.max(
        1,
        Math.round((this.effectiveStat(source, "attack") * effect.potency) / 100),
      );
      for (const target of targets) {
        const amount = Math.min(target.baseStats.maxHealth - target.health, calculatedAmount);
        if (amount <= 0) continue;
        target.health += amount;
        this.summary.healingBySide[source.side] += amount;
        this.emit({
          type: "healingApplied",
          sourceUnitId: source.id,
          targetUnitId: target.id,
          amount,
          calculatedAmount,
          remainingHealth: target.health,
          effectIndex,
        });
      }
      return;
    }

    if (effect.kind === "applyStatus") {
      for (const target of targets) {
        if (this.rng.next() * 100 >= effect.chance) continue;
        this.applyStatus(source, target, effect.statusId, effect.duration, effect.magnitude ?? 0);
      }
      return;
    }

    for (const target of targets) {
      const removable = target.statuses
        .filter((runtimeStatus) => {
          const definition = this.status(runtimeStatus.statusId);
          return effect.tag === "debuff"
            ? definition.polarity === "debuff"
            : definition.category === "damageOverTime";
        })
        .sort((left, right) => left.statusId.localeCompare(right.statusId))
        .slice(0, effect.count);
      for (const status of removable) {
        target.statuses.splice(target.statuses.indexOf(status), 1);
        this.emit({ type: "statusExpired", targetUnitId: target.id, statusId: status.statusId });
      }
    }
  }

  private applyStatus(
    source: RuntimeUnit,
    target: RuntimeUnit,
    statusId: StatusId,
    duration: number,
    magnitude: number,
  ) {
    const definition = this.status(statusId);
    const existing = target.statuses.find((runtimeStatus) => runtimeStatus.statusId === statusId);
    if (!existing) {
      target.statuses.push({
        statusId,
        sourceUnitId: source.id,
        remainingTurns: duration,
        magnitude,
      });
      target.statuses.sort((left, right) => left.statusId.localeCompare(right.statusId));
      this.emit({
        type: "statusApplied",
        sourceUnitId: source.id,
        targetUnitId: target.id,
        statusId,
        duration,
        magnitude,
      });
      return;
    }

    const remainingTurns = Math.max(existing.remainingTurns, duration);
    const useIncomingMagnitude =
      definition.stacking === "refreshStrongest" &&
      Math.abs(magnitude) > Math.abs(existing.magnitude);
    const nextMagnitude = useIncomingMagnitude ? magnitude : existing.magnitude;
    const refreshed = {
      statusId,
      sourceUnitId: useIncomingMagnitude ? source.id : existing.sourceUnitId,
      remainingTurns,
      magnitude: nextMagnitude,
    };
    target.statuses.splice(target.statuses.indexOf(existing), 1, refreshed);
    this.emit({
      type: "statusRefreshed",
      sourceUnitId: source.id,
      targetUnitId: target.id,
      statusId,
      duration: remainingTurns,
      magnitude: nextMagnitude,
    });
  }

  private tickStatuses(unit: RuntimeUnit, timing: StatusDefinition["timing"]) {
    const ticking = unit.statuses.filter(
      (runtimeStatus) => this.status(runtimeStatus.statusId).timing === timing,
    );
    for (const runtimeStatus of ticking) {
      const definition = this.status(runtimeStatus.statusId);
      if (definition.category !== "damageOverTime" && definition.category !== "healingOverTime") {
        continue;
      }
      const source = this.units.find(({ id }) => id === runtimeStatus.sourceUnitId) ?? unit;
      const calculated = Math.max(
        1,
        Math.round(this.effectiveStat(source, "attack") * Math.abs(runtimeStatus.magnitude)),
      );
      if (definition.category === "damageOverTime") {
        const amount = Math.min(unit.health, calculated);
        unit.health -= amount;
        this.summary.damageBySide[source.side] += amount;
        this.emit({
          type: "statusTicked",
          sourceUnitId: source.id,
          targetUnitId: unit.id,
          statusId: runtimeStatus.statusId,
          amount,
          tickKind: "damage",
        });
        this.markDefeats();
      } else {
        const amount = Math.min(unit.baseStats.maxHealth - unit.health, calculated);
        if (amount > 0) {
          unit.health += amount;
          this.summary.healingBySide[source.side] += amount;
          this.emit({
            type: "statusTicked",
            sourceUnitId: source.id,
            targetUnitId: unit.id,
            statusId: runtimeStatus.statusId,
            amount,
            tickKind: "healing",
          });
        }
      }
      if (unit.defeated) break;
    }
  }

  private triggerPassives(
    trigger: PassiveTriggerEvent,
    relevantUnit: RuntimeUnit | undefined,
    sourceEventSequence: number,
  ) {
    if (this.triggerLimitReached) return;
    const candidates = this.units
      .filter((unit) => {
        if (unit.defeated) return false;
        if (trigger === "turnStarted" || trigger === "afterDamageTaken")
          return unit === relevantUnit;
        if (trigger === "allyDefeated") return unit.side === relevantUnit?.side;
        return true;
      })
      .sort(compareStableUnits);

    for (const unit of candidates) {
      for (const skillId of unit.skillIds) {
        const skill = this.skill(skillId);
        if (skill.kind !== "passive" || skill.passiveTrigger?.event !== trigger) continue;
        if (skill.passiveTrigger.oncePerBattle && unit.usedPassives.has(skill.id)) continue;
        if (this.passiveTriggers >= this.maximumPassiveTriggers) {
          this.triggerLimitReached = true;
          this.emit({ type: "triggerLimitReached", maximumTriggers: this.maximumPassiveTriggers });
          return;
        }
        this.passiveTriggers += 1;
        if (skill.passiveTrigger.oncePerBattle) unit.usedPassives.add(skill.id);
        this.emit({
          type: "passiveTriggered",
          unitId: unit.id,
          skillId: skill.id,
          trigger,
          sourceEventSequence,
        });
        this.resolveSkill(unit, skill, true);
        this.markDefeats();
      }
    }
  }

  private markDefeats() {
    const newlyDefeated = this.units
      .filter((unit) => !unit.defeated && unit.health <= 0)
      .sort(compareStableUnits);
    for (const unit of newlyDefeated) {
      unit.health = 0;
      unit.defeated = true;
      this.summary.defeatedUnitIds.push(unit.id);
    }
    for (const unit of newlyDefeated) {
      const event = this.emit({ type: "unitDefeated", unitId: unit.id });
      this.triggerPassives("allyDefeated", unit, event.sequence);
    }
  }

  private decrementCooldowns(unit: RuntimeUnit, usedSkillId?: string) {
    for (const skillId of Object.keys(unit.cooldowns).sort()) {
      if (skillId === usedSkillId) continue;
      const typedSkillId = skillId as SkillId;
      const remaining = Math.max(0, (unit.cooldowns[typedSkillId] ?? 0) - 1);
      unit.cooldowns[typedSkillId] = remaining;
      this.emit({ type: "cooldownChanged", unitId: unit.id, skillId: typedSkillId, remaining });
    }
  }

  private decrementStatuses(unit: RuntimeUnit) {
    const statuses = [...unit.statuses];
    for (const runtimeStatus of statuses) {
      const next = runtimeStatus.remainingTurns - 1;
      if (next <= 0) {
        unit.statuses.splice(unit.statuses.indexOf(runtimeStatus), 1);
        this.emit({
          type: "statusExpired",
          targetUnitId: unit.id,
          statusId: runtimeStatus.statusId,
        });
      } else {
        unit.statuses.splice(unit.statuses.indexOf(runtimeStatus), 1, {
          ...runtimeStatus,
          remainingTurns: next,
        });
      }
    }
  }

  private candidateTargets(source: RuntimeUnit, selector: TargetSelector) {
    const allies = this.units.filter((unit) => !unit.defeated && unit.side === source.side);
    const enemies = this.units.filter((unit) => !unit.defeated && unit.side !== source.side);
    switch (selector) {
      case "self":
        return [source];
      case "allEnemies":
      case "randomEnemy":
      case "singleEnemyLowestHealthPercent":
      case "singleEnemyHighestAttack":
      case "singleEnemyFrontFirst":
        return enemies;
      case "singleAllyLowestHealthPercent":
      case "allAllies":
        return allies.filter((unit) => unit !== source);
      case "singleAllyLowestHealthPercentIncludingSelf":
      case "allAlliesIncludingSelf":
        return allies;
    }
  }

  private selectTargets(source: RuntimeUnit, selector: TargetSelector): RuntimeUnit[] {
    const candidates = this.candidateTargets(source, selector);
    if (!candidates.length) return [];
    const stable = candidates.slice().sort(compareStableUnits);
    switch (selector) {
      case "allEnemies":
      case "allAllies":
      case "allAlliesIncludingSelf":
        return stable;
      case "randomEnemy":
        return [this.rng.pick(stable)];
      case "singleEnemyHighestAttack":
        return [
          stable.sort(
            (left, right) =>
              this.effectiveStat(right, "attack") - this.effectiveStat(left, "attack") ||
              compareStableUnits(left, right),
          )[0]!,
        ];
      case "singleEnemyFrontFirst":
        return [stable[0]!];
      case "singleEnemyLowestHealthPercent":
      case "singleAllyLowestHealthPercent":
      case "singleAllyLowestHealthPercentIncludingSelf":
        return [stable.sort(compareHealthPercent)[0]!];
      case "self":
        return [source];
    }
  }

  private calculateDamage(
    source: RuntimeUnit,
    target: RuntimeUnit,
    potency: number,
    damageType: "standard" | "true",
  ) {
    const raw = (this.effectiveStat(source, "attack") * potency) / 100;
    const mitigated =
      damageType === "true" ? raw : (raw * 100) / (100 + this.effectiveStat(target, "defense"));
    return Math.max(1, Math.round(mitigated));
  }

  private effectiveStat(unit: RuntimeUnit, stat: "attack" | "defense" | "speed") {
    const category = `${stat}Modifier` as StatusDefinition["category"];
    const modifier = unit.statuses.reduce(
      (total, runtimeStatus) =>
        this.status(runtimeStatus.statusId).category === category
          ? total + runtimeStatus.magnitude
          : total,
      0,
    );
    const minimum = stat === "defense" ? 0 : 1;
    return Math.max(minimum, unit.baseStats[stat] * (1 + modifier));
  }

  private nextUnit() {
    return this.units
      .filter((unit) => !unit.defeated)
      .sort(
        (left, right) =>
          left.nextActionAt - right.nextActionAt ||
          this.effectiveStat(right, "speed") - this.effectiveStat(left, "speed") ||
          compareStableUnits(left, right),
      )[0];
  }

  private evaluateElimination() {
    if (this.outcome) return;
    const playerAlive = this.units.some((unit) => unit.side === "player" && !unit.defeated);
    const enemyAlive = this.units.some((unit) => unit.side === "enemy" && !unit.defeated);
    if (playerAlive && enemyAlive) return;
    this.finish(playerAlive ? "victory" : enemyAlive ? "defeat" : "draw", "elimination");
  }

  private finish(outcome: BattleResult["outcome"], reason: BattleResult["reason"]) {
    if (this.outcome) return;
    this.outcome = outcome;
    this.reason = reason;
    if (outcome === "victory") this.calculateRewards();
    this.emit({ type: "battleEnded", outcome, turns: this.turns, reason });
  }

  private calculateRewards() {
    const encounter = this.indexed.content.encounters.find(
      ({ id }) => id === this.input.encounterId,
    )!;
    const table = this.indexed.content.rewardTables.find(
      ({ id }) => id === encounter.rewardTableId,
    )!;
    const drop = table.weightedDrops.length
      ? this.rng.weightedPick(table.weightedDrops.map((value) => ({ value, weight: value.weight })))
      : undefined;
    this.rewards = {
      coins: table.fixedCoins,
      squadExperience: table.squadExperience,
      ...(drop
        ? { drop: { kind: drop.kind, contentId: drop.contentId, amount: drop.amount } }
        : {}),
    };
    this.emit({ type: "rewardsCalculated", ...this.rewards });
  }

  private result(): BattleResult {
    return {
      battleId: this.battleId,
      seed: this.rng.seed,
      outcome: this.outcome ?? "draw",
      reason: this.reason ?? "invalidState",
      events: this.events,
      finalUnits: this.units.slice().sort(compareStableUnits).map(snapshotRuntimeUnit),
      ...(this.rewards ? { rewards: this.rewards } : {}),
      summary: {
        turns: this.turns,
        timeline: roundTimeline(this.timeline),
        damageBySide: { ...this.summary.damageBySide },
        healingBySide: { ...this.summary.healingBySide },
        defeatedUnitIds: [...this.summary.defeatedUnitIds],
        eventCount: this.events.length,
      },
    };
  }

  private skill(id: string) {
    const skill = this.indexed.skills.get(id);
    if (!skill) throw new Error(`Unknown skill '${id}'`);
    return skill;
  }

  private status(id: string) {
    const status = this.indexed.statuses.get(id);
    if (!status) throw new Error(`Unknown status '${id}'`);
    return status;
  }

  private emit(event: EmittableBattleEvent): BattleEvent {
    const emitted = {
      ...event,
      battleId: this.battleId,
      sequence: this.events.length + 1,
    } as BattleEvent;
    this.events.push(emitted);
    return emitted;
  }
}

export function simulateBattle(input: BattleInput): BattleResult {
  return new BattleSimulation(input).run();
}

function positiveInteger(value: number | undefined, fallback: number) {
  return Number.isInteger(value) && (value ?? 0) > 0 ? value! : fallback;
}

function compareStableUnits(left: RuntimeUnit, right: RuntimeUnit) {
  if (left.side !== right.side) return left.side === "player" ? -1 : 1;
  return left.slot - right.slot || left.id.localeCompare(right.id);
}

function compareHealthPercent(left: RuntimeUnit, right: RuntimeUnit) {
  return (
    left.health / left.baseStats.maxHealth - right.health / right.baseStats.maxHealth ||
    compareStableUnits(left, right)
  );
}

function movementIntent(
  skill: SkillDefinition,
): "approach" | "retreat" | "projectile" | "stationary" {
  if (skill.effects.every((effect) => effect.kind === "heal" || effect.kind === "applyStatus")) {
    return "stationary";
  }
  if (skill.effects.some((effect) => effect.target === "allEnemies")) return "projectile";
  return "approach";
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function roundTimeline(value: number) {
  return Math.round(value * 1_000) / 1_000;
}
