import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Layers,
  FileText,
  Sliders,
  Play,
  RotateCcw,
  ExternalLink,
  Clock,
  UserCheck,
  Activity
} from "lucide-react";
import { NavPage } from "../components/Sidebar";

interface WalkthroughPageProps {
  onNavigate: (page: NavPage) => void;
  onSelectRelease?: (releaseId: string) => void;
}

interface StepDetail {
  step: number;
  title: string;
  role: string;
  pageTarget: NavPage;
  releaseId?: string;
  whatYouSee: string;
  whatYouDo: string;
  whyItMatters: string;
  badge: string;
  mockVisual: {
    heading: string;
    items: { label: string; value: string; color?: string }[];
    callout?: string;
  };
}

const STEPS: StepDetail[] = [
  {
    step: 1,
    title: "Operator Login & Role Authentication",
    role: "SOC Tier 2 / Release Manager",
    pageTarget: "dashboard",
    badge: "Authentication & RBAC",
    whatYouSee: "Operator session badge in header showing current identity (e.g. 'Marcus Vance, SOC Tier 2' or 'Elena Rostova, Release Manager') with simulated role credentials.",
    whatYouDo: "Verify your operator role. If you need to calibrate risk rules or run experiments, switch to 'Release Manager' using the 'Switch Operator Role' modal.",
    whyItMatters: "Healthcare clinical deployments require strict access control. Tier 2 Analysts evaluate evidence and confirm advisories; only Release Managers can modify rule thresholds.",
    mockVisual: {
      heading: "Authenticated Session",
      items: [
        { label: "Active Operator", value: "Marcus Vance, SOC Tier 2" },
        { label: "RBAC Role", value: "SOC / Operations Analyst", color: "text-blue-600 font-bold" },
        { label: "Permissions", value: "View Releases, Confirm Decisions, Provide Override Reasons" }
      ],
      callout: "Role-Based Access Control guarantees threshold integrity during active clinical incidents."
    }
  },
  {
    step: 2,
    title: "Select Hospital Tenant",
    role: "SOC Analyst",
    pageTarget: "dashboard",
    badge: "Multi-Tenant Isolation",
    whatYouSee: "Global Hospital selector in the top header (e.g. City General Hospital, St. Mary's Medical Center, Lakeside Hospital, Metro Care, Green Valley).",
    whatYouDo: "Filter by a specific hospital or select 'All Hospitals (Multi-Tenant Overview)' to monitor system-wide deployment health.",
    whyItMatters: "Different hospitals run distinct operational tiers (Trauma Level 1 vs Regional Clinic). Isolate telemetry to prevent cross-tenant diagnostic confusion.",
    mockVisual: {
      heading: "Hospital Instance Filter",
      items: [
        { label: "Selected Instance", value: "HOSP-CGH-01 (City General Hospital)" },
        { label: "Facility Tier", value: "Trauma Level 1 Emergency Center" },
        { label: "Active Monitored Releases", value: "104 deployments" }
      ],
      callout: "Multi-tenant tenant isolation prevents cascading alarms across unaffected hospitals."
    }
  },
  {
    step: 3,
    title: "Select Software Release for Triage",
    role: "SOC Analyst",
    pageTarget: "releases",
    releaseId: "REL-CASE-001",
    badge: "Release Registry",
    whatYouSee: "Release table with status tags ('MONITORING', 'PENDING_REVIEW'), deployment type ('HOTFIX', 'CANARY', 'STANDARD'), and initial risk badges.",
    whatYouDo: "Click on a release card or table row (such as benchmark 'REL-CASE-001' or 'REL-CASE-003') to open the deep evidence view.",
    whyItMatters: "Immediate visibility into hotfixes and canaries deployed in the last 60 minutes allows the SOC to triage high-risk deployments before clinical handoff.",
    mockVisual: {
      heading: "Release Registry Triage",
      items: [
        { label: "Target Release", value: "REL-CASE-001", color: "text-blue-700 font-mono" },
        { label: "Target Application", value: "Clinical Portal (v4.14.2)" },
        { label: "Deployment Type", value: "HOTFIX (Database Migration)" },
        { label: "Status", value: "MONITORING (28 min post-deploy)" }
      ],
      callout: "Benchmark scenarios allow repeatable failure triage under realistic conditions."
    }
  },
  {
    step: 4,
    title: "Review Release Metadata",
    role: "SOC Analyst",
    pageTarget: "release-detail",
    releaseId: "REL-CASE-001",
    badge: "Metadata Verification",
    whatYouSee: "Application version, previous version, deployment engineer, timestamp, and deployment type tags.",
    whatYouDo: "Check whether this is a scheduled minor upgrade or an emergency hotfix, and identify the authoring release engineer.",
    whyItMatters: "Contextual metadata explains whether high latency could be temporary schema rebuilds or unexpected regressions.",
    mockVisual: {
      heading: "Deployment Metadata",
      items: [
        { label: "Release Version", value: "v4.14.2 (Previous: v4.14.1)" },
        { label: "Deploying Engineer", value: "Sarah Chen (Release Eng)" },
        { label: "Affected Hospital", value: "City General Hospital (Trauma 1)" }
      ],
      callout: "Ensures the operator understands the software scope before evaluating technical signals."
    }
  },
  {
    step: 5,
    title: "Review Technical Telemetry Signals",
    role: "SOC Analyst",
    pageTarget: "release-detail",
    releaseId: "REL-CASE-001",
    badge: "APM Telemetry",
    whatYouSee: "P95 Latency ms (vs baseline), Error Rate % (vs baseline), Service Availability %, and Transaction Throughput.",
    whatYouDo: "Inspect the delta metrics. For example, in REL-CASE-001, observe latency jumping +65% (1650ms vs 1000ms) while error rate remains steady at 0.35%.",
    whyItMatters: "Single-metric dashboards miss nuances. Fusing latency, errors, and availability paints the complete technical health picture.",
    mockVisual: {
      heading: "Technical Telemetry Signals",
      items: [
        { label: "P95 Latency", value: "1650.0 ms (+65.0% degradation)", color: "text-amber-600 font-bold" },
        { label: "HTTP Error Rate", value: "0.35% (Baseline 0.40% - Normal)", color: "text-emerald-600" },
        { label: "Availability", value: "99.85% (Above 99.0% SLA)" },
        { label: "Transactions", value: "9,800 tx/hr (-2.0% - Stable)" }
      ],
      callout: "Orthogonal telemetry signals prevent misleading green-screen false assurances."
    }
  },
  {
    step: 6,
    title: "Review Business & Customer Impact Signals",
    role: "SOC Analyst",
    pageTarget: "release-detail",
    releaseId: "REL-CASE-001",
    badge: "Clinical Impact",
    whatYouSee: "Customer Impact Level (LOW, MEDIUM, HIGH, CRITICAL), affected workflows count, and specific clinical modules impacted.",
    whatYouDo: "Determine if doctors, nurses, or pharmacists are experiencing workflow blocks (e.g. Inpatient ICU medication order entry vs background archive).",
    whyItMatters: "Raw error rates do not tell you if patient care is affected. An error in billing is bad; an error in drug dispensing is life-threatening.",
    mockVisual: {
      heading: "Clinical Workflow Impact",
      items: [
        { label: "Customer Impact", value: "LOW Severity", color: "text-emerald-700 font-semibold" },
        { label: "Affected Hospital Units", value: "1 Department" },
        { label: "Impacted Workflow", value: "Clinical notes auto-save" }
      ],
      callout: "Clinical impact indicators ground software reliability in actual patient-care safety."
    }
  },
  {
    step: 7,
    title: "Review Calculated Risk Score",
    role: "SOC Analyst",
    pageTarget: "release-detail",
    releaseId: "REL-CASE-001",
    badge: "Deterministic Scoring",
    whatYouSee: "Transparent Risk Score dial (0 to 100 points) and categorical risk level (LOW, MEDIUM, HIGH, CRITICAL).",
    whatYouDo: "Observe how points accumulate deterministically from active rules. In CASE-001, Rule R2 adds +30 points, totaling 30 (MEDIUM Risk).",
    whyItMatters: "Replaces vague gut feelings with a quantifiable, reproducible risk threshold understood across the entire engineering team.",
    mockVisual: {
      heading: "Risk Score Engine",
      items: [
        { label: "Calculated Score", value: "30 / 100 Points", color: "text-amber-600 font-bold" },
        { label: "Risk Category", value: "MEDIUM RISK", color: "text-amber-700" },
        { label: "Threshold Band", value: "25 - 59 pts: Flagged for Human Review" }
      ],
      callout: "Deterministic scoring ensures identical telemetry always yields identical risk points."
    }
  },
  {
    step: 8,
    title: "Inspect Triggered Rules & Evidence Narrative",
    role: "SOC Analyst",
    pageTarget: "release-detail",
    releaseId: "REL-CASE-001",
    badge: "Explainability Audit",
    whatYouSee: "Exact list of triggered rules with rule ID, metric value, configured threshold, and plain-English narrative explanation.",
    whatYouDo: "Read the narrative synthesis: 'Service latency increased by 65.0% over baseline (threshold: 30.0%). Error rate remains normal.'",
    whyItMatters: "Complete explainability prevents black-box confusion. Engineers can justify every recommendation to senior leadership.",
    mockVisual: {
      heading: "Triggered Rule Breakdown",
      items: [
        { label: "Rule R2", value: "Latency Degradation (+30 pts)", color: "text-amber-700 font-medium" },
        { label: "Evaluated Metric", value: "latency_change_percent = +65.0%" },
        { label: "Configured Threshold", value: "> 30.0% increase" },
        { label: "Rule Status", value: "Triggered (+30 points added)" }
      ],
      callout: "100% explainability trace ensures every point is backed by observable evidence."
    }
  },
  {
    step: 9,
    title: "Review Advisory Recommendation",
    role: "SOC Analyst",
    pageTarget: "release-detail",
    releaseId: "REL-CASE-001",
    badge: "Advisory Boundary",
    whatYouSee: "Recommendation banner: 'HUMAN REVIEW' (or 'ROLLBACK RECOMMENDED (HIGH IMPACT CONFIRMATION REQUIRED)' on severe cases).",
    whatYouDo: "Read the advisory guidance. Note the prominent disclaimer: 'Advisory system only — no automatic production rollback.'",
    whyItMatters: "Safety guarantee: The system never executes autonomous rollbacks in hospital production. Humans retain ultimate decision authority.",
    mockVisual: {
      heading: "Advisory Recommendation",
      items: [
        { label: "Recommendation", value: "HUMAN REVIEW", color: "text-amber-700 font-bold" },
        { label: "Automation Status", value: "None — Advisory Only (Human Confirmation Required)" },
        { label: "Guidance", value: "Inspect database connection pool; do not roll back prematurely." }
      ],
      callout: "Advisory-only boundary guarantees software never restarts hospital systems autonomously."
    }
  },
  {
    step: 10,
    title: "Confirm Decision (Rollback / Continue / Review)",
    role: "SOC Analyst",
    pageTarget: "release-detail",
    releaseId: "REL-CASE-001",
    badge: "Human Confirmation",
    whatYouSee: "Decision Modal with clear action buttons: 'CONTINUE DEPLOYMENT', 'SEND FOR REVIEW', or 'CONFIRM ROLLBACK'.",
    whatYouDo: "Select the operational action based on evidence. For REL-CASE-001, choose 'SEND FOR REVIEW' to align with the recommendation.",
    whyItMatters: "Deliberate human sign-off ensures high-impact decisions undergo conscious engineering evaluation.",
    mockVisual: {
      heading: "Interactive Decision Confirmation",
      items: [
        { label: "Action Selected", value: "SEND FOR REVIEW", color: "text-blue-700 font-semibold" },
        { label: "Operator Identity", value: "Marcus Vance, SOC Tier 2" },
        { label: "Target Release", value: "REL-CASE-001 (Clinical Portal v4.14.2)" }
      ],
      callout: "Mandatory human confirmation prevents accidental or automated deployment terminations."
    }
  },
  {
    step: 11,
    title: "Enter Mandatory Override Reason (If Overriding)",
    role: "SOC Analyst / Release Manager",
    pageTarget: "release-detail",
    releaseId: "REL-CASE-001",
    badge: "Override Governance",
    whatYouSee: "Mandatory Override Justification text area if your chosen decision differs from the adviser recommendation.",
    whatYouDo: "If overriding (e.g. continuing despite Rollback advisory), type a detailed explanation (min 10 characters) such as: 'Vendor maintenance scheduled; latency expected to normalize at 08:00.'",
    whyItMatters: "Strict accountability. Operators cannot bypass recommendations silently; reasons are permanently logged in compliance audit trails.",
    mockVisual: {
      heading: "Override Justification Validation",
      items: [
        { label: "Adviser Suggestion", value: "ROLLBACK RECOMMENDED" },
        { label: "Operator Choice", value: "CONTINUE (Override Triggered)" },
        { label: "Mandatory Reason", value: "'Latency spike caused by off-peak DB re-indexing. Verified no clinician workflow blockage.'", color: "text-slate-800 italic" },
        { label: "Validation Status", value: "Passed (min 10 characters verified)" }
      ],
      callout: "Mandatory override reasons prevent unvetted deviations from enterprise safety standards."
    }
  },
  {
    step: 12,
    title: "Review Decision Audit Entry",
    role: "SOC Analyst / Auditor",
    pageTarget: "decisions",
    badge: "Compliance Trail",
    whatYouSee: "Audit Log table displaying Timestamp, Operator Name, Role, Hospital, System Recommendation vs Final Decision, and Override Justification.",
    whatYouDo: "Navigate to the 'Audit Logs' page to verify your decision has been recorded with full traceability.",
    whyItMatters: "Hospital clinical software is subject to regulatory audits. Post-incident reviews can reconstruct the exact rationale in seconds.",
    mockVisual: {
      heading: "Immutable Decision Audit Record",
      items: [
        { label: "Timestamp", value: new Date().toISOString() },
        { label: "System Advice", value: "HUMAN REVIEW" },
        { label: "Final Human Decision", value: "SEND FOR REVIEW", color: "text-blue-700 font-bold" },
        { label: "Audit Hash / Trace", value: "SEC-AUDIT-2026-0929-01" }
      ],
      callout: "Complete audit separation between system advice and human final decision."
    }
  },
  {
    step: 13,
    title: "Measure Decision Time & Operational Gains",
    role: "Release Manager / Operations Lead",
    pageTarget: "experiment",
    badge: "Time-to-Decision Metric",
    whatYouSee: "Comparison metrics showing Time to Correct Decision: Baseline (38.2 mins) vs Adviser Measured (4.3 mins) — an 88.7% reduction.",
    whatYouDo: "Review how the adviser accelerated triage while eliminating false rollbacks and missed critical failures.",
    whyItMatters: "Demonstrates tangible operational improvement: decisions that previously took 40 minutes on an incident bridge now resolve in under 5 minutes.",
    mockVisual: {
      heading: "Time-to-Decision Benchmark",
      items: [
        { label: "Manual Baseline", value: "38.2 minutes (Incident subset: 48.5 min)" },
        { label: "Adviser Measured", value: "4.3 minutes", color: "text-emerald-600 font-bold" },
        { label: "Operational Speedup", value: "88.7% decision-time reduction", color: "text-emerald-700 font-bold" },
        { label: "Decision Accuracy", value: "93.3% across synthetic benchmark cohort" }
      ],
      callout: "Time to Correct Decision measures real operational efficiency from telemetry availability to resolution."
    }
  }
];

export const WalkthroughPage: React.FC<WalkthroughPageProps> = ({
  onNavigate,
  onSelectRelease
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleJumpToLive = () => {
    if (currentStep.releaseId && onSelectRelease) {
      onSelectRelease(currentStep.releaseId);
    } else {
      onNavigate(currentStep.pageTarget);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-300 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Usability Walkthrough (Phase 2 Requirement)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">End-to-End Operator Journey Walkthrough</h1>
            <p className="text-slate-300 text-sm max-w-3xl mt-1">
              Step-by-step interactive simulation of how a Healthcare SOC Tier 2 Analyst and Release Manager triage, evaluate, confirm, and audit release rollback decisions using explainable telemetry signals.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => setCurrentStepIndex(0)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Tour</span>
            </button>
            <button
              onClick={handleJumpToLive}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span>Jump to Live Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Stepper Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>STEP {currentStep.step} OF {STEPS.length}: {currentStep.title}</span>
            <span>{Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% COMPLETE</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Quick step thumbnails */}
          <div className="grid grid-cols-13 gap-1 mt-3 overflow-x-auto pb-1">
            {STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                title={`Step ${s.step}: ${s.title}`}
                className={`py-1 text-[10px] font-mono rounded text-center transition-colors cursor-pointer ${
                  idx === currentStepIndex
                    ? "bg-indigo-500 text-white font-bold"
                    : idx < currentStepIndex
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-800/80 text-slate-500 hover:bg-slate-700"
                }`}
              >
                {s.step}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Step Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Step Top Bar */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
              {currentStep.step}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentStep.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-medium text-slate-700">Intended Operator:</span> {currentStep.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-medium">
              {currentStep.badge}
            </span>
          </div>
        </div>

        {/* 3 Core Explanation Columns */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: What User Sees */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>1. What The User Sees</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {currentStep.whatYouSee}
            </p>
          </div>

          {/* Column 2: What User Should Do */}
          <div className="bg-blue-50/50 border border-blue-200/60 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>2. What The User Should Do</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-sans">
              {currentStep.whatYouDo}
            </p>
          </div>

          {/* Column 3: Why It Matters */}
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>3. Why The Step Matters</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-sans">
              {currentStep.whyItMatters}
            </p>
          </div>
        </div>

        {/* Interactive Visual Simulation Panel */}
        <div className="px-6 pb-6">
          <div className="border border-slate-200 rounded-lg bg-slate-900 text-slate-100 p-5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">UI Simulation & Live Preview</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/80 border border-indigo-800/50 px-2 py-0.5 rounded">
                Target View: {currentStep.pageTarget}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{currentStep.mockVisual.heading}</h3>
                <span className="text-xs text-slate-400">Step {currentStep.step} Component</span>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 rounded p-3 space-y-2 font-mono text-xs">
                {currentStep.mockVisual.items.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-750/40 pb-1.5 last:border-b-0 last:pb-0">
                    <span className="text-slate-400">{item.label}:</span>
                    <span className={item.color || "text-slate-200"}>{item.value}</span>
                  </div>
                ))}
              </div>

              {currentStep.mockVisual.callout && (
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/40 border border-slate-700/40 rounded px-3 py-2">
                  <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{currentStep.mockVisual.callout}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              currentStepIndex === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-sm"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleJumpToLive}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Inspect Live on {currentStep.pageTarget}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {currentStepIndex < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate("dashboard")}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finish Tour & Return to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Complete Step Roadmap Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Complete 13-Step Operational Lifecycle Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STEPS.map((s, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            return (
              <div
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  isCurrent
                    ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500 shadow-sm"
                    : isPast
                    ? "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent ? "bg-indigo-600 text-white" : isPast ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    STEP {s.step}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">{s.badge}</span>
                </div>
                <div className={`font-semibold ${isCurrent ? "text-indigo-950 font-bold" : "text-slate-800"}`}>
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
