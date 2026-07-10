import { useLayoutEffect, useRef } from "react";
import { demoContent } from "../../content";
import type { BattleEvent, BattleUnitId } from "../../domain/models";
import { playbackRate, type PlaybackSpeed } from "./useBattlePlayback";

export function BattleEffectsLayer({
  event,
  battlefield,
  getUnitElement,
  speed,
  reducedMotion,
}: {
  event: BattleEvent | null;
  battlefield: HTMLElement | null;
  getUnitElement: (unitId: BattleUnitId) => HTMLElement | undefined;
  speed: PlaybackSpeed;
  reducedMotion: boolean;
}) {
  const projectileRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLSpanElement>(null);
  const projectile =
    event?.type === "movementIntent" && event.intent === "projectile" ? event : null;
  const cue = describeCue(event);

  useLayoutEffect(() => {
    if (!projectile || !fieldReady(battlefield)) return;
    const source = getUnitElement(projectile.unitId);
    const targetId = projectile.targetUnitIds[0];
    const target = targetId ? getUnitElement(targetId) : undefined;
    const projectileElement = projectileRef.current;
    if (!source || !target || !projectileElement) return;
    const fieldRect = battlefield.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const startX = sourceRect.left + sourceRect.width / 2 - fieldRect.left;
    const startY = sourceRect.top + sourceRect.height / 2 - fieldRect.top;
    const deltaX = targetRect.left + targetRect.width / 2 - fieldRect.left - startX;
    const deltaY = targetRect.top + targetRect.height / 2 - fieldRect.top - startY;
    projectileElement.style.left = `${startX}px`;
    projectileElement.style.top = `${startY}px`;
    if (!reducedMotion && typeof projectileElement.animate === "function") {
      const animation = projectileElement.animate(
        [
          { transform: "translate(-50%, -50%) scale(.6)", opacity: 0.25 },
          {
            transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(1.15)`,
            opacity: 1,
          },
        ],
        {
          duration: 145 / playbackRate(speed),
          easing: "cubic-bezier(.2,.8,.3,1)",
          fill: "forwards",
        },
      );
      return () => animation.cancel();
    }
    projectileElement.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
  }, [battlefield, getUnitElement, projectile, reducedMotion, speed]);

  useLayoutEffect(() => {
    if (!cue || !fieldReady(battlefield)) return;
    const target = getUnitElement(cue.targetUnitId);
    const cueElement = cueRef.current;
    if (!target || !cueElement) return;
    const fieldRect = battlefield.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    cueElement.style.left = `${targetRect.left + targetRect.width / 2 - fieldRect.left}px`;
    cueElement.style.top = `${targetRect.top - fieldRect.top + 16}px`;
  }, [battlefield, cue, getUnitElement]);

  return (
    <div className="battle-effects-layer" aria-hidden="true">
      {projectile ? <span ref={projectileRef} className="battle-projectile" /> : null}
      {cue ? (
        <span ref={cueRef} className={`battle-float-cue battle-float-cue-${cue.kind}`}>
          {cue.label}
        </span>
      ) : null}
    </div>
  );
}

type EffectCue = Readonly<{
  targetUnitId: BattleUnitId;
  label: string;
  kind: "damage" | "healing" | "status" | "defeat";
}>;

function describeCue(event: BattleEvent | null): EffectCue | null {
  if (!event) return null;
  if (event.type === "damageApplied") {
    return { targetUnitId: event.targetUnitId, label: `-${event.amount}`, kind: "damage" };
  }
  if (event.type === "healingApplied") {
    return { targetUnitId: event.targetUnitId, label: `+${event.amount}`, kind: "healing" };
  }
  if (event.type === "statusTicked") {
    return {
      targetUnitId: event.targetUnitId,
      label: `${event.tickKind === "damage" ? "-" : "+"}${event.amount}`,
      kind: event.tickKind === "damage" ? "damage" : "healing",
    };
  }
  if (event.type === "statusApplied" || event.type === "statusRefreshed") {
    const name = demoContent.statuses.find(({ id }) => id === event.statusId)?.name ?? "Status";
    return { targetUnitId: event.targetUnitId, label: name, kind: "status" };
  }
  if (event.type === "unitDefeated") {
    return { targetUnitId: event.unitId, label: "Defeated", kind: "defeat" };
  }
  return null;
}

function fieldReady(field: HTMLElement | null): field is HTMLElement {
  return field !== null;
}
