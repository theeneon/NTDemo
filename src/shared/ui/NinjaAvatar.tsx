import type { CSSProperties } from "react";
import type { Ninja } from "../../content/demoContent";

export function NinjaAvatar({ ninja, size = "md" }: { ninja: Ninja; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={`ninja-avatar ninja-avatar-${size}`}
      style={{ "--avatar-accent": ninja.accent } as CSSProperties}
      aria-hidden="true"
    >
      <span>{ninja.glyph}</span>
      <i />
    </div>
  );
}
