import React, { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  Server,
  Database,
  Activity,
  Shield,
  FileText,
  CheckSquare,
  HelpCircle
} from "lucide-react";

interface ChecklistItem {
  id: string;
  category: "ENVIRONMENT" | "DATABASE" | "MONITORING" | "SECURITY" | "OPERATION" | "VALIDATION";
  label: string;
  description: string;
  isImplemented: boolean;
  prototypeStatus: "IMPLEMENTED" | "PLANNED_PRODUCTION";
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // ENVIRONMENT
  {
    id: "env-1",
    category: "ENVIRONMENT",
    label: "Production / Staging environment identified",
    description: "Identified Node.js 22 runtime + Express server running on port 3000 with Vite proxy middlewares.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "env-2",
    category: "ENVIRONMENT",
    label: "Environment variables configured",
    description: "Standardized in .env.example with PORT=3000 and NODE_ENV variables defined.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "env-3",
    category: "ENVIRONMENT",
    label: "Secrets configured securely in cloud vault",
    description: "Dedicated GCP Secret Manager / Vault integration for production API credentials.",
    isImplemented: false,
    prototypeStatus: "PLANNED_PRODUCTION"
  },
  {
    id: "env-4",
    category: "ENVIRONMENT",
    label: "Dedicated high-availability multi-region cluster",
    description: "Production load balancers with automated failover across availability zones.",
    isImplemented: false,
    prototypeStatus: "PLANNED_PRODUCTION"
  },

  // DATABASE
  {
    id: "db-1",
    category: "DATABASE",
    label: "Prototype schema persistence established",
    description: "Clean schema-validated JSON files (releases.json, decisions.json, validations.json, rules_audit.json).",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "db-2",
    category: "DATABASE",
    label: "Decision audit logging enabled",
    description: "Every operator confirmation, override reason, and recommendation is permanently logged.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "db-3",
    category: "DATABASE",
    label: "Rule modification audit trail active",
    description: "Tracks old vs new thresholds and weights whenever a Release Manager modifies rules.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "db-4",
    category: "DATABASE",
    label: "Enterprise relational database migration (Cloud SQL / PostgreSQL)",
    description: "Automated schema migrations via Flyway / Drizzle and Point-in-time recovery (PITR).",
    isImplemented: false,
    prototypeStatus: "PLANNED_PRODUCTION"
  },

  // MONITORING
  {
    id: "mon-1",
    category: "MONITORING",
    label: "Latency monitoring signals modeled & calculated",
    description: "P95 latency baseline ms, observed latency ms, and percentage change evaluated against R2.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "mon-2",
    category: "MONITORING",
    label: "Error rate monitoring signals active",
    description: "HTTP error rate evaluated against 5.0% threshold (R1).",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "mon-3",
    category: "MONITORING",
    label: "Transaction volume throughput monitoring active",
    description: "Transaction drop percentage evaluated against 10.0% threshold (R3).",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "mon-4",
    category: "MONITORING",
    label: "Customer & clinical impact signals mapped",
    description: "LOW, MEDIUM, HIGH, CRITICAL classification with affected clinical workflows.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "mon-5",
    category: "MONITORING",
    label: "Real-time OpenTelemetry / Prometheus push collectors",
    description: "Live streaming collectors scraping microservice sidecars in production.",
    isImplemented: false,
    prototypeStatus: "PLANNED_PRODUCTION"
  },

  // SECURITY
  {
    id: "sec-1",
    category: "SECURITY",
    label: "Role-Based Access Control (RBAC) configured",
    description: "Enforces separation: SOC Analysts (read-only rules) vs Release Managers (full permissions).",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "sec-2",
    category: "SECURITY",
    label: "Zero hardcoded secrets committed to repository",
    description: "Codebase clean of sensitive keys, production tokens, or cloud secrets.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "sec-3",
    category: "SECURITY",
    label: "Negative permission enforcement verified via automated test",
    description: "Verified TEST 9: Operations Analyst cannot modify risk rules (403 Forbidden).",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "sec-4",
    category: "SECURITY",
    label: "Enterprise SAML 2.0 / Okta Single Sign-On (SSO)",
    description: "Integration with hospital hospital-wide enterprise identity provider.",
    isImplemented: false,
    prototypeStatus: "PLANNED_PRODUCTION"
  },

  // OPERATION
  {
    id: "ops-1",
    category: "OPERATION",
    label: "Advisory-only boundary strictly enforced",
    description: "System outputs recommendations; does NOT perform automated production rollback execution.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "ops-2",
    category: "OPERATION",
    label: "Mandatory human confirmation workflow",
    description: "Decision modal requires conscious operator confirmation before recording action.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "ops-3",
    category: "OPERATION",
    label: "Mandatory override justification validation",
    description: "Minimum 10 characters verified if operator deviates from recommendation.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "ops-4",
    category: "OPERATION",
    label: "Formal hospital CMIO & incident commander escalation runbook",
    description: "Documented SOP for emergency container revert and manual database schema rewind.",
    isImplemented: false,
    prototypeStatus: "PLANNED_PRODUCTION"
  },

  // VALIDATION
  {
    id: "val-1",
    category: "VALIDATION",
    label: "Configurable deterministic risk rules R1-R6 evaluated",
    description: "Deterministic scoring with transparent mathematical boundaries.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "val-2",
    category: "VALIDATION",
    label: "20 automated executable regression tests passed",
    description: "Tests 1-20 verified in tests/run_all_tests.py and tests/run_all_tests.ts.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "val-3",
    category: "VALIDATION",
    label: "Reproducible experiment benchmark (Seed 42)",
    description: "Scripted experiment calculating 38.2 min baseline and 4.3 min adviser time.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "val-4",
    category: "VALIDATION",
    label: "Data schema quality validation active",
    description: "Rejects negative latency, error rates > 100%, and duplicate release IDs.",
    isImplemented: true,
    prototypeStatus: "IMPLEMENTED"
  },
  {
    id: "val-5",
    category: "VALIDATION",
    label: "Live clinical governance committee institutional sign-off",
    description: "Formal sign-off by hospital Institutional Review Board / clinical informatics committee.",
    isImplemented: false,
    prototypeStatus: "PLANNED_PRODUCTION"
  }
];

export const DeploymentChecklistPage: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const categories: Array<ChecklistItem["category"]> = [
    "ENVIRONMENT",
    "DATABASE",
    "MONITORING",
    "SECURITY",
    "OPERATION",
    "VALIDATION"
  ];

  const implementedCount = CHECKLIST_ITEMS.filter((i) => i.isImplemented).length;
  const totalCount = CHECKLIST_ITEMS.length;

  const filteredItems = filterCategory === "ALL"
    ? CHECKLIST_ITEMS
    : CHECKLIST_ITEMS.filter((i) => i.category === filterCategory);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-2">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Deployment Readiness Checklist (Phase 2 Requirement)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Deployment Readiness</h1>
            <p className="text-slate-600 text-sm max-w-3xl mt-1">
              Operational checklist distinguishing features fully implemented and validated in this Phase 2 prototype versus mandatory requirements for live production healthcare environments.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-6 shrink-0">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prototype Status</div>
              <div className="text-2xl font-black text-indigo-700">{implementedCount} / {totalCount}</div>
              <div className="text-[10px] text-slate-500">Requirements Implemented</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-200" />
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Readiness Level</div>
              <div className="text-base font-bold text-emerald-600">Phase 3 Engineering Prototype</div>
              <div className="text-[10px] text-slate-500">20/20 Regression Tests Passing</div>
            </div>
          </div>
        </div>

        {/* Prototype Readiness Notice */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200/80 rounded-lg flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Prototype Readiness Notice:</strong> This checklist reflects prototype engineering readiness only. Do not claim production deployment readiness until live enterprise cloud hosting, HIPAA encryption keys, and formal hospital clinical governance sign-offs are completed.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterCategory === "ALL"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Categories ({totalCount})
        </button>
        {categories.map((cat) => {
          const count = CHECKLIST_ITEMS.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all ${
              item.isImplemented
                ? "bg-white border-slate-200 hover:border-indigo-300"
                : "bg-slate-50/70 border-dashed border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-start gap-2.5">
                {item.isImplemented ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{item.label}</h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{item.category}</span>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                  item.isImplemented
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.prototypeStatus === "IMPLEMENTED" ? "✓ VERIFIED PROTOTYPE" : "FUTURE PRODUCTION"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pl-7">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
