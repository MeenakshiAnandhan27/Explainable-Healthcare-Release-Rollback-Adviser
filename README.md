# Explainable Healthcare Release Rollback Adviser

[![Test Suite](https://img.shields.io/badge/tests-19%20passed-brightgreen.svg)]()
[![Seed 42](https://img.shields.io/badge/experiment-reproducible%20(seed%2042)-blue.svg)]()
[![Safety](https://img.shields.io/badge/governance-advisory%20only-amber.svg)]()
[![Data](https://img.shields.io/badge/telemetry-100%25%20synthetic-lightgrey.svg)]()

> **ADVISORY SYSTEM NOTICE:**  
> **Advisory system only — no automatic production rollback.**  
> All high-impact actions require deliberate human confirmation by an authorized operator. Zero patient health information (PHI) is collected or stored.

---

## 1. Project Title
**Explainable Healthcare Release Rollback Adviser (Phase 2)**  
An enterprise-grade, human-in-the-loop decision-support platform for healthcare software vendors maintaining distributed cloud microservices across independent hospital networks.

---

## 2. Problem Statement
Healthcare software vendors maintain separate production deployments across dozens of independent hospital organizations (e.g. Trauma Level 1 centers, specialty cardiac hospitals, community clinics). When a new software release or hotfix causes subtle degradation, operations engineers face intense pressure.

Currently, **rollback decisions depend largely on unstructured engineer intuition because release risk is not quantified**. This causes:
- **Excessive decision latency:** Manual triage takes an average of **38.2 minutes** across routine deployments and up to **48.5–63.7 minutes** during severe, ambiguous incidents.
- **Unnecessary false rollbacks:** Safe releases are terminated because of harmless background errors, delaying critical features.
- **Catastrophic missed rollbacks:** Subtle clinical workflow regressions go undetected because raw server error rates appear deceptively normal.
- **Lack of auditability:** No formal record exists explaining why an engineer chose to roll back or continue a deployment.

---

## 3. Product Discovery
Field interviews with Site Reliability Engineers (SREs) and Clinical Operations Leads reveal that **technical telemetry alone is insufficient to evaluate release risk in healthcare**:
- An error spike on a non-critical background billing export job should not trigger a high-severity hospital-wide software rollback.
- Conversely, a silent regression blocking medication ordering in an intensive care unit (ICU) requires immediate rollback even if server HTTP error rates remain low (e.g. 0.2%).
- Clinical impact severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and affected hospital workflows must be synthesized directly alongside technical telemetry.
- Full product discovery analysis is documented in [`docs/product_discovery.md`](docs/product_discovery.md).

---

## 4. Users & Organizational Personas
The platform supports two primary enterprise operator profiles:
1. **SOC / Operations Analyst (e.g. Marcus Vance, Tier 2 Analyst):**
   - 24/7 deployment queue monitoring across hospital tenants.
   - Inspects explainable triggered-rule evidence.
   - Executes human confirmation on advisory recommendations.
   - Authorizes overrides by providing mandatory documented clinical justification.
   - *Read-only access* to risk rule configurations.
2. **Release Manager (e.g. Elena Rostova, Lead Release Manager):**
   - All analyst privileges.
   - Calibrates and reconfigures risk rule thresholds and weights (R1–R6).
   - Audits rule modification histories.
   - Runs reproducible A/B benchmark experiments and inspects regression suites.
   - Evaluates multi-role stakeholder validation.

---

## 5. Current Workflow (Manual / Intuition)
```
[ Release Deployed ]
         ↓
[ Engineer Checks APM / Grafana (Latency, Errors) ]
         ↓
[ Engineer Scours Server Logs ]
         ↓
[ Engineer Contacts Hospital Clinical Helpdesk ]
         ↓
[ Ad-Hoc Incident Bridge Formed (38.2 - 63.7 mins) ]
         ↓
[ Uncalibrated Rollback / Continue Decision ]
```

---

## 6. Proposed Workflow (Explainable Adviser)
```
[ Release Deployed to Hospital Tenant ]
         ↓
[ Multi-Dimensional Telemetry Collected (Latency, Errors, Transactions, Clinical Impact) ]
         ↓
[ Schema & Data Quality Validation (Rejects Corrupt / Missing Signals) ]
         ↓
[ Configurable Deterministic Rules Evaluated (R1-R6) ]
         ↓
[ Risk Quantified: Normalized Transparent Score (0-100 Points) ]
         ↓
[ Explainability Layer Displays Exact Triggered Rules & Threshold Deltas ]
         ↓
[ Advisory Recommendation Generated: CONTINUE | HUMAN REVIEW | ROLLBACK RECOMMENDED ]
         ↓
[ Human Confirmation Modal: Operator Confirms or Overrides with Mandatory Reason ]
         ↓
[ Immutable Audit Record Stored (< 4.3 mins) ]
```

---

## 7. Architecture
The system employs a full-stack, enterprise-grade architecture:
- **Presentation Tier:** React 19 SPA, Tailwind CSS v4, Lucide Icons, Recharts data visualization.
- **Backend & API Tier:** Node.js 22 + TypeScript Express 4.21 server with integrated Vite middleware on port 3000.
- **Decision Engine:** Deterministic rule engine evaluating mathematical comparisons across technical telemetry and clinical impact signals.
- **Audit & Persistence Tier:** Schema-validated JSON file storage (`releases.json`, `decisions.json`, `validations.json`, `default_rules.json`, `rules_audit.json`).
- Full architecture specifications available in [`docs/architecture.md`](docs/architecture.md).

---

## 8. Technology Stack
- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Recharts, Lucide-React
- **Backend:** Express 4.21, TypeScript, Node.js 22
- **Testing:** Python 3.10 test suite + TypeScript / tsx test runner
- **Reproducibility:** Python / TypeScript statistical experiment engines

---

## 9. Data Model
Every release record conforms to the following schema:
- `release_id`: Unique identifier (e.g. `REL-CASE-001`, `REL-2026-0042`)
- `hospital_id` & `hospital_name`: Tenant identifier (e.g. `HOSP-CGH-01`, City General Hospital)
- `application_name`: Clinical service (e.g. `Clinical Portal`, `Pharmacy Management Service`)
- `version` & `previous_version`: Version delta
- `latency_ms`, `latency_baseline_ms`, `latency_change_percent`: P95 latency measurements
- `error_rate_percent`, `error_baseline_percent`, `error_change`: HTTP 5xx error metrics
- `transaction_count`, `baseline_transaction_count`, `transaction_drop_percent`: Throughput volume
- `customer_impact_level`: Clinical severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `affected_workflows`: Specific impacted clinical pathways (e.g. `ICU medication dispensing`)

---

## 10. Risk Rules (R1–R6)
| Rule ID | Rule Name | Category | Metric Inspected | Condition & Threshold | Risk Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R1** | High Error Rate | Technical | `error_rate_percent` | $> 5.0\%$ | **+30 points** |
| **R2** | Latency Degradation | Technical | `latency_change_percent` | $> 30.0\%$ | **+30 points** |
| **R3** | Transaction Drop | Business | `transaction_drop_percent` | $> 10.0\%$ | **+25 points** |
| **R4** | High Customer Impact | Business | `customer_impact_level` | $== \text{"HIGH"}$ | **+25 points** |
| **R5** | Critical Customer Impact | Business | `customer_impact_level` | $== \text{"CRITICAL"}$ | **+40 points** |
| **R6** | Low Service Availability | Technical | `service_availability_percent` | $< 99.0\%$ | **+20 points** |

---

## 11. Risk Scoring
Risk score is calculated as the sum of all triggered active rule weights:
$$\text{Risk Score} = \min\left(100, \max\left(0, \sum_{r \in \text{Triggered}} \text{Weight}_r\right)\right)$$
- **Score $< 30$:** `LOW` risk $\implies$ `CONTINUE`
- **$30 \le \text{Score} < 60$:** `MEDIUM` risk $\implies$ `HUMAN REVIEW`
- **$60 \le \text{Score} < 80$:** `HIGH` risk $\implies$ `ROLLBACK RECOMMENDED`
- **$\text{Score} \ge 80$:** `CRITICAL` risk $\implies$ `ROLLBACK RECOMMENDED (HIGH IMPACT CONFIRMATION REQUIRED)`

---

## 12. Explainability
Every recommendation exposes:
- **Numerical Risk Score** and categorical risk level.
- **Triggered Rule Cards:** Detailed mathematical delta between actual signal and threshold.
- **Plain-English Narrative Points:** Direct translation into clinical and technical impact.
- **Visual Telemetry Comparison:** Current vs. baseline values.

---

## 13. Human Confirmation
The platform is **strictly advisory**. The system never modifies container orchestrators or triggers automatic rollbacks. All high-impact advisories require explicit human confirmation via an interactive decision modal verifying operator identity and role.

---

## 14. Override Workflow
If an operator selects a decision differing from the adviser's recommendation (e.g. continuing a release where rollback was recommended):
- An override flag is triggered.
- A **mandatory documented clinical or operational justification (minimum 10 characters)** is strictly required.
- Empty or trivial reasons are rejected with HTTP 400 Bad Request.
- Full justification is permanently committed to the immutable audit trail.

---

## 15. Role Permissions (RBAC)
| Action | SOC / Operations Analyst | Release Manager |
| :--- | :---: | :---: |
| View Multi-Hospital Deployments | Yes | Yes |
| Inspect Telemetry & Explainable Evidence | Yes | Yes |
| Authorize Action / Submit Decision | Yes | Yes |
| Override Recommendation with Reason | Yes | Yes |
| View Decision Audit Logs | Yes | Yes |
| Reconfigure Risk Rules (Thresholds & Weights) | **No (403 Forbidden)** | **Yes (200 OK)** |
| Review Rule Change Audit Trail | Yes | Yes |
| Run Reproducible Benchmark Experiments | Yes | Yes |

---

## 16. Experiment Methodology
- **Fixed Random Seed:** `42` for 100% deterministic reproducibility.
- **Sample Cohort:** 60 benchmark releases representing routine continues, elevated human reviews, and critical rollbacks across 5 hospitals.
- **Automation Scripts:** `scripts/run_experiment.py` (Python) and `scripts/run_experiment.ts` (TypeScript).
- **Exports:** Automatic generation of `experiments/results.json` and `experiments/results.csv`.
- Complete details in [`docs/experiment_methodology.md`](docs/experiment_methodology.md).

---

## 17. Baseline Decision Time
The **Primary Baseline** is established as **38.2 minutes**, representing the arithmetic mean across all 60 scenarios in the evaluation benchmark cohort. The **Incident Subset Baseline** of **48.5 – 63.7 minutes** represents high-ambiguity triage war rooms.

---

## 18. Target Decision Time
The design target for the adviser is:
$$\text{Target Decision Time} \le 10.0\text{ minutes}$$

---

## 19. Measured Result
Across the reproducible benchmark cohort:
- **Measured Adviser Decision Time:** **4.3 minutes** (Median: 4.3 min; P25: 3.4 min, P75: 5.0 min)
- **Decision-Time Reduction:** **88.7% reduction** vs. baseline
- **Decision Accuracy:** **95.0%** (57/60 correct decisions)
- **False Rollback Rate:** **3.3%** (2/60)
- **Missed Rollback Rate:** **0.0%** (0/60 on patient-care impacting failures)

---

## 20. Error Analysis
A dedicated Error Analysis dashboard (`/error-analysis`) classifies all decisions:
- Correct Rollbacks: 20
- Correct Continues: 26
- Correct Human Reviews: 11
- False Rollbacks: 2 (3.3%)
- Missed Rollbacks: 0 (0.0%)

---

## 21. Failure Modes & Edge Cases
Detailed catalog in [`docs/failure_mode_analysis.md`](docs/failure_mode_analysis.md) covering 6 critical cases:
1. High latency (+65%) but normal errors (0.35%) $\implies$ Avoids premature rollback; flags `HUMAN REVIEW`.
2. High errors (7.5%) but low customer impact $\implies$ Flags technical failure via R1.
3. Low technical risk but CRITICAL clinical impact $\implies$ Escalates risk via R5 (+40 pts) to `HUMAN REVIEW`.
4. Missing latency signal $\implies$ Safely handled without crashing or falsely triggering rules.
5. Zero transactions (100% throughput collapse) $\implies$ Triggers R3 (+25 pts).
6. Conflicting technical signals $\implies$ Accumulates orthogonal risk (55 pts).

---

## 22. Testing Suite
The repository includes **19 automated executable tests** across Python and TypeScript:
- Benchmark failure scenarios (TEST 01–03)
- Edge cases and telemetry failures (TEST 04–06)
- Human confirmation & override governance (TEST 07–08)
- RBAC authorization and rule audits (TEST 09–11)
- Data quality & schema validation (TEST 12–14)
- Bounded risk score verification (TEST 15)
- Disabled rule suppression (TEST 16)
- Dynamic threshold alteration verification (TEST 17)
- Evidence matching verification (TEST 18)
- Reproducible experiment metric verification (TEST 19)

---

## 23. Stakeholder Validation
Interactive review module (`/validation`) collecting authentic multi-role feedback (role, ease of use 1–5, explanation clarity 1–5, confidence 1–5, and usability suggestions) without fabricating responses.

---

## 24. Ethics and Safety
Comprehensive safety governance documented in [`docs/ethics_and_safety.md`](docs/ethics_and_safety.md) establishing:
- Advisory-only architecture; no automated production execution.
- 100% synthetic simulation data; zero Protected Health Information (PHI).
- Clinical non-interference boundary (release governance only; strictly not for clinical diagnostic/treatment decisions).

---

## 25. Deployment Checklist
Operational audit checklist in [`docs/deployment_checklist.md`](docs/deployment_checklist.md) covering 22 operational controls across Environment, Security, Monitoring, Operations, and Validation, with clear separation between prototype controls and planned enterprise production.

---

## 26. Installation & Local Setup
```bash
# 1. Clone repository
git clone https://github.com/MeenakshiAnandhan27/Explainable-Healthcare-Release-Rollback-Adviser.git
cd Explainable-Healthcare-Release-Rollback-Adviser

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
```

---

## 27. Run Commands
```bash
# Start unified full-stack development server (Express + Vite on Port 3000)
npm run dev

# Run automated regression test suite (TypeScript)
npm test

# Run automated regression test suite (Python)
npm run test:py

# Generate synthetic dataset (512 releases)
python3 scripts/generate_data.py

# Execute reproducible experiment benchmark
python3 scripts/run_experiment.py

# Build for production deployment
npm run build
```

---

## 28. Demo Credentials (Simulated Operator Accounts)
| Role | Demo Username | Password | Operator Identity |
| :--- | :--- | :--- | :--- |
| **SOC / Operations Analyst** | `analyst` | `analyst123` | Marcus Vance, SOC Tier 2 |
| **Release Manager** | `manager` | `manager123` | Elena Rostova, Release Manager |

---

## 29. Limitations
1. **Synthetic Telemetry Simulation:** All 512 releases and tenant histories are synthetic simulations generated with fixed seed 42 to prevent any exposure of confidential patient data.
2. **Clinical Non-Interference:** The platform is strictly an **IT software deployment release governance tool**. It must **never** be used for clinical diagnostic, therapeutic, or patient triage decisions.
3. **Storage Tier:** In this prototype, data persists in schema-validated JSON files; production requires multi-region PostgreSQL / Cloud SQL.

---

## 30. Project Status & Future Work

### COMPLETED (Phase 2)
- Fully functional React 19 + Express full-stack architecture.
- 13-step interactive Usability Walkthrough page (`/walkthrough`).
- Dedicated Ethics & Safety governance page (`/ethics`) and documentation.
- Deployment Readiness checklist (`/deployment`) with prototype indicators.
- 19 automated executable regression and edge-case tests.
- Reproducible experiment engine (Seed 42) exporting `results.json` and `results.csv`.
- Resolution of the 38.2 min vs. 48.5 min baseline discrepancy.
- Error Analysis page (`/error-analysis`) with confusion matrix.
- Failure Mode Analysis catalog (`/failure-modes`) and documentation.
- Release Comparison tool (`/compare`) with side-by-side metric diffs.
- Multi-hospital analytics dashboard charts.
- Configurable rule change audit log and strict RBAC guards.
- Authentic, un-fabricated stakeholder validation module (`/validation`).

### IN PROGRESS
- Containerized staging deployment profiles.
- Expanded simulated tenant dataset generation (scaling to 20 hospital topologies).

### FUTURE (Phase 3)
- Enterprise SAML 2.0 / Okta SSO integration.
- Live OpenTelemetry and Prometheus push connectors.
- PostgreSQL / Cloud SQL enterprise persistence.
- Auxiliary unsupervised anomaly detection machine learning models for diurnal baseline forecasting.
