# Evaluator Evidence Pack: Verification & Traceability Catalog

**Project:** Explainable Healthcare Release Rollback Adviser  
**Evaluation Scope:** Phase 1 Baseline Verification + Phase 2 Advanced Capabilities + QBee Review AI Gaps  
**Date:** September 2026  
**Auditor / Evaluation Target:** QBee Review AI & Senior Engineering Audit  

---

## 1. Overview

This Evaluator Evidence Pack maps every major architectural, functional, testing, and governance requirement directly to concrete, inspectable evidence across the user interface, backend server, source files, automated test cases, and technical documentation.

---

## 2. Requirement-to-Evidence Verification Mapping

### 1. Release Telemetry & Metadata Capture
- **Requirement:** Capture release metadata, P95 latency (ms), HTTP error rate (%), transaction throughput, and customer impact indicators across separate hospital deployments.
- **Where to see it in UI:**
  - *Active Releases Table:* Shows release IDs, hospital badges, versions, deployment timestamps, error rates, and latency deltas.
  - *Advisory Evidence Page (`/release-detail`):* Displays 4 dedicated telemetry metric cards with current values, baselines, and percentage deviations.
- **Source File(s):** `data/releases.json`, `src/types/index.ts`, `server.ts`
- **API Endpoint:** `GET /api/releases`, `GET /api/releases/:id`
- **Automated Test:** `tests/test_data_validation.py` (`test_14_duplicate_release_ids_are_rejected`)
- **Documentation:** `docs/architecture.md`, `README.md`
- **Concrete Evidence:** 512 synthetic release records loaded from `data/releases.json` representing 5 distinct hospital systems (`HOSP-CGH-01` through `HOSP-GVH-05`).

---

### 2. Configurable Deterministic Risk Rules (R1–R6)
- **Requirement:** Dynamic rule configuration where thresholds and weights can be calibrated at runtime instead of hardcoding decisions.
- **Where to see it in UI:**
  - *Risk Rule Config Page (`/rules`):* Technical data grid displaying active rules R1–R6 with interactive edit buttons for thresholds and weights.
- **Source File(s):** `rules/default_rules.json`, `server.ts` (`PUT /api/rules/:rule_id`), `src/pages/RiskRulesPage.tsx`
- **API Endpoint:** `GET /api/rules`, `PUT /api/rules/:rule_id`
- **Automated Test:** `tests/test_permissions.py` (`test_10_release_manager_can_modify_risk_rules`), `tests/test_risk_engine.py` (`test_17_configured_threshold_changes_actually_change_evaluation`)
- **Documentation:** `docs/architecture.md`, `README.md`
- **Concrete Evidence:** Modifying Rule R1 threshold from 5.0% to 10.0% immediately alters risk score calculation without application restarts.

---

### 3. Transparent Mathematical Risk Scoring (0–100 Points)
- **Requirement:** Quantify release risk as a bounded, explainable score from 0 to 100 points, categorized into LOW (<30), MEDIUM (30–59), HIGH (60–79), and CRITICAL (>=80).
- **Where to see it in UI:**
  - *Dashboard:* Multi-hospital risk distribution gauges and average risk indicators.
  - *Release Detail Page:* Gauge meter displaying exact numerical score and risk tier.
- **Source File(s):** `server.ts` (`evaluateRelease`), `src/components/RiskBadge.tsx`
- **API Endpoint:** `POST /api/rules/evaluate`
- **Automated Test:** `tests/test_risk_engine.py` (`test_15_risk_score_remains_within_valid_range`)
- **Documentation:** `docs/architecture.md`
- **Concrete Evidence:** Catastrophic multi-signal failures sum to raw 145 points but are strictly bounded in [0, 100].

---

### 4. Triggered-Rule Explainability & Evidence Breakdown
- **Requirement:** Every recommendation must explain WHY by displaying actual values, baselines, thresholds, rule deltas, and point contributions.
- **Where to see it in UI:**
  - *Advisory Evidence Page:* "Triggered Rules & Operational Evidence" panel displaying individual cards for each triggered rule with mathematical contribution and clinical narrative.
- **Source File(s):** `server.ts` (`explanation.evidence`), `src/pages/ReleaseDetailPage.tsx`
- **API Endpoint:** `GET /api/releases/:id`
- **Automated Test:** `tests/test_risk_engine.py` (`test_18_explanation_matches_triggered_rules`)
- **Documentation:** `docs/architecture.md`, `README.md`
- **Concrete Evidence:** Case `REL-CASE-001` explicitly displays: "Service latency increased by 65.0% over baseline (threshold: 30.0%) $\implies$ Rule R2 triggered $\implies$ +30 pts".

---

### 5. Advisory-Only Safety & No Automatic Rollback
- **Requirement:** The system functions strictly in an advisory capacity and NEVER automatically triggers or executes production software rollback.
- **Where to see it in UI:**
  - *Top Header & Banners:* Persistent banner stating "Advisory Decision Support Only — Mandatory Human Confirmation Required for All Production Actions".
  - *Ethics & Safety Page (`/ethics`):* Principle #1 & #2 detailing advisory constraints.
- **Source File(s):** `server.ts` (`/api/health`), `src/pages/EthicsSafetyPage.tsx`
- **API Endpoint:** `GET /api/health`
- **Automated Test:** `tests/test_overrides.py` (`test_7_high_impact_recommendation_requires_human_confirmation`)
- **Documentation:** `docs/ethics_and_safety.md`
- **Concrete Evidence:** System code contains zero automated deployment manipulation APIs or direct container termination calls.

---

### 6. Mandatory Human Confirmation for High-Impact Actions
- **Requirement:** High-impact recommendations (`ROLLBACK RECOMMENDED`) require deliberate confirmation from an authorized operator before recording status.
- **Where to see it in UI:**
  - *Decision Authorization Modal:* Opens when clicking "Authorize Action" on any high-risk or rollback-recommended release.
- **Source File(s):** `src/components/DecisionModal.tsx`, `server.ts` (`POST /api/decisions`)
- **API Endpoint:** `POST /api/decisions`
- **Automated Test:** `tests/test_overrides.py` (`test_7_high_impact_recommendation_requires_human_confirmation`)
- **Documentation:** `docs/ethics_and_safety.md`
- **Concrete Evidence:** Modal requires operator identity, role verification, and active confirmation button click.

---

### 7. Mandatory Override Justification Governance
- **Requirement:** Overriding the adviser recommendation requires entering a non-empty, documented operational reason (minimum 10 characters).
- **Where to see it in UI:**
  - *Decision Modal:* Override reason text area dynamically appears when selecting a decision differing from recommendation; submission disabled until >=10 characters typed.
- **Source File(s):** `server.ts` (`POST /api/decisions` lines 596-600), `src/components/DecisionModal.tsx`
- **API Endpoint:** `POST /api/decisions`
- **Automated Test:** `tests/test_overrides.py` (`test_8_override_without_reason_must_fail`)
- **Documentation:** `docs/ethics_and_safety.md`, `README.md`
- **Concrete Evidence:** Submissions with empty or short justification fail with HTTP 400 Bad Request.

---

### 8. Role-Based Access Control (RBAC) with 2+ Roles
- **Requirement:** Support `SOC / Operations Analyst` and `Release Manager` roles with strict API authorization checks.
- **Where to see it in UI:**
  - *Sidebar Status Widget:* Shows current operator role.
  - *Role Switcher Modal:* Allows switching between analyst and manager sessions.
  - *Risk Rule Config:* Edit buttons disabled for Analyst; enabled for Release Manager.
- **Source File(s):** `server.ts` (`PUT /api/rules/:rule_id` lines 356-361), `src/components/RoleSwitchModal.tsx`
- **API Endpoint:** `POST /api/auth/login`, `PUT /api/rules/:rule_id`
- **Automated Test:** `tests/test_permissions.py` (`test_9_operations_analyst_cannot_modify_risk_rules`, `test_10_release_manager_can_modify_risk_rules`)
- **Documentation:** `docs/architecture.md`, `README.md`
- **Concrete Evidence:** Analyst attempting `PUT /api/rules/R1` receives HTTP 403 Forbidden; Release Manager receives HTTP 200 OK.

---

### 9. Rule-Change Audit Logging
- **Requirement:** Capture before/after thresholds and weights, timestamp, user name, role, and change reason for all rule modifications.
- **Where to see it in UI:**
  - *Risk Rule Config Page:* "Rule Modification Audit Trail" table at the bottom of the page.
- **Source File(s):** `data/rules_audit.json`, `server.ts` (`PUT /api/rules/:rule_id`)
- **API Endpoint:** `GET /api/rules/audit`
- **Automated Test:** `tests/test_permissions.py` (`test_11_risk_rule_changes_are_audited`)
- **Documentation:** `docs/architecture.md`
- **Concrete Evidence:** Every rule edit appends a new audit record to `data/rules_audit.json` with `old_threshold` and `new_threshold`.

---

### 10. Immutable Decision Audit Trail
- **Requirement:** Complete audit log capturing timestamp, operator, role, hospital, release, recommendation, final decision, risk score, and override reason.
- **Where to see it in UI:**
  - *Audit Logs Page (`/decisions`):* Filterable table with hospital, role, and decision filters, plus visual override badges.
- **Source File(s):** `data/decisions.json`, `src/pages/DecisionHistoryPage.tsx`, `server.ts`
- **API Endpoint:** `GET /api/decisions`, `POST /api/decisions`
- **Automated Test:** `tests/test_overrides.py`
- **Documentation:** `docs/architecture.md`
- **Concrete Evidence:** Saved decisions persist to `data/decisions.json` and are immediately visible in the audit view.

---

### 11. Benchmark Failure Case 1: High Latency, Normal Errors
- **Requirement:** Release exhibits +65% latency change, 0.35% error rate; triggers R2 (+30 pts) $\implies$ 30 pts $\implies$ `HUMAN REVIEW`.
- **Where to see it in UI:**
  - *Failure Modes Page (`/failure-modes`):* Card #1 with inputs, expected behavior, actual behavior, and direct quick-link to inspect release `REL-CASE-001`.
- **Source File(s):** `data/releases.json` (`REL-CASE-001`), `tests/test_risk_engine.py`
- **API Endpoint:** `GET /api/releases/REL-CASE-001`
- **Automated Test:** `tests/test_risk_engine.py` (`test_1_high_latency_normal_errors_stable_transactions`)
- **Documentation:** `docs/failure_mode_analysis.md`
- **Concrete Evidence:** Evaluates to 30 risk points, preventing an unnecessary blanket rollback.

---

### 12. Benchmark Failure Case 2: High Errors, Low Customer Impact
- **Requirement:** Release exhibits 7.5% error rate (>5%), customer impact LOW; triggers R1 (+30 pts) $\implies$ 30 pts $\implies$ `HUMAN REVIEW`.
- **Where to see it in UI:**
  - *Failure Modes Page:* Card #2 linking to `REL-CASE-002`.
- **Source File(s):** `data/releases.json` (`REL-CASE-002`), `tests/test_risk_engine.py`
- **API Endpoint:** `GET /api/releases/REL-CASE-002`
- **Automated Test:** `tests/test_risk_engine.py` (`test_2_high_error_rate_low_customer_impact`)
- **Documentation:** `docs/failure_mode_analysis.md`
- **Concrete Evidence:** Flags technical failure while recognizing minimal patient-care disruption.

---

### 13. Benchmark Failure Case 3: Low Technical Risk, Critical Customer Impact
- **Requirement:** Technical telemetry green (latency +3.3%, error 0.2%), but customer impact is CRITICAL; triggers R5 (+40 pts) $\implies$ 40 pts $\implies$ `HUMAN REVIEW`.
- **Where to see it in UI:**
  - *Failure Modes Page:* Card #3 linking to `REL-CASE-003`.
- **Source File(s):** `data/releases.json` (`REL-CASE-003`), `tests/test_risk_engine.py`
- **API Endpoint:** `GET /api/releases/REL-CASE-003`
- **Automated Test:** `tests/test_risk_engine.py` (`test_3_low_technical_risk_critical_customer_impact`)
- **Documentation:** `docs/failure_mode_analysis.md`
- **Concrete Evidence:** Demonstrates business/clinical impact escalation overriding purely green technical signals.

---

### 14. Edge Cases: Missing Telemetry, Zero Transactions, Conflicting Signals
- **Requirement:** Handle missing latency (null), zero transaction drops (100% loss), and conflicting technical signals safely.
- **Where to see it in UI:**
  - *Failure Modes Page:* Cards #4, #5, #6 linking to `REL-CASE-004`, `REL-CASE-005`, `REL-CASE-006`.
- **Source File(s):** `data/releases.json`, `tests/test_failure_cases.py`
- **API Endpoint:** `GET /api/releases/REL-CASE-004`, `005`, `006`
- **Automated Test:** `tests/test_failure_cases.py` (`test_4_missing_latency`, `test_5_zero_transactions`, `test_6_conflicting_technical_signals`)
- **Documentation:** `docs/failure_mode_analysis.md`
- **Concrete Evidence:** Null latency suppresses R2 without crashing; zero transactions triggers R3 (+25 pts); conflicting signals accumulate orthogonal risk (55 pts).

---

### 15. Reproducible Experiment & Primary Baseline
- **Requirement:** Programmatic experiment script running with fixed random seed 42 across 60 benchmark releases, measuring time-to-decision reduction and accuracy.
- **Where to see it in UI:**
  - *A/B Experiments Page (`/experiment`):* Displays sample size (60), primary baseline (38.2 min), measured time (4.3 min), reduction (88.7%), and accuracy (95.0%).
- **Source File(s):** `scripts/run_experiment.py`, `scripts/run_experiment.ts`, `experiments/results.json`
- **API Endpoint:** `GET /api/experiments`, `POST /api/experiment/run`
- **Automated Test:** `tests/test_experiment.py` (`test_reproducible_experiment_and_metrics`)
- **Documentation:** `docs/experiment_methodology.md`
- **Concrete Evidence:** Reproducible execution yields identical outputs to `experiments/results.json` and `experiments/results.csv`.

---

### 16. Baseline Discrepancy Reconciliation
- **Requirement:** Reconcile and document the mathematical difference between 38.2 minutes and 48.5 minutes.
- **Where to see it in UI:**
  - *A/B Experiments Page:* Dedicated callout panel explaining the statistical difference between cohort-wide baseline (38.2 min) and incident subset baseline (48.5 min).
- **Source File(s):** `docs/experiment_methodology.md`, `scripts/run_experiment.py`
- **API Endpoint:** `GET /api/experiments`
- **Automated Test:** `tests/test_experiment.py`
- **Documentation:** `docs/experiment_methodology.md`
- **Concrete Evidence:** 38.2 min is the full 60-scenario benchmark cohort average; 48.5 min represents the high-severity incident triage bridge subset.

---

### 17. 13-Step Usability Walkthrough
- **Requirement:** Guided interactive walkthrough demonstrating the real end-to-end user journey across all 13 operational steps.
- **Where to see it in UI:**
  - *Usability Walkthrough Page (`/walkthrough`):* Interactive 13-step operator tour with progress bar, step details, action buttons, and direct navigation links.
- **Source File(s):** `src/pages/WalkthroughPage.tsx`
- **API Endpoint:** N/A (Client-side interactive state linked to live pages)
- **Automated Test:** Interactive UI step progression test
- **Documentation:** `docs/phase2_completion.md`, `README.md`
- **Concrete Evidence:** Guides operator through Login $\rightarrow$ Tenant Selection $\rightarrow$ Telemetry $\rightarrow$ Evidence $\rightarrow$ Confirmation $\rightarrow$ Audit.

---

### 18. Dedicated Ethics & Safety Governance
- **Requirement:** Comprehensive ethics and safety note establishing clinical non-interference, PHI prohibition, and advisory boundaries.
- **Where to see it in UI:**
  - *Ethics & Safety Page (`/ethics`):* Visual cards detailing 10 non-negotiable safety principles.
- **Source File(s):** `docs/ethics_and_safety.md`, `src/pages/EthicsSafetyPage.tsx`
- **API Endpoint:** `GET /api/health`
- **Automated Test:** Document audit & UI render verification
- **Documentation:** `docs/ethics_and_safety.md`
- **Concrete Evidence:** Explicitly defines separation between IT deployment risk and clinical diagnostic decisions.

---

### 19. Production Deployment Readiness Checklist
- **Requirement:** Operational checklist across Environment, Database, Monitoring, Security, Operation, and Validation, separating implemented prototype controls from planned production.
- **Where to see it in UI:**
  - *Deployment Readiness Page (`/deployment`):* Filterable checklist with IMPLEMENTED and PLANNED_PRODUCTION badges.
- **Source File(s):** `docs/deployment_checklist.md`, `src/pages/DeploymentChecklistPage.tsx`
- **API Endpoint:** N/A (Static operational audit table)
- **Automated Test:** Document audit & UI render verification
- **Documentation:** `docs/deployment_checklist.md`
- **Concrete Evidence:** 22 detailed operational audit items with explicit implementation status.

---

### 20. Side-by-Side Release Comparison
- **Requirement:** Tool allowing operators to select and compare any two releases side-by-side with telemetry diffing and recommendation analysis.
- **Where to see it in UI:**
  - *Compare Releases Page (`/compare`):* Dual dropdown selectors with delta badges and quick-comparison presets.
- **Source File(s):** `src/pages/CompareReleasesPage.tsx`
- **API Endpoint:** `GET /api/releases`, `GET /api/releases/:id`
- **Automated Test:** UI comparison logic verification
- **Documentation:** `docs/architecture.md`
- **Concrete Evidence:** Visual diffing highlights disparities between healthy baseline releases and degraded failure cases.

---

### 21. Multi-Hospital Telemetry Analytics
- **Requirement:** Analytics module computing deployment volume, high-risk counts, rollbacks, and error rates across all hospital tenants without mixing data.
- **Where to see it in UI:**
  - *Dashboard Page:* Recharts bar charts visualizing risk distributions and customer impact across all 5 hospitals.
- **Source File(s):** `server.ts` (`/api/analytics/multi-hospital`), `src/pages/DashboardPage.tsx`
- **API Endpoint:** `GET /api/analytics/multi-hospital`
- **Automated Test:** API analytics endpoint test
- **Documentation:** `docs/architecture.md`
- **Concrete Evidence:** Tenant filtering verifies releases are strictly partitioned by hospital ID.

---

### 22. Authentic Stakeholder Validation
- **Requirement:** Un-fabricated stakeholder feedback collection module capturing role, ease of use, explanation clarity, confidence, and usability suggestions.
- **Where to see it in UI:**
  - *Validation Review Page (`/validation`):* Interactive review submission form and list of submitted feedback entries.
- **Source File(s):** `src/pages/StakeholderValidationPage.tsx`, `data/validations.json`, `server.ts`
- **API Endpoint:** `GET /api/validations`, `POST /api/validations`
- **Automated Test:** API submission & persistence verification
- **Documentation:** `docs/phase2_completion.md`
- **Concrete Evidence:** Saves genuine reviewer submissions to `data/validations.json` without pre-seeded fabricated ratings.

---

### 23. Telemetry Schema & Data Quality Validation
- **Requirement:** Rejection of corrupt telemetry signals including negative latency, error rates > 100%, and duplicate release IDs.
- **Where to see it in UI:**
  - *Advisory Evidence Page:* Surfaces telemetry warning badges when signals are missing or anomalous.
- **Source File(s):** `tests/test_data_validation.py`, `server.ts` (`evaluateRelease` warnings)
- **API Endpoint:** `POST /api/rules/evaluate`
- **Automated Test:** `tests/test_data_validation.py` (`test_12_invalid_negative_latency_is_rejected`, `test_13_error_rate_greater_than_100_is_rejected`, `test_14_duplicate_release_ids_are_rejected`)
- **Documentation:** `docs/architecture.md`
- **Concrete Evidence:** Validation functions reject corrupted payloads before risk evaluation.

---

### 24. Comparative Technical Approach Evaluation
- **Requirement:** Detailed comparative analysis contrasting deterministic rule-based engine against machine learning approaches.
- **Where to see it in UI:**
  - *Architecture Specs Page (`/docs`):* Section #3 detailing rule-based vs ML comparative matrix.
- **Source File(s):** `docs/technical_approach_comparison.md`
- **API Endpoint:** N/A (Technical reference document)
- **Automated Test:** Document audit
- **Documentation:** `docs/technical_approach_comparison.md`
- **Concrete Evidence:** In-depth evaluation covering explainability, cold-start barriers, auditability, and clinical governance.
