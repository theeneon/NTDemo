import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { usePlayerStore } from "../../stores/playerStore";
import { usePresentationStore } from "../../stores/presentationStore";
import { Icon, type IconName } from "../ui/Icon";

const navigation: {
  to: string;
  label: string;
  mobileLabel?: string;
  icon: IconName;
  hotkey: string;
  mobile?: boolean;
}[] = [
  {
    to: "/roster",
    label: "Hero Roster",
    mobileLabel: "Roster",
    icon: "roster",
    hotkey: "R",
    mobile: true,
  },
  {
    to: "/squad",
    label: "Warband",
    mobileLabel: "Squad",
    icon: "squad",
    hotkey: "S",
    mobile: true,
  },
  {
    to: "/campaign",
    label: "World Map",
    mobileLabel: "Map",
    icon: "campaign",
    hotkey: "M",
    mobile: true,
  },
  {
    to: "/battle",
    label: "Battlefield",
    mobileLabel: "Battle",
    icon: "battle",
    hotkey: "B",
    mobile: true,
  },
  { to: "/results", label: "Spoils", icon: "results", hotkey: "V" },
  {
    to: "/upgrades",
    label: "Training Hall",
    mobileLabel: "Train",
    icon: "upgrade",
    hotkey: "U",
    mobile: true,
  },
  { to: "/summon", label: "Spirit Gate", icon: "summon", hotkey: "G" },
  { to: "/content-lab", label: "Content Codex", icon: "spark", hotkey: "C" },
];

function Brand() {
  return (
    <NavLink className="brand" to="/roster" aria-label="Ninja Tactics roster">
      <span className="brand-seal" aria-hidden="true">
        忍
      </span>
      <span>
        <strong>Ninja Tactics</strong>
        <small>Web demo</small>
      </span>
    </NavLink>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="primary-nav" aria-label="Game screens">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
          <kbd>{item.hotkey}</kbd>
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const coins = usePlayerStore((state) => state.coins);
  const crystals = usePlayerStore((state) => state.crystals);
  const isMenuOpen = usePresentationStore((state) => state.isMenuOpen);
  const setMenuOpen = usePresentationStore((state) => state.setMenuOpen);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#page-content">
        Skip to page content
      </a>

      <aside className="desktop-sidebar">
        <Brand />
        <div className="sidebar-label">Adventurer's journal</div>
        <NavItems />
        <div className="phase-status">
          <div>
            <span>Active quest</span>
            <strong>Chapter II</strong>
          </div>
          <div className="phase-track">
            <span />
          </div>
          <p>Validate the realm's combatants, skills, rewards, and encounter records.</p>
          <a href="/content-lab">Open content codex</a>
        </div>
      </aside>

      <div className="app-column">
        <header className="topbar">
          <button
            className="menu-button"
            type="button"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="topbar-context">
            <span className="live-dot" />
            <span>
              <small>Realm</small>
              <strong>Moonfall Vale</strong>
            </span>
          </div>
          <div className="resource-list" aria-label="Player resources">
            <span>
              <Icon name="coin" /> <strong>{coins.toLocaleString()}</strong>
              <small>coins</small>
            </span>
            <span>
              <Icon name="spark" /> <strong>{crystals}</strong>
              <small>premium</small>
            </span>
          </div>
          <div className="profile-chip" aria-label="Player profile placeholder">
            <span>
              <b>12</b>
            </span>
            <div>
              <strong>Leaf Nomad</strong>
              <small>Wanderer · Level 12</small>
            </div>
          </div>
        </header>

        <main id="page-content" className="page-content" tabIndex={-1}>
          <div className="game-viewport">
            <span className="viewport-rivet viewport-rivet-one" aria-hidden="true" />
            <span className="viewport-rivet viewport-rivet-two" aria-hidden="true" />
            <Outlet />
          </div>
        </main>

        <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
          {navigation
            .filter((item) => item.mobile)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Icon name={item.icon} />
                <span>{item.mobileLabel ?? item.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>

      <div
        className={`mobile-drawer ${isMenuOpen ? "mobile-drawer-open" : ""}`}
        aria-hidden={!isMenuOpen}
      >
        <button
          className="drawer-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
        <aside aria-label="Mobile navigation drawer">
          <div className="drawer-header">
            <Brand />
            <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>
              <Icon name="close" />
            </button>
          </div>
          <NavItems onNavigate={() => setMenuOpen(false)} />
          <a className="drawer-doc-link" href="/docs/phase-0/README.md">
            Phase 0 planning baseline <Icon name="arrow" />
          </a>
        </aside>
      </div>
    </div>
  );
}
