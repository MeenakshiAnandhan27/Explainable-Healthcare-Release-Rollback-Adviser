# Explainable Healthcare Release Rollback Adviser

[![Test Suite](https://img.shields.io/badge/tests-20%20passed-brightgreen.svg)]()
[![Seed 42](https://img.shields.io/badge/experiment-reproducible%20(seed%2042)-blue.svg)]()
[![Safety](https://img.shields.io/badge/governance-advisory%20only-amber.svg)]()
[![Data](https://img.shields.io/badge/telemetry-100%25%20synthetic-lightgrey.svg)]()

> **ADVISORY SYSTEM NOTICE:**  
> **Advisory decision support only — no automatic production rollback.**  
> The system provides quantitative risk scoring and explainable recommendations. All production actions require deliberate confirmation by an authorized human operator. Zero Protected Health Information (PHI) is ingested or stored.

---

## 1. Project Overview
The **Explainable Healthcare Release Rollback Adviser** is an enterprise-grade operational decision-support system designed for healthcare software vendors maintaining distributed cloud microservices across independent hospital networks (e.g. Trauma Level 1 centers, specialty cardiac hospitals, community regional clinics).

The platform replaces unstructured engineer intuition with a quantitative, transparent, and auditable release governance pipeline that synthesizes technical telemetry, business impact indicators, and clinical workflow criticality.

---

## 2. Problem Statement
In multi-tenant healthcare software environments, release rollback decisions currently depend heavily on subjective intuition because release risk is not quantified. This causes four acute operational failures:
1. **Excessive Triage Latency:** Manual war-room triage requires an average of **38.2 minutes** across routine deployments and up to **48.5–63.7 minutes** during complex incidents.
2. **Premature False Rollbacks:** Safe releases are terminated because of harmless background errors or transient cache warm-up latency, delaying critical clinical feature deliveries.
3. **Catastrophic Missed Rollbacks:** Subtle clinical workflow failures (e.g. ICU medication dispensing queues blocked) slip past monitoring because raw server error rates appear deceptively green (e.g. 0.2%).
4. **Zero Auditability:** Historical rollbacks lack documented clinical justifications and decision traces.

---

## 3. Objectives
- **Quantify Release Risk:** Compute a normalized, bounded risk score (0–100) combining technical telemetry and clinical workflow impact.
- **100% Explainable Recommendations:** Explain every recommendation with transparent mathematical evidence, threshold deltas, and narrative points.
- **Enforce Human Authority:** Maintain a strictly advisory boundary requiring human operator confirmation for high-impact actions.
- **Mandate Override Accountability:** Enforce documented operational justifications ($\ge 10$ characters) whenever an operator disagrees with the adviser.
- **Reduce Decision Latency:** Lower average decision time from **38.2 minutes down to $\le 10.0$ minutes** (achieved: **4.3 minutes**, an 88.7% reduction).
- **Zero Missed Rollbacks:** Eliminate missed rollbacks on patient-care impacting regressions (achieved: **0.0%** missed rollbacks).

---

## 4. Key Features
- **Multi-Hospital Telemetry Isolation:** Partitioned monitoring across 5 distinct hospital systems (`HOSP-CGH-01` through `HOSP-GVH-05`).
- **Configurable Deterministic Rules (R1–R6):** Dynamic runtime threshold and weight calibration with server-side RBAC guards.
- **Explainable Evidence Breakdown:** Granular telemetry inspection comparing observed signals, baselines, and safety thresholds.
- **Immutable Audit Logging:** Complete audit history capturing operator identity, timestamp, role, recommendation, and override justification.
- **Rule Modification Change Log:** Captures before/after threshold and weight state for every rule update.
- **13-Step Usability Walkthrough:** Interactive end-to-end operator tour (`/walkthrough`).
- **Side-by-Side Release Comparison:** Multi-release telemetry diffing and recommendation delta analysis (`/compare`).
- **Simulated Prometheus & Anomaly Detection:** Standard Prometheus metrics exposition (`/api/observability/prometheus`) and auxiliary statistical anomaly detection (`/api/observability/anomaly/:id`).

---

## 5. User Roles & RBAC Matrix
The system enforces strict Role-Based Access Control:

| Capability | SOC / Operations Analyst | Release Manager | Security Enforcement |
| :--- | :---: | :---: | :--- |
| **Inspect Release Telemetry & Evidence** | Yes | Yes | Read-only API |
| **Submit Decision / Authorize Action** | Yes | Yes | Payload identity validation |
| **Override Adviser Recommendation** | Yes | Yes | **Mandatory $\ge 10$ char justification** |
| **View Historical Audit Logs** | Yes | Yes | Filterable read-only access |
| **Reconfigure Risk Rules (R1–R6)** | **DENIED (403 Forbidden)** | **AUTHORIZED (200 OK)** | **Server-side RBAC Guard in `server.ts`** |
| **Review Rule Change History** | Yes | Yes | Full transparency |
| **Run Benchmark Experiments** | Yes | Yes | Statistical engine |

---

## 6. System Architecture
```
+---------------------------------------------------------------------------------------------------+
|                     Explainable Healthcare Release Rollback Adviser Architecture                  |
+---------------------------------------------------------------------------------------------------+

   +---------------------------------------------------------------------------------------------+
   |                                      DATA FLOW PIPELINE                                     |
   |                                                                                             |
   |   Release Telemetry           Schema Validation          Configurable Rules (R1-R6)         |
   |  [ Latency, Errors,   ]  ---> [ Type / Boundary /  ] ---> [ Deterministic Rule Engine ]        |
   |  [ Transactions, Cust ]       [ Null Signal Checks ]       [ Threshold & Weight Eval  ]        |
   |                                                                          |                  |
   |                                                                          v                  |
   |   Audit Trail & Storage        Human Oversight & Modal          Transparent Risk Score       |
   |  [ decisions.json      ] <--- [ Mandatory Confirm / ] <--- [ Points (0-100), Level   ]       |
   |  [ validations.json    ]      [ Override Justify    ]      [ Triggered Rule Evidence ]       |
   |  [ rules_audit.json    ]                                                                    |
   |                                              |                                              |
   |                                              v                                              |
   |                               [ Reproducible Experiment & Analytics ]                       |
   +---------------------------------------------------------------------------------------------+
```
Full technical architecture details are available in [`docs/architecture.md`](docs/architecture.md).

---

## 7. Technology Stack
- **Frontend SPA:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide-React, Recharts
- **Backend API:** Node.js 22, Express 4.21, TypeScript, `tsx`
- **Testing Suites:** Python 3.10 regression runner (`tests/run_all_tests.py`) + TypeScript runner (`npm test`)
- **Containerization & Staging:** Multi-stage `Dockerfile`, `docker-compose.yml`
- **Data Persistence:** Schema-validated JSON file storage (`data/` directory)

---

## 8. Data Flow
1. **Telemetry Ingestion:** Real-time metrics (P95 latency ms, error rate %, transaction volume, availability %, and clinical impact) ingested from hospital proxy.
2. **Sanitization:** Validates telemetry boundaries (rejecting negative latency and error rates $>100\%$).
3. **Rule Evaluation:** Evaluates active rules R1–R6 against thresholds.
4. **Scoring:** Bounded summation maps points to `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` risk tiers.
5. **Human Authorization:** Operator reviews triggered evidence cards and submits confirmation or justified override.
6. **Persistence:** Appends immutable decision record to `data/decisions.json`.

---

## 9. Risk Rules (R1–R6)
| Rule ID | Rule Name | Category | Metric Inspected | Condition & Threshold | Risk Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R1** | High Error Rate | Technical | `error_rate_percent` | $> 5.0\%$ | **+30 points** |
| **R2** | Latency Degradation | Technical | `latency_change_percent` | $> 30.0\%$ | **+30 points** |
| **R3** | Transaction Drop | Business | `transaction_drop_percent` | $> 10.0\%$ | **+25 points** |
| **R4** | High Customer Impact | Business | `customer_impact_level` | $== \text{"HIGH"}$ | **+25 points** |
| **R5** | Critical Customer Impact | Business | `customer_impact_level` | $== \text{"CRITICAL"}$ | **+40 points** |
| **R6** | Low Service Availability | Technical | `service_availability_percent` | $< 99.0\%$ | **+20 points** |

---

## 10. Explainability
Every recommendation exposes:
- **Numerical Risk Score (0–100):** Capped sum of active triggered rule weights.
- **Triggered Rule Cards:** Exact observed value, baseline, threshold, and mathematical contribution.
- **Clinical Narrative Points:** Plain-English summary explaining clinical impact.
- **Auxiliary Anomaly Indicator:** Statistical Z-score deviation analysis.

---

## 11. Human-in-the-Loop Workflow
- **Advisory Only:** No automatic rollback hooks exist in the codebase.
- **High-Impact Modal:** Recommendations of `ROLLBACK RECOMMENDED` require interactive operator authorization.
- **Mandatory Override Justification:** Diverging from the adviser requires a documented reason ($\ge 10$ characters). Empty justifications fail with HTTP 400 Bad Request.

---

## 12. API Documentation Summary
The application exposes **21 REST API endpoints**. Complete specifications are documented in [`docs/api.md`](docs/api.md).

| Category | Endpoints |
| :--- | :--- |
| **System & Health** | `GET /api/health` |
| **Authentication** | `POST /api/auth/login` |
| **Tenants & Catalogs** | `GET /api/hospitals`, `GET /api/releases`, `GET /api/releases/:id` |
| **Risk Rules & Engine**| `GET /api/rules`, `PUT /api/rules/:rule_id`, `GET /api/rules/audit`, `POST /api/rules/evaluate` |
| **Decisions & Audits** | `POST /api/decisions`, `GET /api/decisions` |
| **Analytics & KPIs** | `GET /api/dashboard/stats`, `GET /api/analytics/multi-hospital` |
| **Observability (P3)** | `GET /api/observability/prometheus`, `GET /api/observability/anomaly/:release_id` |
| **Experiments & Tests**| `GET /api/experiments`, `POST /api/experiment/run`, `POST /api/tests/run` |
| **Stakeholder Feedback**| `POST /api/validations`, `GET /api/validations` |

---

## 13. Data & Schema Documentation Summary
All data is stored in structured, schema-validated JSON files in `/data/` and `/rules/`. Complete specifications are documented in [`docs/data_schema.md`](docs/data_schema.md).
- **`data/releases.json`:** 512 synthetic multi-tenant hospital releases.
- **`data/decisions.json`:** Human authorization decisions and override justifications.
- **`rules/default_rules.json`:** Canonical R1–R6 rules.
- **`data/rules_audit.json`:** Before/after change logs for rule calibrations.
- **`data/validations.json`:** Authentic stakeholder feedback reviews.

---

## 14. Testing Instructions
The test suite consists of **20 automated executable tests** across Python and TypeScript. Full technical specifications in [`docs/testing.md`](docs/testing.md).

```bash
# Run TypeScript test suite (Node.js 22 runtime)
npm test

# Run Python 3.10 regression test suite
python3 tests/run_all_tests.py
# or via npm alias:
npm run test:py
```

---

## 15. Error Handling Architecture
- **React Error Boundary (`src/components/ErrorBoundary.tsx`):** Catches rendering exceptions safely, displaying an isolated recovery UI without crashing the dashboard.
- **Centralized Express Error Handler:** Standardizes error responses with status codes (`400`, `401`, `403`, `404`, `500`).
- **Telemetry Drop Handling:** Null signals are surfaced as warnings without false clean triggers.
- Full details in [`docs/error_handling.md`](docs/error_handling.md).

---

## 16. Experiment Instructions
```bash
# Run reproducible statistical experiment (Seed 42)
python3 scripts/run_experiment.py
# or via npm alias:
npm run experiment

# Generate expanded synthetic dataset (default: 512, configurable)
python3 scripts/generate_data.py --count 512 --seed 42
```
Outputs are exported to `experiments/results.json` and `experiments/results.csv`.  
Methodology and baseline reconciliation documented in [`docs/experiment_methodology.md`](docs/experiment_methodology.md).

---

## 17. Deployment Instructions
### Local Staging Deployment via Docker Compose
```bash
# 1. Build and run containerized staging environment
docker-compose up --build -d

# 2. Check service health
curl http://localhost:3000/api/health

# 3. View live container logs
docker-compose logs -f
```

### Standard Node.js Setup
```bash
npm install
npm run build
npm start
```
Full operational readiness audit available in [`docs/deployment_checklist.md`](docs/deployment_checklist.md).

---

## 18. Safety & Ethics Governance
- **Advisory System Boundary:** Strictly decision support; zero automated deployment actions.
- **Clinical Non-Interference:** Release governance only; strictly not for clinical diagnostic/treatment decisions.
- **Zero Real PHI:** All data is 100% synthetic simulation.
- Complete 10 safety mandates documented in [`docs/ethics_and_safety.md`](docs/ethics_and_safety.md).

---

## 19. Limitations
1. **Synthetic Telemetry Simulation:** All 512 releases and tenant histories are synthetic simulations generated with fixed seed `42` to guarantee zero PHI exposure.
2. **Clinical Non-Interference:** The platform is strictly an IT deployment release governance tool.
3. **Storage Tier:** Prototype persists data in schema-validated JSON files; enterprise production requires distributed PostgreSQL with Row-Level Security.

---

## 20. Phase 3 Additions & Enhancements
- **Unit Testing Technical Documentation:** Detailed test specifications and architectures in [`docs/testing.md`](docs/testing.md).
- **Error Boundary Documentation:** Comprehensive client/server error handling guide in [`docs/error_handling.md`](docs/error_handling.md).
- **Expanded REST API Reference:** Dedicated reference guide in [`docs/api.md`](docs/api.md).
- **Data Schema Documentation:** Entity relationship schemas and PostgreSQL DDL mappings in [`docs/data_schema.md`](docs/data_schema.md).
- **Staging Deployment Configuration:** Multi-stage `Dockerfile` and `docker-compose.yml`.
- **Scalable Data Generator:** Python CLI generator with `--count` and `--seed` arguments.
- **Simulated Prometheus Exposition:** Metrics endpoint at `/api/observability/prometheus`.
- **Auxiliary Statistical Anomaly Detection:** Modified Z-score anomaly detector mounted at `/api/observability/anomaly/:id` and visual card on Release Detail view.
- **Security & RBAC Documentation:** Complete privilege audit guide in [`docs/security.md`](docs/security.md).

---

## 21. Future Work (Phase 4 Enterprise Roadmap)
- Enterprise PostgreSQL / Cloud SQL migration with Row-Level Security (RLS).
- Live OpenTelemetry and Prometheus push connectors for Istio/Envoy service mesh.
- Enterprise SAML 2.0 / Okta SSO integration.
- Continuous multi-hospital canary analysis pipelines.
