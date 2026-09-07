import React from "react";
import {
  BookOpen
} from "lucide-react";
import { AdvisoryBanner } from "../components/AdvisoryBanner";

interface DocumentationPageProps {
  onSelectCase: (caseId: string) => void;
}

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ onSelectCase }) => {
  return (
    <div id="documentation-page" className="space-y-8 pb-16 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Product Architecture & Clinical Decision Methodology
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive specification covering current vs proposed workflows, explainable deterministic algorithms, and safety boundaries.
        </p>
      </div>

      <AdvisoryBanner />

      {/* 1. Current vs Proposed Field Workflow */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-600">
          1. Current vs Proposed Field Workflow
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          In typical healthcare software vendor operations, multi-hospital deployments are conducted under high pressure. When an anomaly occurs, decisions to roll back or proceed historically rely on informal engineer heuristics and intuition.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Current Intuition-Based */}
          <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2 border-l-4 border-l-red-500">
            <div className="font-bold text-xs text-red-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Current State: Intuition-Based Decision Making
            </div>
            <ul className="text-xs text-red-800 space-y-1.5 list-disc pl-4">
              <li>Deploy release to hospital staging/canary cluster.</li>
              <li>Engineers monitor fragmented Grafana dashboards and Slack channels.</li>
              <li>Decisions hinge on loudest customer ticket or individual engineer gut feel.</li>
              <li><strong>Average decision time: 48.5 minutes</strong> of high-stakes confusion.</li>
              <li>Significant risk of false rollbacks (wasted deployments) or missed rollbacks (prolonged clinical disruption).</li>
            </ul>
          </div>

          {/* Proposed Explainable Adviser */}
          <div className="p-4 bg-green-50/50 border border-green-200 rounded-xl space-y-2 border-l-4 border-l-green-500">
            <div className="font-bold text-xs text-green-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Proposed State: Quantified Explainable Adviser
            </div>
            <ul className="text-xs text-green-800 space-y-1.5 list-disc pl-4">
              <li>Telemetry feeds technical & customer-impact signals simultaneously.</li>
              <li>Deterministic risk engine evaluates transparent, configurable rules (R1–R6).</li>
              <li>System outputs transparent risk score (0–100) and actionable advice.</li>
              <li><strong>Average decision time: 4.3 minutes</strong> (91.1% time reduction).</li>
              <li>Enforces strict human confirmation, override justification, and audit logs.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Technical Approach Comparison: Rule Engine vs Machine Learning */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-600">
          2. Technical Approach: Deterministic Rules vs Black-Box ML
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Why did we select a <strong>deterministic, configurable rules engine</strong> rather than an end-to-end deep learning model for release rollback recommendations?
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Evaluation Dimension</th>
                <th className="px-4 py-2.5 text-blue-700">Deterministic Rules Engine (Chosen)</th>
                <th className="px-4 py-2.5 text-slate-500">Black-Box ML Classifier (Rejected)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Explainability to Clinicians</td>
                <td className="px-4 py-3 text-green-700 font-medium">
                  Complete transparency: exact metric values, thresholds, and points violated.
                </td>
                <td className="px-4 py-3 text-slate-500">
                  Opaque feature weights or SHAP approximations that clinicians cannot audit under stress.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Regulatory Compliance (FDA/ISO)</td>
                <td className="px-4 py-3 text-green-700 font-medium">
                  Deterministic repeatability: same inputs guaranteed to yield identical output.
                </td>
                <td className="px-4 py-3 text-slate-500">
                  Stochastic drift, training set bias, and difficult verification requirements.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Field Adaptability</td>
                <td className="px-4 py-3 text-green-700 font-medium">
                  Release Managers can tune thresholds in UI without re-training models or deploying code.
                </td>
                <td className="px-4 py-3 text-slate-500">
                  Requires retrained weights, validation sets, and ML pipeline maintenance.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Cold Start / Rare Outages</td>
                <td className="px-4 py-3 text-green-700 font-medium">
                  High effectiveness on day one with zero training data required.
                </td>
                <td className="px-4 py-3 text-slate-500">
                  Severe class imbalance (catastrophic rollbacks represent &lt;2% of releases).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Three Critical Benchmark Failure Scenarios */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-600">
            3. Three Benchmark Evaluation Scenarios
          </h3>
          <span className="text-xs text-slate-500">Click to inspect in Release Detail view</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Case 1 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600">REL-CASE-001</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold uppercase">
                  Case 1
                </span>
              </div>
              <h4 className="font-semibold text-xs text-slate-900 mt-1">
                High Latency with Normal Error Rate
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Latency jumps +65% (485ms vs 295ms baseline), but error rate is only 0.35%. Traditional error-only alerts miss this degradation.
              </p>
              <div className="mt-2 text-[10px] text-slate-500">
                Adviser: <strong>HUMAN REVIEW (Score 40)</strong>
              </div>
            </div>
            <button
              onClick={() => onSelectCase("REL-CASE-001")}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Inspect Case 1
            </button>
          </div>

          {/* Case 2 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600">REL-CASE-002</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold uppercase">
                  Case 2
                </span>
              </div>
              <h4 className="font-semibold text-xs text-slate-900 mt-1">
                High Errors with Low Customer Impact
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Error rate spikes to 8.4% on non-critical background metrics endpoint, but customer impact is LOW. Prevents panic rollbacks.
              </p>
              <div className="mt-2 text-[10px] text-slate-500">
                Adviser: <strong>HUMAN REVIEW (Score 45)</strong>
              </div>
            </div>
            <button
              onClick={() => onSelectCase("REL-CASE-002")}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Inspect Case 2
            </button>
          </div>

          {/* Case 3 */}
          <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl flex flex-col justify-between space-y-3 border-l-4 border-l-red-500">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-red-600">REL-CASE-003</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-semibold uppercase">
                  Case 3
                </span>
              </div>
              <h4 className="font-semibold text-xs text-red-900 mt-1">
                Low Errors with Critical Customer Impact
              </h4>
              <p className="text-[11px] text-red-800 mt-1">
                Error rate looks calm (1.8%), but medication ordering transactions drop 42% with CRITICAL clinical disruption. Requires immediate rollback!
              </p>
              <div className="mt-2 text-[10px] text-red-700 font-semibold">
                Adviser: <strong>ROLLBACK RECOMMENDED (Score 75)</strong>
              </div>
            </div>
            <button
              onClick={() => onSelectCase("REL-CASE-003")}
              className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Inspect Case 3
            </button>
          </div>
        </div>
      </section>

      {/* 4. Safety Guardrails & Role Privileges */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-600">
          4. Safety Constraints & Role-Based Access Control (RBAC)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The application strictly implements the required dual safety boundaries:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-1">Strict Advisory Boundary</span>
            The system provides risk scores, triggered rule breakdown, and actionable advice, but has no destructive network hooks to autonomously stop, tear down, or roll back containerized hospital workloads.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-1">Human Override Accountability</span>
            Any human decision that differs from the adviser recommendation requires an explicit justification rationale, which is permanently saved to the immutable SQLite audit trail.
          </div>
        </div>
      </section>
    </div>
  );
};
