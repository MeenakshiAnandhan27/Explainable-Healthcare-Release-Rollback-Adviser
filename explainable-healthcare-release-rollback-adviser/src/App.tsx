import React, { useState, useEffect } from "react";
import {
  DashboardStats,
  Hospital,
  Release,
  UserSession
} from "./types";
import {
  fetchDashboardStats,
  fetchHospitals,
  fetchReleaseDetail,
  submitDecision
} from "./services/api";
import { Sidebar, NavPage } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DecisionModal } from "./components/DecisionModal";
import { RoleSwitchModal } from "./components/RoleSwitchModal";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { DashboardPage } from "./pages/DashboardPage";
import { ReleasesPage } from "./pages/ReleasesPage";
import { ReleaseDetailPage } from "./pages/ReleaseDetailPage";
import { RiskRulesPage } from "./pages/RiskRulesPage";
import { ExperimentPage } from "./pages/ExperimentPage";
import { DecisionHistoryPage } from "./pages/DecisionHistoryPage";
import { StakeholderValidationPage } from "./pages/StakeholderValidationPage";
import { DocumentationPage } from "./pages/DocumentationPage";

const DEFAULT_USER: UserSession = {
  username: "analyst",
  role: "SOC / Operations Analyst",
  name: "Marcus Vance, SOC Tier 2",
  token: "synthetic-token-analyst"
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>("dashboard");
  const [user, setUser] = useState<UserSession>(DEFAULT_USER);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("ALL");
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>("REL-CASE-001");
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Modals
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [modalRelease, setModalRelease] = useState<Release | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  // Global notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load initial global data
  const loadInitialData = async () => {
    try {
      const [hospList, stats] = await Promise.all([
        fetchHospitals(),
        fetchDashboardStats(selectedHospitalId !== "ALL" ? selectedHospitalId : undefined)
      ]);
      setHospitals(hospList);
      setDashboardStats(stats);

      // Pre-load default release
      try {
        const defaultRel = await fetchReleaseDetail("REL-CASE-001");
        setSelectedRelease(defaultRel);
      } catch (e) {
        // Fallback if not available
      }
    } catch (err) {
      console.error("Initial load error:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When selected hospital changes, reload stats
  useEffect(() => {
    fetchDashboardStats(selectedHospitalId !== "ALL" ? selectedHospitalId : undefined)
      .then(setDashboardStats)
      .catch((err) => console.error("Error updating stats for hospital:", err));
  }, [selectedHospitalId]);

  // Handler for selecting release from tables or cards
  const handleSelectRelease = async (releaseId: string) => {
    setSelectedReleaseId(releaseId);
    try {
      const rel = await fetchReleaseDetail(releaseId);
      setSelectedRelease(rel);
      setCurrentPage("release-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to load release detail:", err);
    }
  };

  // Handler for opening decision modal
  const handleOpenDecision = (release: Release) => {
    setModalRelease(release);
    setDecisionModalOpen(true);
  };

  // Handler for submitting decision
  const handleSubmitDecision = async (
    decision: "ROLLBACK" | "CONTINUE" | "SEND FOR REVIEW",
    overrideReason: string
  ) => {
    if (!modalRelease) return;
    await submitDecision({
      release_id: modalRelease.release_id,
      final_decision: decision,
      override_reason: overrideReason,
      decision_maker: user.name,
      role: user.role
    });

    showToast(`Decision recorded: ${decision} for ${modalRelease.release_id}. Audit trail updated.`);

    // Refresh current release detail and stats
    try {
      const updated = await fetchReleaseDetail(modalRelease.release_id);
      setSelectedRelease(updated);
      const newStats = await fetchDashboardStats(selectedHospitalId !== "ALL" ? selectedHospitalId : undefined);
      setDashboardStats(newStats);
    } catch (e) {
      console.error("Failed to refresh release after decision:", e);
    }
  };

  // Handler for failure test case quick buttons
  const handleSelectCase = async (caseId: string) => {
    await handleSelectRelease(caseId);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9] font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        user={user}
        onSwitchRole={() => setRoleModalOpen(true)}
        selectedReleaseId={selectedReleaseId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          hospitals={hospitals}
          selectedHospitalId={selectedHospitalId}
          onSelectHospital={setSelectedHospitalId}
          selectedRelease={selectedRelease}
          user={user}
          onSelectCase={handleSelectCase}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          <ErrorBoundary onReset={() => setCurrentPage("dashboard")}>
            {currentPage === "dashboard" && (
              <DashboardPage
                stats={dashboardStats}
                selectedHospitalId={selectedHospitalId}
                hospitals={hospitals}
                onSelectRelease={handleSelectRelease}
                onOpenDecision={handleOpenDecision}
                user={user}
              />
            )}

            {currentPage === "releases" && (
              <ReleasesPage
                hospitals={hospitals}
                selectedHospitalId={selectedHospitalId}
                onSelectRelease={handleSelectRelease}
                onOpenDecision={handleOpenDecision}
                user={user}
              />
            )}

            {currentPage === "release-detail" && (
              <ReleaseDetailPage
                releaseId={selectedReleaseId}
                onOpenDecision={handleOpenDecision}
                user={user}
                onBackToReleases={() => setCurrentPage("releases")}
              />
            )}

            {currentPage === "rules" && (
              <RiskRulesPage
                user={user}
                onSwitchRole={() => setRoleModalOpen(true)}
              />
            )}

            {(currentPage === "experiment" || (currentPage as string) === "analysis") && (
              <ExperimentPage />
            )}

            {currentPage === "decisions" && (
              <DecisionHistoryPage
                hospitals={hospitals}
                onSelectRelease={handleSelectRelease}
              />
            )}

            {currentPage === "validation" && <StakeholderValidationPage />}

            {currentPage === "docs" && <DocumentationPage onSelectCase={handleSelectCase} />}

            {/* Safe fallback for any unmatched route */}
            {!["dashboard", "releases", "release-detail", "rules", "experiment", "analysis", "decisions", "validation", "docs"].includes(currentPage) && (
              <DashboardPage
                stats={dashboardStats}
                selectedHospitalId={selectedHospitalId}
                hospitals={hospitals}
                onSelectRelease={handleSelectRelease}
                onOpenDecision={handleOpenDecision}
                user={user}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Decision Authorization & Safety Modal */}
      {decisionModalOpen && modalRelease && (
        <DecisionModal
          isOpen={decisionModalOpen}
          onClose={() => setDecisionModalOpen(false)}
          release={modalRelease}
          user={user}
          onSubmitDecision={handleSubmitDecision}
        />
      )}

      {/* Role Switch Modal (RBAC testing) */}
      <RoleSwitchModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        currentUser={user}
        onUserChanged={(newUser) => {
          setUser(newUser);
          showToast(`Active operator switched to: ${newUser.name} (${newUser.role})`);
        }}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed bottom-5 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
