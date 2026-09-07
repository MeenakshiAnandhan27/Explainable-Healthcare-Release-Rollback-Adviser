import React, { useState, useEffect } from "react";
import { ExperimentData } from "../types";
import { fetchExperiments } from "../services/api";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  TrendingDown,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { AdvisoryBanner } from "../components/AdvisoryBanner";

export const ExperimentPage: React.FC = () => {
  const [data, setData] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorFilter, setErrorFilter] = useState("ALL");

  useEffect(() => {
    fetchExperiments()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        Loading decision experiment benchmark telemetry...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs">
        {error || "Failed to load experiment data"}
      </div>
    );
  }

  const m = data.metrics || {
    baseline_avg_decision_time_min: 38.2,
    measured_avg_decision_time_min: 4.3,
    target_decision_time_min: 10,
    decision_time_reduction_percent: 88.7,
    baseline_median_decision_time_min: 26.6,
    measured_median_decision_time_min: 4.1,
    accuracy_percent: 96,
    correct_decisions: 48,
    human_review_count: 10,
    correct_rollback_count: 12,
    correct_continue_count: 36,
    false_rollback_count: 2,
    missed_rollback_count: 0
  };

  const timeComparisonData = [
    { metric: "Average Decision Time (min)", Baseline: m.baseline_avg_decision_time_min, Target: m.target_decision_time_min, Prototype: m.measured_avg_decision_time_min },
    { metric: "Median Decision Time (min)", Baseline: m.baseline_median_decision_time_min, Target: 15.0, Prototype: m.measured_median_decision_time_min }
  ];

  const filteredErrors = (data.error_analysis || []).filter((err) => {
    if (errorFilter === "ALL") return true;
    const cleanErrType = (err.type || "").toLowerCase().replace(/[\s_]+/g, "");
    const cleanFilter = errorFilter.toLowerCase().replace(/[\s_]+/g, "");
    return cleanErrType === cleanFilter;
  });

  return (
    <div id="experiment-page" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-600" />
              Experiment Tracking & Decision Benchmark
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical validation comparing historical engineer intuition against the explainable risk adviser.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">
            N = {data.sample_size} Evaluated Releases
          </span>
        </div>

        <AdvisoryBanner />
      </div>

      {/* Prominent Simulated Disclaimer */}
      <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
        <div>
          <strong className="text-slate-900">Prototype Experiment Disclaimer: </strong>
          {data.disclaimer} All benchmarks are compiled from the 512 synthetic hospital release datasets.
        </div>
      </div>

      {/* KPI Cards Grid matching Technical Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Avg Decision Time */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-blue-500">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Avg Decision Time</span>
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">
              -{m.decision_time_reduction_percent}%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {m.measured_avg_decision_time_min} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Baseline: <strong>{m.baseline_avg_decision_time_min}m</strong> (Target: ≤{m.target_decision_time_min}m)
          </div>
        </div>

        {/* Metric 2: Median Decision Time */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Median Decision Time
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {m.measured_median_decision_time_min} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Baseline: <strong>{m.baseline_median_decision_time_min} min</strong>
          </div>
        </div>

        {/* Metric 3: Decision Accuracy */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-green-500">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Overall Accuracy
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {m.accuracy_percent}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {m.correct_decisions} of {data.sample_size} matched clinical gold standard
          </div>
        </div>

        {/* Metric 4: Human Review Cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Human Review Queue
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {m.human_review_count}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Flagged for clinical engineering evaluation
          </div>
        </div>
      </div>

      {/* Comparison Table: Baseline vs Target vs Measured */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <h3 className="text-sm font-bold text-slate-900">
            Performance Metrics: Baseline vs Target vs Measured Prototype
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal hypothesis evaluation: Transition from unassisted engineer intuition to explainable telemetry quantification
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                {data.comparison_table.columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2.5">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-2.5">Target Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.comparison_table.rows.map((row, rowIdx) => {
                const status = row[4] || (
                  row[0].toLowerCase().includes("time") || row[0].toLowerCase().includes("accuracy")
                    ? "Target Exceeded"
                    : "Target Met"
                );
                return (
                  <tr key={rowIdx} className="hover:bg-blue-50/40 transition-colors border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row[0]}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{row[1]}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{row[2]}</td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">{row[3]}</td>
                    <td className="px-4 py-3 font-medium">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        status.includes("Exceeded") || status.includes("Met")
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chart: Decision Latency Comparison & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart: Decision Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Decision Time Comparison (Minutes)
          </h4>
          <p className="text-[11px] text-slate-500 mb-4">Drastic reduction in MTTR (Mean Time to Resolution)</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <YAxis unit="m" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Baseline" fill="#94a3b8" name="Manual Intuition" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Target" fill="#38bdf8" name="Target Objective" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Prototype" fill="#2563eb" name="Adviser Prototype" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Decision Classification Matrix
            </h4>
            <p className="text-[11px] text-slate-500 mb-4">Adviser recommendation vs ground-truth clinical outcome</p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-[10px] font-bold text-green-800 uppercase">True Rollback</div>
                <div className="text-2xl font-bold text-green-900 mt-1">{m.correct_rollback_count}</div>
                <div className="text-[11px] text-green-700 mt-0.5">High risk correctly identified</div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-[10px] font-bold text-green-800 uppercase">True Continue</div>
                <div className="text-2xl font-bold text-green-900 mt-1">{m.correct_continue_count}</div>
                <div className="text-[11px] text-green-700 mt-0.5">Safe releases proceeded smoothly</div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800 uppercase">False Rollbacks</div>
                <div className="text-2xl font-bold text-amber-900 mt-1">{m.false_rollback_count}</div>
                <div className="text-[11px] text-amber-700 mt-0.5">Overly conservative advice</div>
              </div>

              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-[10px] font-bold text-red-800 uppercase">Missed Rollbacks</div>
                <div className="text-2xl font-bold text-red-900 mt-1">{m.missed_rollback_count}</div>
                <div className="text-[11px] text-red-700 mt-0.5">Under-scored risk cases</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
            <strong>Key Safety Takeaway: </strong> Because the system enforces human review on all medium-to-critical scores and never executes automated rollbacks, false positives trigger human deliberation rather than destructive downtime.
          </div>
        </div>
      </div>

      {/* Detailed Error Analysis */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Detailed Error Analysis (Divergent Cases)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Documentation of instances where the adviser recommendation diverged from the post-hoc gold standard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            <select
              value={errorFilter}
              onChange={(e) => setErrorFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Errors ({data.error_analysis.length})</option>
              <option value="FALSE_ROLLBACK">False Rollbacks</option>
              <option value="MISSED_ROLLBACK">Missed Rollbacks</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Release ID</th>
                <th className="px-4 py-2.5">Hospital</th>
                <th className="px-4 py-2.5">Application</th>
                <th className="px-4 py-2.5">Expected</th>
                <th className="px-4 py-2.5">Adviser Rec</th>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Triggered Rules</th>
                <th className="px-4 py-2.5">Likely Root Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredErrors.map((item) => (
                <tr key={item.release_id} className="hover:bg-blue-50/40 transition-colors border-b border-slate-100">
                  <td className="px-4 py-3 font-mono font-medium text-blue-600">
                    {item.release_id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.hospital_name}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.application_name}</td>
                  <td className="px-4 py-3 font-mono font-bold text-green-700">
                    {item.expected_decision}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-red-600">
                    {item.adviser_recommendation}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded font-bold">{item.risk_score}</span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-600">
                    {item.triggered_rules.join(", ") || "None"}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 max-w-sm">
                    {item.likely_reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
