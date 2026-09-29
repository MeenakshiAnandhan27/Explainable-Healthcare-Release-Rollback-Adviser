import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Stethoscope,
  Server,
  Lock,
  Eye,
  Database,
  UserX,
  FileText,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

export const EthicsSafetyPage: React.FC = () => {
  const safetyPrinciples = [
    {
      num: 1,
      title: "Advisory-Only Architecture",
      icon: Eye,
      summary: "This system functions strictly in an advisory capacity. It generates risk assessments and recommendations but never possesses direct execution authority over hospital production containers or databases.",
      badge: "Core Architecture"
    },
    {
      num: 2,
      title: "No Automatic Production Rollback",
      icon: ShieldAlert,
      summary: "The system will NEVER automatically trigger or execute a production software rollback, even when risk scores exceed critical thresholds (≥ 80 pts).",
      badge: "Non-Negotiable Safety"
    },
    {
      num: 3,
      title: "Mandatory Human Confirmation for High-Impact Actions",
      icon: ShieldCheck,
      summary: "High-impact advisories ('ROLLBACK RECOMMENDED') require deliberate, interactive confirmation by an authorized human operator before any operational status is committed.",
      badge: "Human Oversight"
    },
    {
      num: 4,
      title: "100% Synthetic Telemetry for Prototype",
      icon: Database,
      summary: "All 512 releases, telemetry signals, microservice names, and hospital instances are synthetic simulations generated for engineering evaluation.",
      badge: "Synthetic Data"
    },
    {
      num: 5,
      title: "Strict Absence of Patient Health Information (PHI)",
      icon: UserX,
      summary: "Zero patient medical records, protected health information (PHI), or individual identities are stored, accessed, or ingested by this application.",
      badge: "HIPAA / Privacy"
    },
    {
      num: 6,
      title: "Not a Clinical Decision Support System (CDSS)",
      icon: Stethoscope,
      summary: "This is an IT observability tool. It must never be used for medical diagnosis, clinical treatment planning, drug prescription, or patient triage.",
      badge: "Clinical Exclusion"
    },
    {
      num: 7,
      title: "Awareness of Erroneous Recommendations",
      icon: AlertTriangle,
      summary: "Deterministic rules can be triggered by transient network jitter (false positives) or miss silent client-side regressions (false negatives). Human critical thinking is mandatory.",
      badge: "Error Sensitivity"
    },
    {
      num: 8,
      title: "Missing Telemetry Flagged as Insufficient Evidence",
      icon: HelpCircle,
      summary: "If latency, error rate, or transaction signals drop offline or fail collection, the engine NEVER silently presumes safety. It surfaces 'Insufficient Evidence' and flags Human Review.",
      badge: "Fail-Safe Default"
    },
    {
      num: 9,
      title: "Human Operators Bear Ultimate Accountability",
      icon: Lock,
      summary: "Final operational responsibility and legal accountability for all software deployment actions remain exclusively with the human engineering staff.",
      badge: "Accountability"
    },
    {
      num: 10,
      title: "Mandatory Override Justification for Auditability",
      icon: FileText,
      summary: "If an operator chooses to override an adviser recommendation, a mandatory documented clinical/operational explanation (min 10 characters) is enforced and audited.",
      badge: "Compliance Trail"
    },
    {
      num: 11,
      title: "Strict Role-Based Access Control (RBAC)",
      icon: Lock,
      summary: "Risk rules and thresholds (R1–R6) may only be reconfigured by authorized Release Managers. Tier 2 Analysts have read-only visibility to prevent active incident tampering.",
      badge: "RBAC Security"
    },
    {
      num: 12,
      title: "Rule Modifications Are Fully Audited",
      icon: FileCheck,
      summary: "Every threshold or weight alteration captures old values, new values, user identity, role, and UTC timestamp in an immutable audit ledger.",
      badge: "Audit Integrity"
    },
    {
      num: 13,
      title: "Future Production Prerequisites",
      icon: CheckCircle2,
      summary: "Live hospital production deployment would require formal clinical governance sign-off, SOC 2 / ISO 27001 certification, enterprise SAML SSO, and hospital CMIO approval.",
      badge: "Production Roadmap"
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Prominent Mandatory Safety Banner */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-lg shadow-sm shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-200 text-amber-900 mb-1">
              Safety Mandate
            </div>
            <h1 className="text-xl font-black text-amber-950 uppercase tracking-tight">
              Advisory System Only — No Automatic Production Rollback
            </h1>
            <p className="text-sm text-amber-900 leading-relaxed font-medium">
              This system is strictly an operational decision-support tool. It computes explainable technical risk scores and suggests rollback recommendations for hospital software deployments. It <strong className="font-bold underline">never</strong> automatically reverts, stops, or terminates live production containers or database services without explicit, interactive confirmation by an authorized human operator.
            </p>
          </div>
        </div>
      </div>

      {/* Conceptual Distinction Table: Technical Risk vs Clinical Decision-Making */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            <span>Strict Conceptual Distinction: Technical Risk vs. Clinical Decision-Making</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Federal regulatory bodies (FDA, EU MDR) and hospital governance committees mandate clear operational boundaries between IT infrastructure reliability tools and Medical Devices.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4 bg-blue-50 text-blue-900">Technical Release-Risk Adviser (This System)</th>
                <th className="py-3 px-4 bg-rose-50 text-rose-900">Clinical Decision Support System (CDSS - Not This System)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Primary Domain</td>
                <td className="py-3 px-4 bg-blue-50/30">IT infrastructure, microservice telemetry, network latency, database connections</td>
                <td className="py-3 px-4 bg-rose-50/30">Patient care, diagnosis, medical treatment plans, pharmaceutical dosages</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Intended End Users</td>
                <td className="py-3 px-4 bg-blue-50/30">SOC Tier 1/2 Analysts, Site Reliability Engineers, Clinical Release Managers</td>
                <td className="py-3 px-4 bg-rose-50/30">Attending Physicians, Registered Nurses, Pharmacists, ICU Clinicians</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Primary Data Inputs</td>
                <td className="py-3 px-4 bg-blue-50/30">HTTP 500 error rates, P95 latency ms, transaction count drop %, affected workflow tags</td>
                <td className="py-3 px-4 bg-rose-50/30">Patient vitals, blood lab panels, EHR clinical history, allergies, DICOM scans</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Output Nature</td>
                <td className="py-3 px-4 bg-blue-50/30">Advisory recommendation (`ROLLBACK`, `HUMAN REVIEW`, `CONTINUE`) with signal evidence</td>
                <td className="py-3 px-4 bg-rose-50/30">Medical diagnostic recommendations, medication interaction alerts, clinical triage scores</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Regulatory Classification</td>
                <td className="py-3 px-4 bg-blue-50/30">Enterprise Observability / IT Operations Software</td>
                <td className="py-3 px-4 bg-rose-50/30">Class II / Class III Regulated Medical Device (FDA 510(k), CE mark)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Failure Implication</td>
                <td className="py-3 px-4 bg-blue-50/30">Unnecessary deployment rollback or delayed release of a non-critical software feature</td>
                <td className="py-3 px-4 bg-rose-50/30">Adverse patient medical outcome, therapeutic error, or misdiagnosis</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 13 Core Safety & Governance Principles */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>The 13 Healthcare Safety & Governance Principles</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory architectural principles governing development, evaluation, and operational deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyPrinciples.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-mono text-xs flex items-center justify-center font-bold">
                      {p.num}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">{p.title}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">
                    {p.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-8">
                  {p.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
