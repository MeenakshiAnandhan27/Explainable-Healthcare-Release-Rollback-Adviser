import React, { useState } from "react";
import {
  DashboardStats,
  Hospital,
  Release,
  UserSession
} from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";
import { RiskBadge, ImpactBadge, RiskProgressBar } from "../components/RiskBadge";
import { AdvisoryBanner } from "../components/AdvisoryBanner";
import { Download, SlidersHorizontal, ArrowRight, Eye, ShieldCheck, AlertTriangle } from "lucide-react";

interface DashboardPageProps {
  stats: DashboardStats | null;
  selectedHospitalId: string;
  hospitals: Hospital[];
  onSelectRelease: (releaseId: string) => void;
  onOpenDecision: (release: Release) => void;
  user: UserSession;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  selectedHospitalId,
  hospitals,
  onSelectRelease,
  onOpenDecision,
  user
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        Loading telemetry data grid...
      </div>
    );
  }

  // Currently highlighted release for the dark Advisory Detail sidecard
  const [highlightedId, setHighlightedId] = useState<string>(
    stats.recent_alerts?.[0]?.release_id || "REL-CASE-001"
  );
  const [overrideText, setOverrideText] = useState("");

  const highlightedRelease: Release | undefined =
    stats.recent_alerts?.find((r) => r.release_id === highlightedId) || stats.recent_alerts?.[0];

  const selectedHospitalObj = hospitals.find((h) => h.id === selectedHospitalId);

  // Chart data 1: Latency before vs after
  const latencyData = (stats.recent_alerts || []).map((r) => ({
    id: r.release_id,
    app: r.application_name.replace(" Service", "").replace(" Application", ""),
    Baseline: r.latency_baseline_ms || 300,
    PostRelease: r.latency_ms || 350
  }));

  // Chart data 2: Error rate before vs after
  const errorData = (stats.recent_alerts || []).map((r) => ({
    id: r.release_id,
    app: r.application_name.replace(" Service", "").replace(" Application", ""),
    Baseline: r.error_baseline_percent || 0.4,
    PostRelease: r.error_rate_percent || 1.2
  }));

  // Chart data 3: Transactions before vs after
  const transactionData = (stats.recent_alerts || []).map((r) => ({
    id: r.release_id,
    app: r.application_name.replace(" Service", "").replace(" Application", ""),
    Baseline: (r.baseline_transaction_count || 10000) / 1000,
    Current: (r.transaction_count || 9500) / 1000
  }));

  // Chart data 4: Customer impact distribution
  const impactData = [
    { name: "Low Impact", value: stats.customer_impact_distribution.LOW, color: "#3b82f6" },
    { name: "Medium Impact", value: stats.customer_impact_distribution.MEDIUM, color: "#f59e0b" },
    { name: "High Impact", value: stats.customer_impact_distribution.HIGH, color: "#f97316" },
    { name: "Critical Impact", value: stats.customer_impact_distribution.CRITICAL, color: "#ef4444" }
  ];

  // Chart data 5: Recommendations breakdown
  const recommendationData = [
    { name: "Continue Release", count: stats.continue_recommendations, color: "#10b981" },
    { name: "Human Review", count: stats.human_review_cases, color: "#f59e0b" },
    { name: "Rollback Recommended", count: stats.rollback_recommendations, color: "#ef4444" }
  ];

  // Chart data 6: Risk score sample
  const riskScoreData = (stats.recent_alerts || []).map((r, i) => ({
    release_id: r.release_id,
    index: i + 1,
    score: r.risk_score,
    level: r.risk_level
  }));

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!stats.recent_alerts) return;
    const headers = [
      "Release ID",
      "Hospital",
      "Application",
      "Version",
      "Risk Score",
      "Risk Level",
      "Recommendation",
      "Latency (ms)",
      "Error Rate (%)",
      "Customer Impact"
    ];
    const rows = stats.recent_alerts.map((r) => [
      r.release_id,
      `"${r.hospital_name}"`,
      `"${r.application_name}"`,
      r.version,
      r.risk_score,
      r.risk_level,
      r.recommendation,
      r.latency_ms,
      r.error_rate_percent,
      r.customer_impact_level
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetry_signals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="dashboard-page" className="space-y-6 pb-12">
      {/* Top Banner & Context */}
      <AdvisoryBanner />

      {/* 4-Column Metric Grid matching Technical Dashboard Design Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Releases */}
        <div id="metric-card-total" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Releases
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats.total_deployments}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across {selectedHospitalObj ? selectedHospitalObj.name : "5 Hospital Sites"}
          </div>
        </div>

        {/* High Risk (Action Required) */}
        <div id="metric-card-high-risk" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-red-500">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            High Risk (Score ≥ 60)
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {stats.high_risk_releases.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] text-red-500 mt-1 font-medium">
            Action Required • Rollback Recommended
          </div>
        </div>

        {/* Human Review (Pending Analysis) */}
        <div id="metric-card-reviews" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Human Review (Score 30–59)
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {stats.human_review_cases.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Pending Analysis • Warmup or Mismatch
          </div>
        </div>

        {/* Avg Decision Time */}
        <div id="metric-card-avg-time" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Avg. Decision Time
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats.average_decision_time_min}m
          </div>
          <div className="text-[10px] text-green-600 font-semibold mt-1">
            -91.1% from Manual Baseline (48.5m)
          </div>
        </div>
      </div>

      {/* Primary Data Grid & Dark Advisory Detail Sidecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Deployment Signals Data Grid */}
        <section className="lg:col-span-7 xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Recent Deployment Signals (Synthetic)</h2>
              <p className="text-[11px] text-slate-400">Click any row to inspect live evidence & logic</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 sticky top-0 border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Hospital</th>
                  <th className="px-4 py-3 whitespace-nowrap">Service</th>
                  <th className="px-4 py-3 whitespace-nowrap">Risk Score</th>
                  <th className="px-4 py-3 whitespace-nowrap">Rec. Action</th>
                  <th className="px-4 py-3 whitespace-nowrap">Impact</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {(stats.recent_alerts || []).map((r) => {
                  const isSelected = r.release_id === highlightedRelease?.release_id;
                  return (
                    <tr
                      key={r.release_id}
                      onClick={() => setHighlightedId(r.release_id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/50 border-l-3 border-l-blue-500"
                          : "hover:bg-blue-50/30"
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900 whitespace-nowrap">{r.hospital_name}</div>
                        <div className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{r.release_id}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-800 font-semibold whitespace-nowrap">{r.application_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{r.version}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <RiskProgressBar score={r.risk_score} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.recommendation.includes("ROLLBACK") ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold tracking-tight uppercase whitespace-nowrap border border-red-200">
                            ROLLBACK
                          </span>
                        ) : r.recommendation.includes("CONTINUE") ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold tracking-tight uppercase whitespace-nowrap border border-green-200">
                            CONTINUE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold tracking-tight uppercase whitespace-nowrap border border-amber-200">
                            REVIEW
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ImpactBadge level={r.customer_impact_level} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRelease(r.release_id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Dark Advisory Detail Sidecard matching Design HTML */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          {highlightedRelease ? (
            <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col shadow-xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Advisory Detail
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({highlightedRelease.release_id})
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    highlightedRelease.risk_score >= 60
                      ? "bg-red-600 text-white"
                      : highlightedRelease.risk_score >= 30
                      ? "bg-amber-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {highlightedRelease.risk_level} RISK
                </span>
              </div>

              {/* Score & Recommendation Banner */}
              <div className="flex flex-col gap-1 mb-5">
                <span
                  className={`text-4xl font-mono font-bold ${
                    highlightedRelease.risk_score >= 60
                      ? "text-red-400"
                      : highlightedRelease.risk_score >= 30
                      ? "text-amber-400"
                      : "text-green-400"
                  }`}
                >
                  {highlightedRelease.risk_score}/100
                </span>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  Recommendation:{" "}
                  <strong
                    className={
                      highlightedRelease.recommendation.includes("ROLLBACK")
                        ? "text-red-400"
                        : highlightedRelease.recommendation.includes("CONTINUE")
                        ? "text-green-400"
                        : "text-amber-400"
                    }
                  >
                    {highlightedRelease.recommendation}
                  </strong>
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {highlightedRelease.hospital_name} • {highlightedRelease.application_name} ({highlightedRelease.version})
                </p>
              </div>

              {/* Evidence Breakdown Grid matching Design HTML */}
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                    Evidence Breakdown
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800 p-2.5 rounded border border-slate-700/60">
                      <div className="text-[10px] text-slate-400">Error Rate</div>
                      <div className="text-sm font-mono text-red-400 font-bold">
                        {highlightedRelease.error_rate_percent}%{" "}
                        <span className="text-[10px] opacity-75 font-normal">
                          ({highlightedRelease.error_change && highlightedRelease.error_change > 0 ? "+" : ""}
                          {highlightedRelease.error_change}%)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-2.5 rounded border border-slate-700/60">
                      <div className="text-[10px] text-slate-400">Latency</div>
                      <div className="text-sm font-mono text-amber-400 font-bold">
                        {highlightedRelease.latency_ms}ms{" "}
                        <span className="text-[10px] opacity-75 font-normal">
                          ({highlightedRelease.latency_change_percent && highlightedRelease.latency_change_percent > 0 ? "+" : ""}
                          {highlightedRelease.latency_change_percent}%)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-2.5 rounded border border-slate-700/60">
                      <div className="text-[10px] text-slate-400">TX Drop</div>
                      <div className="text-sm font-mono text-slate-200 font-bold">
                        {highlightedRelease.transaction_drop_percent}%{" "}
                        <span className="text-[10px] opacity-75 text-red-400 font-normal">
                          ({highlightedRelease.transaction_count?.toLocaleString()} ops)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-2.5 rounded border border-slate-700/60">
                      <div className="text-[10px] text-slate-400">Impact</div>
                      <div className="text-sm font-mono text-white font-bold">
                        {highlightedRelease.customer_impact_level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Triggered Logic Rules matching Design HTML */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                    Triggered Logic
                  </div>
                  <ul className="text-xs space-y-1.5 bg-slate-800/80 p-2.5 rounded border border-slate-700/60">
                    {highlightedRelease.triggered_rules && highlightedRelease.triggered_rules.length > 0 ? (
                      highlightedRelease.triggered_rules.map((tr, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-200">
                          <span
                            className={`text-xs ${
                              tr.weight >= 30 ? "text-red-500" : "text-amber-500"
                            }`}
                          >
                            ●
                          </span>
                          <span className="text-[11px] leading-tight">
                            <strong>{tr.rule_id}</strong>: {tr.name} (+{tr.weight} pts)
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[11px] text-slate-400 italic">
                        No critical threshold violations detected. Normal release operations.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Buttons matching Design HTML */}
              <div className="pt-5 mt-auto flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="dash-confirm-rollback-btn"
                    onClick={() => onOpenDecision(highlightedRelease)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-900/20 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Authorize</span>
                  </button>
                  <button
                    id="dash-inspect-evidence-btn"
                    onClick={() => onSelectRelease(highlightedRelease.release_id)}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-2 rounded text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {/* Recharts Telemetry Grid (6 Charts) with Modern Data Grid Card Styling */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Telemetry Analytics & Service Signal Grids
            </h3>
            <p className="text-xs text-slate-500">Cross-hospital latency, error rates, transactions, and risk distributions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Chart 1: Latency Before vs After */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Latency (ms): Baseline vs Post-Release
                </h4>
                <p className="text-[11px] text-slate-400">Response delay SLA monitoring</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="app" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} unit="ms" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Baseline" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="PostRelease" fill="#0284c7" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Error Rate Before vs After */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Error Rate (%): Baseline vs Post-Release
                </h4>
                <p className="text-[11px] text-slate-400">5xx fault rate comparison</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="app" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Baseline" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="PostRelease" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Transactions Before vs After */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Transactions (k): Baseline vs Post-Release
                </h4>
                <p className="text-[11px] text-slate-400">Throughput volume tracking</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="app" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} unit="k" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Baseline" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Current" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Customer Impact Distribution */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  4. Customer Impact Distribution
                </h4>
                <p className="text-[11px] text-slate-400">Clinical workflow severity breakdown</p>
              </div>
            </div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={impactData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {impactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Risk Score Distribution */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  5. Risk Score Distribution
                </h4>
                <p className="text-[11px] text-slate-400">Quantified risk index (0–100)</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="release_id" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="score" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Rollback vs Continue Recommendations */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  6. Recommendation Breakdown
                </h4>
                <p className="text-[11px] text-slate-400">Adviser recommendation spread</p>
              </div>
            </div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recommendationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {recommendationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
