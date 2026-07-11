import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../shared/layout/AppShell";

const BattlePage = lazy(async () => ({
  default: (await import("../features/battle/BattlePage")).BattlePage,
}));
const CampaignPage = lazy(async () => ({
  default: (await import("../features/campaign/CampaignPage")).CampaignPage,
}));
const ContentLabPage = lazy(async () => ({
  default: (await import("../features/content-lab/ContentLabPage")).ContentLabPage,
}));
const CombatLabPage = lazy(async () => ({
  default: (await import("../features/combat-lab/CombatLabPage")).CombatLabPage,
}));
const NotFoundPage = lazy(async () => ({
  default: (await import("../features/not-found/NotFoundPage")).NotFoundPage,
}));
const ResultsPage = lazy(async () => ({
  default: (await import("../features/results/ResultsPage")).ResultsPage,
}));
const RosterPage = lazy(async () => ({
  default: (await import("../features/roster/RosterPage")).RosterPage,
}));
const SquadPage = lazy(async () => ({
  default: (await import("../features/squad/SquadPage")).SquadPage,
}));
const SummonPage = lazy(async () => ({
  default: (await import("../features/summon/SummonPage")).SummonPage,
}));
const UpgradesPage = lazy(async () => ({
  default: (await import("../features/upgrades/UpgradesPage")).UpgradesPage,
}));

function DeferredRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="route-loading" role="status">
          Loading expedition…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/roster" />} />
        <Route
          path="roster"
          element={
            <DeferredRoute>
              <RosterPage />
            </DeferredRoute>
          }
        />
        <Route
          path="squad"
          element={
            <DeferredRoute>
              <SquadPage />
            </DeferredRoute>
          }
        />
        <Route
          path="campaign"
          element={
            <DeferredRoute>
              <CampaignPage />
            </DeferredRoute>
          }
        />
        <Route
          path="content-lab"
          element={
            <DeferredRoute>
              <ContentLabPage />
            </DeferredRoute>
          }
        />
        <Route
          path="combat-lab"
          element={
            <DeferredRoute>
              <CombatLabPage />
            </DeferredRoute>
          }
        />
        <Route
          path="battle"
          element={
            <DeferredRoute>
              <BattlePage />
            </DeferredRoute>
          }
        />
        <Route
          path="results"
          element={
            <DeferredRoute>
              <ResultsPage />
            </DeferredRoute>
          }
        />
        <Route
          path="upgrades"
          element={
            <DeferredRoute>
              <UpgradesPage />
            </DeferredRoute>
          }
        />
        <Route
          path="summon"
          element={
            <DeferredRoute>
              <SummonPage />
            </DeferredRoute>
          }
        />
        <Route
          path="*"
          element={
            <DeferredRoute>
              <NotFoundPage />
            </DeferredRoute>
          }
        />
      </Route>
    </Routes>
  );
}
