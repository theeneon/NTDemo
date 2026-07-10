const screens = {
  roster: {
    label: "Roster",
    title: "Understand the roster at a glance.",
    copy: "Role, rank, level, and power are visible before selection. Filters support comparison without hiding the primary “Build squad” action.",
    markup: `
      <div class="wf-shell">
        <div class="wf-topbar"><div class="wf-title"><b>Roster · 8 ninjas</b><span class="wf-line short"></span></div><div class="wf-actions"><span class="wf-button">Free summon</span><span class="wf-button primary">Build squad</span></div></div>
        <div class="wf-toolbar"><span class="wf-chip active">All</span><span class="wf-chip">Striker</span><span class="wf-chip">Guard</span><span class="wf-chip">Support</span><span class="wf-chip">Control</span></div>
        <div class="wf-card-grid">
          ${["Ember · Striker", "Reed · Guard", "Mist · Support", "Kite · Control", "Flint · Striker", "Moss · Guard", "Rain · Support", "Echo · Control"].map((name, i) => `<div class="wf-card"><div class="wf-avatar">Portrait ${i + 1}</div><div class="wf-meta"><b>${name}</b><span>Lv ${i < 4 ? 3 : 1}</span></div><span class="wf-line"></span></div>`).join("")}
        </div>
      </div>`,
  },
  squad: {
    label: "Squad selection",
    title: "Make four choices feel consequential.",
    copy: "Four fixed formation slots sit beside the available roster. Role balance, combined power, and clear add/remove controls make squad legality obvious.",
    markup: `
      <div class="wf-shell">
        <div class="wf-topbar"><div class="wf-title"><b>Build squad · 4 / 4</b><span class="wf-line"></span></div><div class="wf-actions"><span class="wf-button">Clear</span><span class="wf-button primary">Choose mission</span></div></div>
        <div class="wf-split">
          <div class="wf-panel"><div class="wf-panel-title">Available ninjas</div><div class="wf-roster-list">${["Flint · 128", "Moss · 121", "Rain · 116", "Echo · 112", "Ash · 107", "Vale · 102"].map((name) => `<div class="wf-roster-row"><span class="wf-mini-avatar"></span><b>${name}</b><span>＋</span></div>`).join("")}</div></div>
          <div class="wf-panel"><div class="wf-panel-title">Formation · Power 477</div><div class="wf-slot-grid">${["Front · Reed", "Front · Ember", "Back · Mist", "Back · Kite"].map((name) => `<div class="wf-slot"><span class="wf-mini-avatar"></span><b>${name}</b><span>Remove</span></div>`).join("")}</div></div>
        </div>
      </div>`,
  },
  campaign: {
    label: "Campaign",
    title: "Show the shortest path to the next battle.",
    copy: "Five numbered encounters communicate progression and first-clear rewards. The repeatable dungeon remains visible without competing with the campaign path.",
    markup: `
      <div class="wf-shell">
        <div class="wf-topbar"><div class="wf-title"><b>Campaign · Chapter 1</b><span class="wf-line"></span></div><div class="wf-actions"><span class="wf-button">Squad · 477</span></div></div>
        <div class="wf-map"><span class="wf-map-path"></span>
          <span class="wf-stage" style="left:8%;top:61%">1</span><span class="wf-stage" style="left:26%;top:48%">2</span><span class="wf-stage" style="left:45%;top:53%">3</span><span class="wf-stage locked" style="left:63%;top:32%">4</span><span class="wf-stage locked" style="left:80%;top:22%">5</span>
          <div class="wf-dungeon"><b>Repeatable dungeon</b><p>Recommended 520</p><span class="wf-button">View rewards</span></div>
        </div>
        <div class="wf-topbar"><div class="wf-title"><b>Encounter 3 · Bamboo Pass</b><span class="wf-line"></span></div><span class="wf-button primary">Enter battle</span></div>
      </div>`,
  },
  battle: {
    label: "Battle",
    title: "Keep automated combat readable and controllable.",
    copy: "Stable 2×2 formations, persistent health and status information, a turn preview, and pause/speed/skip controls prevent animation from obscuring tactics.",
    markup: `
      <div class="wf-shell">
        <div class="wf-topbar"><div class="wf-title"><b>Bamboo Pass · Wave 1</b><span class="wf-line short"></span></div><div class="wf-actions"><span class="wf-button">Pause</span><span class="wf-button primary">1×</span><span class="wf-button">Skip</span></div></div>
        <div class="wf-timeline"><b>Next</b>${Array.from({length: 7}, () => `<span class="wf-turn"></span>`).join("")}<span>Turn 12 / 100</span></div>
        <div class="wf-battlefield">
          <div class="wf-team">${["Reed", "Ember", "Mist", "Kite"].map((name) => `<div class="wf-unit"><b>${name}</b><span>sprite</span><span class="wf-health"><span></span></span><small>buff · 2</small></div>`).join("")}</div>
          <div class="wf-team">${["Raider", "Brute", "Scout", "Hexer"].map((name, i) => `<div class="wf-unit"><b>${name}</b><span>sprite</span><span class="wf-health"><span style="width:${82 - i * 13}%"></span></span><small>${i === 2 ? "stun · 1" : "status"}</small></div>`).join("")}</div>
        </div>
        <div class="wf-topbar"><span>Ember used Cinder Arc · 84 damage</span><span class="wf-button">Combat log</span></div>
      </div>`,
  },
  results: {
    label: "Results",
    title: "Connect victory directly to improvement.",
    copy: "Rewards and level progress are applied visibly. “Upgrade ninja” is the primary next step; replay and campaign navigation remain available.",
    markup: `
      <div class="wf-shell">
        <div class="wf-result"><div><div class="wf-result-mark">勝</div><h3>Victory · 38 turns</h3><span class="wf-line"></span></div><div class="wf-rewards"><span class="wf-reward">＋120 coins</span><span class="wf-reward">＋40 squad XP</span><span class="wf-reward">Scout wraps · New</span></div><div class="wf-stat-list" style="width:min(100%,420px)">${["Ember · Lv 3", "Reed · Lv 3", "Mist · Lv 3", "Kite · Lv 3"].map((n) => `<div class="wf-stat"><b>${n}</b><span class="wf-bar"><span></span></span><small>+40</small></div>`).join("")}</div><div class="wf-actions"><span class="wf-button">Campaign</span><span class="wf-button">Replay</span><span class="wf-button primary">Upgrade ninja</span></div></div>
      </div>`,
  },
  upgrade: {
    label: "Upgrade",
    title: "Make increased power obvious before replay.",
    copy: "The selected ninja, affordable action, stat delta, and equipment path fit in one view. Every upgrade previews its exact effect before currency is spent.",
    markup: `
      <div class="wf-shell">
        <div class="wf-topbar"><div class="wf-title"><b>Upgrade · Ember</b><span class="wf-line short"></span></div><div class="wf-actions"><span class="wf-button primary">Return to squad</span></div></div>
        <div class="wf-split"><div class="wf-panel"><div class="wf-avatar" style="min-height:180px">Selected portrait</div><h3>Ember · Striker</h3><p>Level 3 · 80 / 100 XP</p><span class="wf-button primary">Level up · 100 coins</span></div><div class="wf-panel"><div class="wf-panel-title">Power 128 → 143</div><div class="wf-stat-list">${[["Health","+32"],["Attack","+9"],["Defense","+4"],["Speed","+1"]].map(([n,v],i) => `<div class="wf-stat"><b>${n}</b><span class="wf-bar"><span style="width:${50+i*9}%"></span></span><small>${v}</small></div>`).join("")}</div><div class="wf-panel-title" style="margin-top:1rem">Equipment</div><div class="wf-gear"><span class="wf-gear-slot">Weapon<br>Empty</span><span class="wf-gear-slot">Armor<br>Scout wraps</span><span class="wf-gear-slot">Charm<br>Locked</span><span class="wf-gear-slot">Relic<br>Locked</span></div></div></div>
      </div>`,
  },
  summon: {
    label: "Free summon",
    title: "Demonstrate delight without implying a store.",
    copy: "The single free summon clearly states that it is a demo, shows rank probabilities before confirmation, and provides no paid repeat action.",
    markup: `
      <div class="wf-shell">
        <div class="wf-topbar"><div class="wf-title"><b>Free summon demo</b><span class="wf-line short"></span></div><div class="wf-actions"><span class="wf-button">Back to roster</span></div></div>
        <div class="wf-summon"><div><div class="wf-seal">Summon seal<br>placeholder effect</div><h3>One free recruit</h3><p>Elite 10% · Skilled 30% · Common 60%</p><small>Demo probabilities · no purchase available</small></div><span class="wf-button primary">Use free summon</span></div>
      </div>`,
  },
};

const canvas = document.querySelector("#wireframe-canvas");
const label = document.querySelector("#screen-label");
const intentTitle = document.querySelector("#screen-intent-title");
const intentCopy = document.querySelector("#screen-intent-copy");
const tabs = [...document.querySelectorAll("[data-screen]")];

function setScreen(key, focusPanel = false) {
  const screen = screens[key];
  if (!screen) return;
  canvas.innerHTML = screen.markup;
  label.textContent = screen.label;
  intentTitle.textContent = screen.title;
  intentCopy.textContent = screen.copy;
  tabs.forEach((tab) => {
    const selected = tab.dataset.screen === key;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  if (focusPanel) canvas.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setScreen(tab.dataset.screen));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    tabs[next].focus();
    setScreen(tabs[next].dataset.screen);
  });
});

setScreen("roster");

const checklist = [...document.querySelectorAll("[data-check]")];
const storageKey = "ninja-tactics-phase-0-checks-v1";

function readChecks() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function updateProgress() {
  const checked = checklist.filter((item) => item.checked).length;
  const percent = Math.round((checked / checklist.length) * 100);
  document.querySelector("#check-count").textContent = `${checked} of ${checklist.length} verified`;
  document.querySelector("#check-percent").textContent = `${percent}%`;
  const ring = document.querySelector("#progress-ring");
  ring.style.setProperty("--progress", `${percent * 3.6}deg`);
  ring.setAttribute("aria-label", `${percent} percent of acceptance checks complete`);
  try {
    localStorage.setItem(storageKey, JSON.stringify(checklist.filter((item) => item.checked).map((item) => item.dataset.check)));
  } catch {
    // The review page still works when storage is unavailable.
  }
}

const savedChecks = new Set(readChecks());
checklist.forEach((item) => {
  item.checked = savedChecks.has(item.dataset.check);
  item.addEventListener("change", updateProgress);
});
document.querySelector("#reset-checks").addEventListener("click", () => {
  checklist.forEach((item) => { item.checked = false; });
  updateProgress();
});
updateProgress();

const navLinks = [...document.querySelectorAll(".section-nav a")];
const sections = [...document.querySelectorAll("main > section[id]")];
const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
}, { rootMargin: "-20% 0px -65%", threshold: [0, 0.25, 0.5] });
sections.forEach((section) => observer.observe(section));
