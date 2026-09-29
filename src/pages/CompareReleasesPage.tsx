import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Zap,
  Clock,
  Layers,
  CheckCircle2,
  Sliders,
  ChevronDown
} from "lucide-react";
import { Release, Hospital } from "../types";
import { fetchReleases, fetchReleaseDetail } from "../services/api";
import { RiskBadge } from "../components/RiskBadge";

interface CompareReleasesPageProps {
  hospitals: Hospital[];
  onOpenDecision: (release: Release) => void;
  user: any;
}

export const CompareReleasesPage: React.FC<CompareReleasesPageProps> = ({
  hospitals,
  onOpenDecision,
  user
}) => {
  const [releaseList, setReleaseList] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected release IDs
  const [releaseIdA, setReleaseIdA] = useState<string>("REL-CASE-001");
  const [releaseIdB, setReleaseIdB] = useState<string>("REL-CASE-003");

  const [releaseA, setReleaseA] = useState<Release | null>(null);
  const [releaseB, setReleaseB] = useState<Release | null>(null);

  useEffect(() => {
    fetchReleases({ limit: 100 })
      .then((res) => {
        setReleaseList(res.items);
      })
      .catch((err) => console.error("Error loading release list:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (releaseIdA) {
      fetchReleaseDetail(releaseIdA).then(setReleaseA).catch(console.error);
    }
  }, [releaseIdA]);

  useEffect(() => {
    if (releaseIdB) {
      fetchReleaseDetail(releaseIdB).then(setReleaseB).catch(console.error);
    }
  }, [releaseIdB]);

  // Delta helpers
  const getNumDelta = (valA: number | null | undefined, valB: number | null | undefined, unit = "") => {
    if (valA === null || valA === undefined || valB === null || valB === undefined) {
      return { diffText: "N/A", higher: null };
    }
    const diff = Number((valB - valA).toFixed(2));
    if (diff === 0) return { diffText: "Identical", higher: null };
    const sign = diff > 0 ? "+" : "";
    return {
      diffText: `${sign}${diff}${unit}`,
      higher: diff > 0 ? "B" : "A",
      absDiff: Math.abs(diff)
    };
  };

  const riskScoreDelta = getNumDelta(releaseA?.risk_score, releaseB?.risk_score, " pts");
  const latencyDelta = getNumDelta(releaseA?.latency_change_percent, releaseB?.latency_change_percent, "%");
  const errorDelta = getNumDelta(releaseA?.error_rate_percent, releaseB?.error_rate_percent, "%");
  const txDropDelta = getNumDelta(releaseA?.transaction_drop_percent, releaseB?.transaction_drop_percent, "%");

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 mb-2">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Release Comparison (Phase 2 Requirement)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Side-by-Side Release Comparison</h1>
            <p className="text-slate-600 text-sm max-w-3xl mt-1">
              Select two software deployments across hospitals to inspect telemetry differences, customer impact levels, triggered rules, and advisory recommendations numerically and visually.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setReleaseIdA("REL-CASE-001");
                setReleaseIdB("REL-CASE-003");
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Case 1 vs Case 3
            </button>
            <button
              onClick={() => {
                setReleaseIdA("REL-CASE-002");
                setReleaseIdB("REL-EDGE-005");
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Case 2 vs Edge 5
            </button>
          </div>
        </div>
      </div>

      {/* Dual Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Release A Selector */}
        <div className="bg-white rounded-xl border-2 border-indigo-200 p-5 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
            Release A (Baseline Comparison)
          </label>
          <select
            value={releaseIdA}
            onChange={(e) => setReleaseIdA(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {releaseList.map((r) => (
              <option key={r.release_id} value={r.release_id}>
                {r.release_id} — {r.application_name} ({r.version}) | {r.hospital_name} [{r.risk_level}]
              </option>
            ))}
          </select>
        </div>

        {/* Release B Selector */}
        <div className="bg-white rounded-xl border-2 border-purple-200 p-5 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
            Release B (Evaluation Target)
          </label>
          <select
            value={releaseIdB}
            onChange={(e) => setReleaseIdB(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            {releaseList.map((r) => (
              <option key={r.release_id} value={r.release_id}>
                {r.release_id} — {r.application_name} ({r.version}) | {r.hospital_name} [{r.risk_level}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Card */}
      {releaseA && releaseB && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Summary Comparison Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/70 border-b border-slate-200">
            {/* Release A Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  {releaseA.release_id}
                </span>
                <RiskBadge level={releaseA.risk_level} score={releaseA.risk_score} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{releaseA.application_name}</h2>
              <div className="text-xs text-slate-500 mt-1">
                Version: <span className="font-mono text-slate-800 font-semibold">{releaseA.version}</span> | Hospital: <span className="text-slate-800 font-medium">{releaseA.hospital_name}</span>
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-600 block mb-1">Recommendation:</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded inline-block ${
                  releaseA.recommendation.includes("ROLLBACK")
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : releaseA.recommendation.includes("REVIEW")
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}>
                  {releaseA.recommendation}
                </span>
              </div>
            </div>

            {/* Release B Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {releaseB.release_id}
                </span>
                <RiskBadge level={releaseB.risk_level} score={releaseB.risk_score} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{releaseB.application_name}</h2>
              <div className="text-xs text-slate-500 mt-1">
                Version: <span className="font-mono text-slate-800 font-semibold">{releaseB.version}</span> | Hospital: <span className="text-slate-800 font-medium">{releaseB.hospital_name}</span>
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-600 block mb-1">Recommendation:</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded inline-block ${
                  releaseB.recommendation.includes("ROLLBACK")
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : releaseB.recommendation.includes("REVIEW")
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}>
                  {releaseB.recommendation}
                </span>
              </div>
            </div>
          </div>

          {/* Numeric Diffs Table */}
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Telemetry & Signal Delta Comparison
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Metric Signal</th>
                    <th className="py-2.5 px-4 bg-indigo-50/50 text-indigo-950">Release A ({releaseA.release_id})</th>
                    <th className="py-2.5 px-4 bg-purple-50/50 text-purple-950">Release B ({releaseB.release_id})</th>
                    <th className="py-2.5 px-4 text-slate-900">Numerical Delta (B vs A)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                  {/* Risk Score */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Risk Score (0-100)</td>
                    <td className="py-3 px-4 bg-indigo-50/20 font-bold">{releaseA.risk_score} pts</td>
                    <td className="py-3 px-4 bg-purple-50/20 font-bold">{releaseB.risk_score} pts</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        riskScoreDelta.diffText.startsWith("+")
                          ? "bg-rose-100 text-rose-800"
                          : riskScoreDelta.diffText.startsWith("-")
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {riskScoreDelta.diffText}
                      </span>
                    </td>
                  </tr>

                  {/* Latency Degradation */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">P95 Latency Change</td>
                    <td className="py-3 px-4 bg-indigo-50/20">{releaseA.latency_change_percent}% ({releaseA.latency_ms}ms)</td>
                    <td className="py-3 px-4 bg-purple-50/20">{releaseB.latency_change_percent}% ({releaseB.latency_ms}ms)</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        latencyDelta.diffText.startsWith("+")
                          ? "bg-amber-100 text-amber-800"
                          : latencyDelta.diffText.startsWith("-")
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {latencyDelta.diffText}
                      </span>
                    </td>
                  </tr>

                  {/* Error Rate */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">HTTP Error Rate</td>
                    <td className="py-3 px-4 bg-indigo-50/20">{releaseA.error_rate_percent}%</td>
                    <td className="py-3 px-4 bg-purple-50/20">{releaseB.error_rate_percent}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        errorDelta.diffText.startsWith("+")
                          ? "bg-rose-100 text-rose-800"
                          : errorDelta.diffText.startsWith("-")
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {errorDelta.diffText}
                      </span>
                    </td>
                  </tr>

                  {/* Transaction Drop */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Transaction Drop %</td>
                    <td className="py-3 px-4 bg-indigo-50/20">{releaseA.transaction_drop_percent}% ({releaseA.transaction_count} tx)</td>
                    <td className="py-3 px-4 bg-purple-50/20">{releaseB.transaction_drop_percent}% ({releaseB.transaction_count} tx)</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        txDropDelta.diffText.startsWith("+")
                          ? "bg-rose-100 text-rose-800"
                          : txDropDelta.diffText.startsWith("-")
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {txDropDelta.diffText}
                      </span>
                    </td>
                  </tr>

                  {/* Customer Impact Level */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Customer Impact</td>
                    <td className="py-3 px-4 bg-indigo-50/20 font-sans font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        releaseA.customer_impact_level === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : releaseA.customer_impact_level === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {releaseA.customer_impact_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 bg-purple-50/20 font-sans font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        releaseB.customer_impact_level === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : releaseB.customer_impact_level === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {releaseB.customer_impact_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">
                      {releaseA.customer_impact_level === releaseB.customer_impact_level
                        ? "Identical impact severity"
                        : `${releaseB.customer_impact_level} vs ${releaseA.customer_impact_level}`}
                    </td>
                  </tr>

                  {/* Availability */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Service Availability</td>
                    <td className="py-3 px-4 bg-indigo-50/20">{releaseA.service_availability_percent}%</td>
                    <td className="py-3 px-4 bg-purple-50/20">{releaseB.service_availability_percent}%</td>
                    <td className="py-3 px-4">
                      {getNumDelta(releaseA.service_availability_percent, releaseB.service_availability_percent, "%").diffText}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Triggered Rules Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
              {/* Release A Rules */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Rules Triggered on Release A ({releaseA.triggered_rules?.length || 0})</span>
                </h4>
                {releaseA.triggered_rules && releaseA.triggered_rules.length > 0 ? (
                  <div className="space-y-2">
                    {releaseA.triggered_rules.map((r, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{r.name} ({r.rule_id})</span>
                          <span className="text-indigo-600 font-bold font-mono">+{r.weight} pts</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Value: {String(r.value)} | Threshold: {String(r.threshold)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No risk rules triggered.</p>
                )}
              </div>

              {/* Release B Rules */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  <span>Rules Triggered on Release B ({releaseB.triggered_rules?.length || 0})</span>
                </h4>
                {releaseB.triggered_rules && releaseB.triggered_rules.length > 0 ? (
                  <div className="space-y-2">
                    {releaseB.triggered_rules.map((r, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{r.name} ({r.rule_id})</span>
                          <span className="text-purple-600 font-bold font-mono">+{r.weight} pts</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Value: {String(r.value)} | Threshold: {String(r.threshold)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No risk rules triggered.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
