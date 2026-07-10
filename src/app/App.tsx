import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../shared/layout/AppShell";
import { BattlePage } from "../features/battle/BattlePage";
import { CampaignPage } from "../features/campaign/CampaignPage";
import { NotFoundPage } from "../features/not-found/NotFoundPage";
import { ResultsPage } from "../features/results/ResultsPage";
import { RosterPage } from "../features/roster/RosterPage";
import { SquadPage } from "../features/squad/SquadPage";
import { SummonPage } from "../features/summon/SummonPage";
import { UpgradesPage } from "../features/upgrades/UpgradesPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/roster" />} />
        <Route path="roster" element={<RosterPage />} />
        <Route path="squad" element={<SquadPage />} />
        <Route path="campaign" element={<CampaignPage />} />
        <Route path="battle" element={<BattlePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="upgrades" element={<UpgradesPage />} />
        <Route path="summon" element={<SummonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
