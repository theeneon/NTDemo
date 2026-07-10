import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { usePlayerStore } from "../../stores/playerStore";
import { usePresentationStore } from "../../stores/presentationStore";
import { Icon, type IconName } from "../ui/Icon";

const navigation: { to: string; label: string; icon: IconName; mobile?: boolean }[] = [
  { to: "/roster", label: "Roster", icon: "roster", mobile: true },
  { to: "/squad", label: "Squad", icon: "squad", mobile: true },
  { to: "/campaign", label: "Campaign", icon: "campaign", mobile: true },
  { to: "/battle", label: "Battle", icon: "battle", mobile: true },
  { to: "/results", label: "Results", icon: "results" },
  { to: "/upgrades", label: "Upgrades", icon: "upgrade", mobile: true },
  { to: "/summon", label: "Summon", icon: "summon" },
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
          <Icon className="nav-chevron" name="chevron" />
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
        <div className="sidebar-label">Command deck</div>
        <NavItems />
        <div className="phase-status">
          <div>
            <span>Foundation</span>
            <strong>Phase 1</strong>
          </div>
          <div className="phase-track">
            <span />
          </div>
          <p>
            Application shell and navigation are active. Gameplay systems arrive in later phases.
          </p>
          <a href="/docs/phase-0/README.md">Open Phase 0 baseline</a>
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
            <span className="live-dot" /> Local profile
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
            <span>LN</span>
            <div>
              <strong>Leaf Nomad</strong>
              <small>Demo profile</small>
            </div>
          </div>
        </header>

        <main id="page-content" className="page-content" tabIndex={-1}>
          <Outlet />
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
                <span>{item.label}</span>
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
