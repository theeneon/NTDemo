import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "roster"
  | "squad"
  | "campaign"
  | "battle"
  | "results"
  | "upgrade"
  | "summon"
  | "coin"
  | "spark"
  | "menu"
  | "close"
  | "arrow"
  | "shield"
  | "play"
  | "pause"
  | "skip"
  | "lock"
  | "check"
  | "chevron";

const paths: Record<IconName, ReactNode> = {
  roster: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3.5 2.4-5 5.5-5s4.9 1.5 5.5 5M16 7h5M18.5 4.5v5M16 14h5M16 18h5" />
    </>
  ),
  squad: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M2.5 19c.5-3.6 2.3-5.2 5.5-5.2s5 1.6 5.5 5.2M14 14.5c2.4-.8 5.9.2 7 4.5" />
    </>
  ),
  campaign: (
    <>
      <path d="M4 19V5l5-2 6 2 5-2v14l-5 2-6-2-5 2Z" />
      <path d="M9 3v14M15 5v14M11.5 11.5l2-2 2 1.5" />
    </>
  ),
  battle: (
    <>
      <path d="m5 4 14 16M19 4 5 20M7 6l-3-3M17 6l3-3M4 21l3-3M20 21l-3-3" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  results: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4ZM9 19h6M12 14v5M5 6H3v2a4 4 0 0 0 4 4M19 6h2v2a4 4 0 0 1-4 4" />
    </>
  ),
  upgrade: (
    <>
      <path d="M12 21V5M6 11l6-7 6 7M5 21h14" />
    </>
  ),
  summon: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9.5c0-1.2 1.2-2 3-2s3 .8 3 2-1.2 2-3 2-3 .8-3 2 1.2 2 3 2 3-.8 3-2M12 5v2.5M12 15.5V19" />
    </>
  ),
  spark: (
    <path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  shield: <path d="M12 3 5 6v5c0 4.6 2.8 7.8 7 10 4.2-2.2 7-5.4 7-10V6l-7-3Z" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  skip: (
    <>
      <path d="m5 6 8 6-8 6V6ZM13 6l8 6-8 6V6ZM21 6v12" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
};

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
