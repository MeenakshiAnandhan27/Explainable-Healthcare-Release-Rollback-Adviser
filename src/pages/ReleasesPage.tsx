import React, { useState, useEffect } from "react";
import { Hospital, Release, UserSession } from "../types";
import { fetchReleases } from "../services/api";
import { Search, ChevronLeft, ChevronRight, Download, Layers } from "lucide-react";
import { ImpactBadge, RiskProgressBar } from "../components/RiskBadge";
import { AdvisoryBanner } from "../components/AdvisoryBanner";

interface ReleasesPageProps {
  hospitals: Hospital[];
  selectedHospitalId: string;
  onSelectRelease: (releaseId: string) => void;
  onOpenDecision: (release: Release) => void;
  user: UserSession;
}

export const ReleasesPage: React.FC<ReleasesPageProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectRelease,
  onOpenDecision,
  user
}) => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hospitalFilter, setHospitalFilter] = useState(selectedHospitalId || "ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const limit = 25;

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReleases({
        hospital_id: hospitalFilter !== "ALL" ? hospitalFilter : undefined,
        risk_level: riskFilter !== "ALL" ? riskFilter : undefined,
        search: searchQuery.trim() || undefined,
        limit,
        offset: page * limit
      });
      setReleases(data.items);
      setTotalCount(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load releases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hospitalFilter, riskFilter, searchQuery, page]);

  const handleExportCSV = () => {
    if (!releases.length) return;
    const headers = [
      "Release ID",
      "Hospital",
      "Application",
      "Version",
      "Type",
      "Risk Score",
      "Risk Level",
      "Recommendation",
      "Latency (ms)",
      "Latency Change (%)",
      "Error Rate (%)",
      "Tx Drop (%)",
      "Impact Level"
    ];
    const rows = releases.map((r) => [
      r.release_id,
      `"${r.hospital_name}"`,
      `"${r.application_name}"`,
      r.version,
      r.deployment_type,
      r.risk_score,
      r.risk_level,
      r.recommendation,
      r.latency_ms,
      r.latency_change_percent,
      r.error_rate_percent,
      r.transaction_drop_percent,
      r.customer_impact_level
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `releases_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="releases-page" className="space-y-5 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Hospital Deployments Surveillance Grid
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry and explainable risk scores across 5 partner hospital sites ({totalCount} total records)
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Table CSV</span>
          </button>
        </div>
      </div>

      <AdvisoryBanner compact />

      {/* Filter and Search Bar with Fixed Height & Crisp Alignment */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              id="release-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search release ID, app, version, engineer..."
              className="w-full text-xs pl-9 pr-3 h-9 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Hospital Filter */}
          <div>
            <select
              id="filter-hospital-select"
              value={hospitalFilter}
              aria-label="Filter releases by hospital"
              onChange={(e) => {
                setHospitalFilter(e.target.value);
                setPage(0);
              }}
              className="w-full text-xs px-3 h-9 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Partner Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.tier})
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              id="filter-risk-select"
              value={riskFilter}
              aria-label="Filter releases by risk level"
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(0);
              }}
              className="w-full text-xs px-3 h-9 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW Risk (Score 0–29)</option>
              <option value="MEDIUM">MEDIUM Risk (Score 30–59)</option>
              <option value="HIGH">HIGH Risk (Score 60–79)</option>
              <option value="CRITICAL">CRITICAL Risk (Score 80–100)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Table of Releases in Fixed Alignment Data Grid format */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            Loading deployment telemetry grid...
          </div>
        ) : releases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No release records match the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs text-slate-700 min-w-[1100px]">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap w-[140px]">Release ID</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[180px]">Hospital</th>
                  <th className="px-4 py-3 whitespace-nowrap min-w-[220px]">Application</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[110px]">Type</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[130px]">Latency</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[85px]">Errors</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[90px]">Tx Drop</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[120px]">Impact</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[130px]">Risk Score</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[110px]">Rec. Action</th>
                  <th className="px-4 py-3 whitespace-nowrap w-[160px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {releases.map((r) => (
                  <tr
                    key={r.release_id}
                    onClick={() => onSelectRelease(r.release_id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors border-b border-slate-100 group"
                  >
                    {/* Release ID: strict whitespace-nowrap, never hyphen break */}
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {r.release_id}
                    </td>

                    {/* Hospital: full name, whitespace-nowrap */}
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {r.hospital_name}
                    </td>

                    {/* Application & Version */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 whitespace-nowrap">{r.application_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{r.version}</div>
                    </td>

                    {/* Deployment Type */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 font-mono whitespace-nowrap">
                        {r.deployment_type}
                      </span>
                    </td>

                    {/* Latency: single line */}
                    <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                      <span>{r.latency_ms !== null ? `${r.latency_ms}ms` : "N/A"}</span>
                      {r.latency_change_percent !== null && (
                        <span className={`ml-1.5 font-bold ${r.latency_change_percent > 30 ? "text-red-600" : "text-slate-400"}`}>
                          ({r.latency_change_percent > 0 ? "+" : ""}{r.latency_change_percent}%)
                        </span>
                      )}
                    </td>

                    {/* Errors */}
                    <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                      {r.error_rate_percent !== null ? (
                        <span className={r.error_rate_percent > 5.0 ? "text-red-600 font-bold" : "text-slate-700 font-medium"}>
                          {r.error_rate_percent}%
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>

                    {/* Transaction Drop */}
                    <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                      {r.transaction_drop_percent !== null ? (
                        <span className={r.transaction_drop_percent > 10.0 ? "text-red-600 font-bold" : "text-slate-700 font-medium"}>
                          {r.transaction_drop_percent}%
                        </span>
                      ) : (
                        <span className="text-slate-700 font-medium">0%</span>
                      )}
                    </td>

                    {/* Impact Badge: single line, no wrap */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ImpactBadge level={r.customer_impact_level} />
                    </td>

                    {/* Risk Score */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RiskProgressBar score={r.risk_score} />
                    </td>

                    {/* Rec. Action */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.recommendation.includes("ROLLBACK") ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold tracking-tight uppercase whitespace-nowrap border border-red-200">
                          ROLLBACK
                        </span>
                      ) : r.recommendation.includes("CONTINUE") ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold tracking-tight uppercase whitespace-nowrap border border-green-200">
                          CONTINUE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold tracking-tight uppercase whitespace-nowrap border border-amber-200">
                          REVIEW
                        </span>
                      )}
                    </td>

                    {/* Actions: cleanly aligned, whitespace-nowrap */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRelease(r.release_id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                          title="View explainable evidence & metrics"
                        >
                          Evidence
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDecision(r);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                          title="Authorize or override release action"
                        >
                          Authorize
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar with Crisp Alignment */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-slate-500 whitespace-nowrap">
            Showing page <strong>{page + 1}</strong> of <strong>{Math.ceil(totalCount / limit) || 1}</strong> ({totalCount} total releases)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              disabled={(page + 1) * limit >= totalCount}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
