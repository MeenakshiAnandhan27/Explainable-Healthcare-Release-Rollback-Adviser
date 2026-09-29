import React from "react";
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  ExternalLink,
  Shield,
  Layers,
  Activity,
  Code2
} from "lucide-react";
import { NavPage } from "../components/Sidebar";

interface FailureModesPageProps {
  onSelectRelease?: (releaseId: string) => void;
  onNavigate?: (page: NavPage) => void;
}

interface FailureModeItem {
  id: string;
  name: string;
  category: "Benchmark Failure Case" | "Edge Case";
  releaseId?: string;
  inputs: { label: string; value: string }[];
  expected: string;
  actual: string;
  risk: string;
  mitigation: string;
  testCaseName: string;
  testFile: string;
}

const FAILURE_MODES: FailureModeItem[] = [
  {
    id: "case-1",
    name: "1. High Latency But Normal Errors",
    category: "Benchmark Failure Case",
    releaseId: "REL-CASE-001",
    inputs: [
      { label: "P95 Latency Change", value: "+65.0% (Surpasses 30% threshold)" },
      { label: "HTTP Error Rate", value: "0.35% (Baseline 0.40% - Normal)" },
      { label: "Transaction Drop", value: "2.0% (Stable)" },
      { label: "Customer Impact", value: "LOW" }
    ],
    expected: "Rule R2 triggers (+30 pts) producing 30 risk points and HUMAN REVIEW. Avoids blanket hasty rollback while transactions are succeeding.",
    actual: "Score = 30 pts. Recommendation = HUMAN REVIEW. Warning emitted regarding elevated response times.",
    risk: "Premature rollback could interrupt active clinician note-saving, whereas unaddressed latency risks connection pool exhaustion.",
    mitigation: "Adviser suggests inspecting database indexing cache hit ratios before deciding to revert.",
    testCaseName: "test_1_high_latency_normal_errors_stable_transactions",
    testFile: "tests/test_risk_engine.py"
  },
  {
    id: "case-2",
    name: "2. High Error Rate But Low Customer Impact",
    category: "Benchmark Failure Case",
    releaseId: "REL-CASE-002",
    inputs: [
      { label: "HTTP Error Rate", value: "7.5% (Surpasses 5.0% threshold)" },
      { label: "P95 Latency Change", value: "+5.0% (Normal)" },
      { label: "Transaction Drop", value: "3.0% (Normal)" },
      { label: "Customer Impact", value: "LOW (Non-critical telemetry sync)" }
    ],
    expected: "Rule R1 triggers (+30 pts) producing 30 risk points and HUMAN REVIEW. Alerts engineer to technical failure while acknowledging no patient-care block.",
    actual: "Score = 30 pts. Recommendation = HUMAN REVIEW.",
    risk: "Unnecessary rollback could invalidate critical bug fixes; ignoring error rate could cascade into upstream queues.",
    mitigation: "Surface microservice trace breakdown to isolate error origin; mandatory operator review.",
    testCaseName: "test_2_high_error_rate_low_customer_impact",
    testFile: "tests/test_risk_engine.py"
  },
  {
    id: "case-3",
    name: "3. Low Technical Risk But Critical Customer Impact",
    category: "Benchmark Failure Case",
    releaseId: "REL-CASE-003",
    inputs: [
      { label: "HTTP Error Rate", value: "0.20% (Nominal green)" },
      { label: "P95 Latency Change", value: "+2.0% (Nominal green)" },
      { label: "Customer Impact", value: "CRITICAL (ICU medication ordering blocked)" },
      { label: "Availability", value: "99.9%" }
    ],
    expected: "Technical signals appear green, but Rule R5 triggers (+40 pts) instantly elevating to HUMAN REVIEW (or ROLLBACK if paired with traffic drop).",
    actual: "Score = 40 pts. Recommendation = HUMAN REVIEW with high-severity clinical warning.",
    risk: "Pure APM monitoring would mark this deployment 'Healthy', leaving hospital ICU nurses unable to verify medication orders.",
    mitigation: "Directly ingest clinical workflow status and customer impact indicators into scoring formula.",
    testCaseName: "test_3_low_technical_risk_critical_customer_impact",
    testFile: "tests/test_risk_engine.py"
  },
  {
    id: "edge-4",
    name: "4. Missing Latency Telemetry Signal",
    category: "Edge Case",
    releaseId: "REL-EDGE-004",
    inputs: [
      { label: "P95 Latency Change", value: "null / missing telemetry signal" },
      { label: "HTTP Error Rate", value: "0.20%" },
      { label: "Customer Impact", value: "LOW" }
    ],
    expected: "System must NEVER silently assume missing data equals 0% change. Flag 'Insufficient Evidence' and surface prominent telemetry warning.",
    actual: "Risk engine catches null values; suppresses false rule triggers; surfaces data quality warning.",
    risk: "Silent failure where degraded software is declared 'Safe' simply because monitoring scraper crashed.",
    mitigation: "Strict schema boundary checks; require complete telemetry before full automated clearance.",
    testCaseName: "test_4_missing_latency",
    testFile: "tests/test_failure_cases.py"
  },
  {
    id: "edge-5",
    name: "5. Zero Transactions / Volume Collapse",
    category: "Edge Case",
    releaseId: "REL-EDGE-005",
    inputs: [
      { label: "Transaction Count", value: "0 tx/hr (Baseline: 5,000 tx/hr)" },
      { label: "Transaction Drop", value: "100.0% (Surpasses 10% threshold)" },
      { label: "Customer Impact", value: "LOW" }
    ],
    expected: "Rule R3 triggers (+25 pts) elevating score to 25 (HUMAN REVIEW). Operator determines if off-hours scheduling or catastrophic ingress outage.",
    actual: "Score = 25 pts. Recommendation = HUMAN REVIEW.",
    risk: "Mistaking normal quiet midnight maintenance hours for a catastrophic gateway outage.",
    mitigation: "Operator reviews deployment time of day and schedule profile before approving action.",
    testCaseName: "test_5_zero_transactions",
    testFile: "tests/test_failure_cases.py"
  },
  {
    id: "edge-6",
    name: "6. Conflicting Technical Signals",
    category: "Edge Case",
    releaseId: "REL-EDGE-006",
    inputs: [
      { label: "P95 Latency Change", value: "+85.0% (Surpasses 30% threshold - R2)" },
      { label: "Transaction Drop", value: "40.0% (Surpasses 10% threshold - R3)" },
      { label: "HTTP Error Rate", value: "0.10% (Deceptive green error rate)" }
    ],
    expected: "R2 (+30) and R3 (+25) accumulate orthogonally to 55 points. Recommends elevated HUMAN REVIEW just 5 points below automatic rollback advisory.",
    actual: "Score = 55 pts. Recommendation = HUMAN REVIEW (High-risk threshold boundary).",
    risk: "Relying on error rates alone would miss client-side connection drops and timeouts.",
    mitigation: "Multi-dimensional risk accumulation prevents single-signal masking.",
    testCaseName: "test_6_conflicting_technical_signals",
    testFile: "tests/test_failure_cases.py"
  }
];

export const FailureModesPage: React.FC<FailureModesPageProps> = ({
  onSelectRelease,
  onNavigate
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800 mb-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>Failure Mode Analysis (Phase 2 Requirement)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Failure Mode & Edge-Case Catalog</h1>
            <p className="text-slate-600 text-sm max-w-3xl mt-1">
              Systematic engineering breakdown of the 6 benchmark scenarios and edge cases. Every failure mode is linked directly to an executable regression test asserting expected operational behavior.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate("walkthrough")}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              View Walkthrough
            </button>
            <button
              onClick={() => onNavigate && onNavigate("docs")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Open Full Docs
            </button>
          </div>
        </div>
      </div>

      {/* Failure Modes List */}
      <div className="space-y-4">
        {FAILURE_MODES.map((fm) => (
          <div
            key={fm.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-900 text-white">
                  {fm.id.toUpperCase()}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{fm.name}</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {fm.category}
                </span>
              </div>

              {fm.releaseId && onSelectRelease && (
                <button
                  onClick={() => onSelectRelease(fm.releaseId!)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect Scenario ({fm.releaseId})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs">
              {fm.inputs.map((inp, idx) => (
                <div key={idx} className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">{inp.label}:</span>
                  <span className="text-slate-800 font-semibold">{inp.value}</span>
                </div>
              ))}
            </div>

            {/* Behavior & Risk Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div>
                  <strong className="text-slate-900 block font-sans">Expected Engine Behavior:</strong>
                  <p className="text-slate-700 leading-relaxed mt-0.5">{fm.expected}</p>
                </div>
                <div>
                  <strong className="text-slate-900 block font-sans">Actual Prototype Behavior:</strong>
                  <p className="text-slate-700 leading-relaxed mt-0.5">{fm.actual}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <strong className="text-slate-900 block font-sans">Operational Risk:</strong>
                  <p className="text-rose-900 leading-relaxed mt-0.5 bg-rose-50/60 p-2 rounded border border-rose-200">
                    {fm.risk}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-900 block font-sans">Engineering Mitigation:</strong>
                  <p className="text-emerald-900 leading-relaxed mt-0.5 bg-emerald-50/60 p-2 rounded border border-emerald-200">
                    {fm.mitigation}
                  </p>
                </div>
              </div>
            </div>

            {/* Test Case Link Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Executable Test:</span>
                <code className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-800">
                  {fm.testFile}::{fm.testCaseName}()
                </code>
              </div>

              <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Automated Regression Test Passing</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
