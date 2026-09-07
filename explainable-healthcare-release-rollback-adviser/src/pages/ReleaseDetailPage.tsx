import React, { useState, useEffect } from "react";
import { Release, UserSession } from "../types";
import { fetchReleaseDetail } from "../services/api";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Info,
  Layers,
  Server,
  Activity,
  Check,
  TrendingDown,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { RiskBadge, ImpactBadge, RiskProgressBar } from "../components/RiskBadge";
import { AdvisoryBanner } from "../components/AdvisoryBanner";

interface ReleaseDetailPageProps {
  releaseId: string;
  onOpenDecision: (release: Release) => void;
  user: UserSession;
  onBackToReleases: () => void;
}

export const ReleaseDetailPage: React.FC<ReleaseDetailPageProps> = ({
  releaseId,
  onOpenDecision,
  user,
  onBackToReleases
}) => {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReleaseDetail(releaseId);
      setRelease(data);
    } catch (err: any) {
      setError(err.message || `Failed to load release ${releaseId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (releaseId) {
      loadDetail();
    }
  }, [releaseId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        Retrieving release telemetry and compiling explainable evidence...
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
          {error || `Release ${releaseId} could not be retrieved.`}
        </div>
        <button
          onClick={onBackToReleases}
          className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-700"
        >
          Return to Releases List
        </button>
      </div>
    );
  }

  const rec = release.recommendation || "";
  const isRollback = rec.includes("ROLLBACK");
  const isContinue = rec.includes("CONTINUE");

  return (
    <div id="release-detail-page" className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button
              onClick={onBackToReleases}
              className="hover:text-blue-600 underline cursor-pointer"
            >
              Hospital Releases
            </button>
            <span>/</span>
            <span className="font-mono text-slate-800 font-semibold">{release.release_id}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>{release.application_name}</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              {release.version}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              (Previous: {release.previous_version || "None"})
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hospital Site: <strong>{release.hospital_name}</strong> ({release.hospital_id})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="detail-action-decide-btn"
            onClick={() => onOpenDecision(release)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Authorize / Record Decision
          </button>
        </div>
      </div>

      <AdvisoryBanner />

      {/* Failure Case Special Callout */}
      {release.case_tag && (
        <div className="p-3.5 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl text-xs text-blue-950 space-y-1">
          <div className="font-semibold text-blue-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Benchmark Evaluation Scenario: {release.case_tag}</span>
          </div>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            {release.notes}
          </p>
        </div>
      )}

      {/* Recommendation & Explainability Hero Card matching Technical Dashboard */}
      <div
        id="recommendation-hero-card"
        className={`p-5 rounded-xl border shadow-xs ${
          isRollback
            ? "bg-red-50/70 border-red-200"
            : isContinue
            ? "bg-green-50/70 border-green-200"
            : "bg-amber-50/70 border-amber-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Adviser Recommendation & Quantified Risk Score
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xl font-extrabold tracking-tight ${
                  isRollback ? "text-red-700" : isContinue ? "text-green-700" : "text-amber-700"
                }`}
              >
                {release.recommendation}
              </span>
              <RiskBadge level={release.risk_level} score={release.risk_score} size="lg" />
            </div>
            <p className="text-xs text-slate-700 mt-2 max-w-3xl leading-relaxed">
              {release.explanation?.summary || "Deterministic risk assessment completed against configured hospital release rules."}
            </p>
          </div>

          {/* Quick Decision Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="hero-btn-confirm-rollback"
              onClick={() => onOpenDecision(release)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              CONFIRM ROLLBACK
            </button>
            <button
              id="hero-btn-continue-release"
              onClick={() => onOpenDecision(release)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              CONTINUE RELEASE
            </button>
            <button
              id="hero-btn-send-review"
              onClick={() => onOpenDecision(release)}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              SEND FOR REVIEW
            </button>
          </div>
        </div>

        {/* Triggered Rules Checklist */}
        <div className="mt-4 pt-3 border-t border-slate-200/60">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Triggered Logic Rules ({release.triggered_rules?.length || 0})
          </div>
          {release.triggered_rules && release.triggered_rules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {release.triggered_rules.map((tr) => (
                <div
                  key={tr.rule_id}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-start gap-2 shadow-2xs"
                >
                  <span className="text-red-600 font-bold mt-0.5">✓</span>
                  <div>
                    <div className="font-semibold text-slate-800">
                      Rule {tr.rule_id}: {tr.name} (+{tr.weight} Risk Points)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {tr.description} (Observed: <strong>{String(tr.value)}</strong> | Threshold: <strong>{String(tr.threshold)}</strong>)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-green-700 italic bg-white p-2.5 rounded-lg border border-green-200">
              ✓ No risk thresholds violated. All signals remain within normal operational safety parameters.
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Grid: Technical Signals vs Business Impact Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Technical Signals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                Technical Service Signals
              </h3>
              <p className="text-[11px] text-slate-500">Latency, error rates, and system availability telemetry</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-mono rounded">
              Telemetry Sensor
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Latency */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Latency
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {release.latency_ms !== null ? `${release.latency_ms}ms` : "N/A"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Baseline: {release.latency_baseline_ms !== null ? `${release.latency_baseline_ms}ms` : "N/A"}
              </div>
              {release.latency_change_percent !== null && (
                <div
                  className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    release.latency_change_percent > 30 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {release.latency_change_percent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{release.latency_change_percent > 0 ? "+" : ""}{release.latency_change_percent}% change</span>
                </div>
              )}
            </div>

            {/* Error Rate */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Error Rate
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {release.error_rate_percent !== null ? `${release.error_rate_percent}%` : "N/A"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Baseline: {release.error_baseline_percent !== null ? `${release.error_baseline_percent}%` : "N/A"}
              </div>
              {release.error_change !== null && (
                <div
                  className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    (release.error_rate_percent || 0) > 5 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  <span>Δ: {release.error_change > 0 ? "+" : ""}{release.error_change}% pts</span>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Availability
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {release.service_availability_percent !== null ? `${release.service_availability_percent}%` : "N/A"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                SLA: 99.9%
              </div>
              {release.availability_change !== null && (
                <div
                  className={`text-[11px] font-semibold mt-1 ${
                    (release.service_availability_percent || 100) < 99.0 ? "text-red-600 font-bold" : "text-green-600"
                  }`}
                >
                  <span>{release.availability_change >= 0 ? "+" : ""}{release.availability_change}% SLA</span>
                </div>
              )}
            </div>
          </div>

          {/* Technical Telemetry Note */}
          <div className="p-3 bg-slate-50 text-[11px] text-slate-600 rounded-lg border border-slate-200 leading-relaxed">
            <strong>Technical Assessment: </strong>
            {(release.latency_change_percent || 0) > 30
              ? "Significant latency degradation observed exceeding 30% tolerance threshold."
              : "Latency degradation remains within expected buffer boundaries."}{" "}
            {(release.error_rate_percent || 0) > 5.0
              ? "Error rate exceeds 5% critical fault barrier."
              : "Error rates comply with standard production envelopes."}
          </div>
        </div>

        {/* Business Impact Signals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Business & Clinical Impact Signals
              </h3>
              <p className="text-[11px] text-slate-500">Transaction counts, workflow disruption, and care impact</p>
            </div>
            <ImpactBadge level={release.customer_impact_level} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Transactions */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Transactions
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {release.transaction_count !== null ? release.transaction_count.toLocaleString() : "N/A"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Baseline: {release.baseline_transaction_count ? release.baseline_transaction_count.toLocaleString() : "N/A"}
              </div>
              {release.transaction_drop_percent !== null && (
                <div
                  className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    release.transaction_drop_percent > 10 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  <span>Drop: {release.transaction_drop_percent}%</span>
                </div>
              )}
            </div>

            {/* Affected Hospitals */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Affected Sites
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {release.affected_hospitals_count || 1}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Hospital deployments
              </div>
              <div className="text-[11px] text-slate-600 mt-1 truncate">
                {release.hospital_name.split(" ")[0]}
              </div>
            </div>

            {/* Affected Workflows Count */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Impacted Workflows
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {release.affected_workflows_count || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Clinical pathways
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                {release.customer_impact_level}
              </div>
            </div>
          </div>

          {/* Affected Workflows Badges */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Assessed Clinical Workflows
            </div>
            {release.affected_workflows && release.affected_workflows.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {release.affected_workflows.map((wf) => (
                  <span
                    key={wf}
                    className="text-[11px] px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold"
                  >
                    ⚠ {wf}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                No active disruptions registered across medication ordering, patient registration, or clinical documentation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evidence & "Why this recommendation was made" Narrative */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Why this recommendation was made
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Human-readable deterministic explanation showing exact evidence criteria
          </p>
        </div>

        {/* Narrative Points */}
        <div className="space-y-2">
          {release.explanation?.narrative_points?.map((pt, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{pt}</span>
            </div>
          ))}
        </div>

        {/* Warnings & Edge Cases */}
        {release.explanation?.warnings && release.explanation.warnings.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              Telemetry Sensors & Data Integrity Notes
            </div>
            {release.explanation.warnings.map((w, i) => (
              <p key={i} className="text-[11px] text-amber-800">
                • {w}
              </p>
            ))}
          </div>
        )}

        {/* Structured Evidence Table */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Structured Evidence Breakdown
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Telemetry Signal</th>
                  <th className="px-4 py-2.5">Observed Value</th>
                  <th className="px-4 py-2.5">Historical Baseline</th>
                  <th className="px-4 py-2.5">Configured Threshold</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">Error Rate</td>
                  <td className="px-4 py-3 font-mono">{release.explanation?.evidence?.error_rate?.value ?? (release.error_rate_percent !== null ? `${release.error_rate_percent}%` : "N/A")}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{release.explanation?.evidence?.error_rate?.baseline ?? (release.error_baseline_percent !== null ? `${release.error_baseline_percent}%` : "N/A")}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">&gt; 5.0% (Rule R1)</td>
                  <td className="px-4 py-3">
                    {(release.error_rate_percent || 0) > 5.0 ? (
                      <span className="text-red-600 font-bold">VIOLATED (+25 pts)</span>
                    ) : (
                      <span className="text-green-600 font-semibold">PASS</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">Latency Degradation</td>
                  <td className="px-4 py-3 font-mono">{release.explanation?.evidence?.latency?.value ?? (release.latency_ms !== null ? `${release.latency_ms}ms` : "N/A")} {release.explanation?.evidence?.latency?.change ? `(${release.explanation.evidence.latency.change})` : ""}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{release.explanation?.evidence?.latency?.baseline ?? (release.latency_baseline_ms !== null ? `${release.latency_baseline_ms}ms` : "N/A")}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">&gt; 30.0% (Rule R2)</td>
                  <td className="px-4 py-3">
                    {(release.latency_change_percent || 0) > 30.0 ? (
                      <span className="text-red-600 font-bold">VIOLATED (+20 pts)</span>
                    ) : (
                      <span className="text-green-600 font-semibold">PASS</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">Transaction Throughput</td>
                  <td className="px-4 py-3 font-mono">{release.explanation?.evidence?.transactions?.value ?? (release.transaction_count !== null ? String(release.transaction_count) : "N/A")} {release.explanation?.evidence?.transactions?.drop ? `(Drop: ${release.explanation.evidence.transactions.drop})` : ""}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{release.explanation?.evidence?.transactions?.baseline ?? (release.baseline_transaction_count !== null ? String(release.baseline_transaction_count) : "N/A")}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">Drop &gt; 10.0% (Rule R3)</td>
                  <td className="px-4 py-3">
                    {(release.transaction_drop_percent || 0) > 10.0 ? (
                      <span className="text-red-600 font-bold">VIOLATED (+20 pts)</span>
                    ) : (
                      <span className="text-green-600 font-semibold">PASS</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">Customer Impact</td>
                  <td className="px-4 py-3 font-mono">{release.customer_impact_level}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">LOW (Standard)</td>
                  <td className="px-4 py-3 font-mono text-slate-500">HIGH (+20) / CRITICAL (+30)</td>
                  <td className="px-4 py-3">
                    {release.customer_impact_level === "CRITICAL" ? (
                      <span className="text-red-600 font-bold">CRITICAL (+30 pts)</span>
                    ) : release.customer_impact_level === "HIGH" ? (
                      <span className="text-amber-600 font-bold">HIGH (+20 pts)</span>
                    ) : (
                      <span className="text-green-600 font-semibold">PASS</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Release Metadata Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Release Audit & Deployment Metadata
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Release ID</span>
            <span className="font-mono font-semibold text-slate-800">{release.release_id}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hospital Site</span>
            <span className="font-semibold text-slate-800">{release.hospital_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deployment Strategy</span>
            <span className="font-mono font-semibold text-slate-800">{release.deployment_type}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deployment Timestamp</span>
            <span className="text-slate-800">{new Date(release.deployment_time).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Status</span>
            <span className="font-semibold text-blue-600">{release.deployment_status}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Author / Engineer</span>
            <span className="text-slate-800">{release.engineer}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ground-Truth Target</span>
            <span className="font-semibold text-slate-800">{release.ground_truth_decision || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Benchmark Decision Time</span>
            <span className="text-slate-800">{release.adviser_decision_time_min || 4.5}m (vs {release.baseline_decision_time_min || 45}m manual)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
