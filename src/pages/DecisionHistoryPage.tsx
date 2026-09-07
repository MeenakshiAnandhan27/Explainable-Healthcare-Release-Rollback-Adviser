import React, { useState, useEffect } from "react";
import { DecisionRecord, Hospital } from "../types";
import { fetchDecisions } from "../services/api";
import {
  History,
  Download,
  Search,
  RefreshCw
} from "lucide-react";
import { AdvisoryBanner } from "../components/AdvisoryBanner";

interface DecisionHistoryPageProps {
  hospitals: Hospital[];
  onSelectRelease: (releaseId: string) => void;
}

export const DecisionHistoryPage: React.FC<DecisionHistoryPageProps> = ({
  hospitals,
  onSelectRelease
}) => {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterHospital, setFilterHospital] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterDecision, setFilterDecision] = useState("ALL");
  const [filterOverrideOnly, setFilterOverrideOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDecisions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDecisions({
        hospital: filterHospital !== "ALL" ? filterHospital : undefined,
        role: filterRole !== "ALL" ? filterRole : undefined,
        decision: filterDecision !== "ALL" ? filterDecision : undefined
      });
      setDecisions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load decisions audit trail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, [filterHospital, filterRole, filterDecision]);

  const filteredDecisions = decisions.filter((d) => {
    if (filterOverrideOnly && !d.is_override) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        d.release_id.toLowerCase().includes(q) ||
        d.hospital_name.toLowerCase().includes(q) ||
        d.application_name.toLowerCase().includes(q) ||
        d.decision_maker.toLowerCase().includes(q) ||
        (d.override_reason || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = [
      "ID",
      "Timestamp",
      "Release ID",
      "Hospital",
      "Application",
      "Adviser Recommendation",
      "Final Decision",
      "Is Override",
      "Override Reason",
      "Decision Maker",
      "Role",
      "Risk Score",
      "Triggered Rules"
    ];
    const rows = filteredDecisions.map((d) => [
      d.id,
      d.timestamp,
      d.release_id,
      `"${d.hospital_name}"`,
      `"${d.application_name}"`,
      `"${d.recommendation}"`,
      d.final_decision,
      d.is_override ? "YES" : "NO",
      `"${(d.override_reason || "").replace(/"/g, '""')}"`,
      `"${d.decision_maker}"`,
      `"${d.role}"`,
      d.risk_score,
      `"${(d.triggered_rules_summary || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rollback_adviser_decisions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="decision-history-page" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Decision History & Human Override Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of human confirmations, operational authorizations, and justification logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDecisions}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Audit CSV
          </button>
        </div>
      </div>

      <AdvisoryBanner compact />

      {/* Filters Bar matching Technical Dashboard */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, app, reason, operator..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Hospital Filter */}
          <div>
            <select
              value={filterHospital}
              onChange={(e) => setFilterHospital(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Partner Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Authorized Roles</option>
              <option value="SOC / Operations Analyst">SOC / Operations Analyst</option>
              <option value="Release Manager">Release Manager</option>
            </select>
          </div>

          {/* Decision Filter */}
          <div>
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Decision Outcomes</option>
              <option value="ROLLBACK">ROLLBACK Action</option>
              <option value="CONTINUE">CONTINUE Action</option>
              <option value="SEND FOR REVIEW">HOLD FOR REVIEW</option>
            </select>
          </div>
        </div>

        {/* Override Toggle Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="filter-override-check"
            checked={filterOverrideOnly}
            onChange={(e) => setFilterOverrideOnly(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="filter-override-check" className="text-xs text-slate-700 cursor-pointer font-medium">
            Show only Human Overrides (Cases where engineer determination diverged from adviser recommendation)
          </label>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Audit Log Table in Technical Data Grid format */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Audit Entries ({filteredDecisions.length} recorded)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently captures signing operator, justification reasoning, and system recommendations
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            Loading decision audit records...
          </div>
        ) : filteredDecisions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No audit records found matching the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[980px]">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap w-[90px]">Audit ID</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[140px]">Timestamp</th>
                  <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Release</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[150px]">Adviser Rec</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[120px]">Human Decision</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[110px]">Override Status</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[160px]">Audited Operator</th>
                  <th className="px-4 py-3 min-w-[200px]">Override Justification</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[90px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDecisions.map((d) => (
                  <tr key={d.id} className="hover:bg-blue-50/40 transition-colors border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      #{d.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(d.timestamp).toLocaleDateString()} {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-600 whitespace-nowrap">{d.release_id}</div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap">{d.application_name} • {d.hospital_name}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[11px] whitespace-nowrap">
                      <span className={
                        d.recommendation.includes("ROLLBACK")
                          ? "text-red-700 font-bold"
                          : d.recommendation.includes("CONTINUE")
                          ? "text-green-700 font-bold"
                          : "text-amber-700 font-bold"
                      }>
                        {d.recommendation}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                        d.final_decision === "ROLLBACK"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : d.final_decision === "CONTINUE"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}>
                        {d.final_decision}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {d.is_override ? (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                          OVERRIDE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-bold whitespace-nowrap border border-slate-200">
                          CONCURRED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 whitespace-nowrap">{d.decision_maker}</div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap">{d.role}</div>
                    </td>
                    <td className="px-4 py-3">
                      {d.override_reason ? (
                        <div className="text-[11px] text-slate-700 italic bg-amber-50/70 p-1.5 rounded border border-amber-200/60 leading-snug">
                          "{d.override_reason}"
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectRelease(d.release_id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
