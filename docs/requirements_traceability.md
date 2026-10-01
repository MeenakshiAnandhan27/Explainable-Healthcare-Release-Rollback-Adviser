# Requirements Traceability Matrix (RTM)

**Project:** Explainable Healthcare Release Rollback Adviser  
**Phase:** Phase 3 Completion & Quality Assurance Sign-Off  
**Date:** October 2026  
**Auditor / Target:** QBee AI / Senior Academic Review  

---

## 1. Executive Summary

This Requirements Traceability Matrix (RTM) establishes bidirectional verification mapping each requirement directly to its implementation, source modules, verification tests, and operational status.

Every requirement listed has been implemented, integrated, and verified against the running application.

| Domain | Total Specifications | Status |
| :--- | :---: | :---: |
| **All Specified Requirements** | **24 / 24** | **100% COMPLETED** |

---

## 2. Requirements Traceability Matrix

| Requirement | Implementation | File/Module | Verification/Test | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Healthcare release rollback decision support** | Quantitative risk scoring and explainable recommendation engine replacing engineer intuition. | `server.ts` (`evaluateRelease`), `src/pages/DashboardPage.tsx` | Regression test suites (`tests/run_all_tests.py`, `tests/run_all_tests.ts`) | **COMPLETED** |
| **Release metadata** | Structured schema capturing release ID, hospital ID, application name, versions, deployment timestamp, status, and deployer identity. | `src/types/index.ts`, `data/releases.json`, `docs/data_schema.md` | `tests/test_data_validation.py` (TEST 14: duplicate ID prevention) | **COMPLETED** |
| **Technical telemetry** | Ingestion of P95 latency (ms), HTTP 5xx error rate (%), throughput transactions/hr, and uptime availability (%). | `data/releases.json`, `server.ts`, `src/pages/ReleaseDetailPage.tsx` | `tests/test_risk_engine.py` (TEST 01, 02) | **COMPLETED** |
| **Business / customer impact** | Ingestion of qualitative clinical impact severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and impacted clinical workflows. | `data/releases.json`, `server.ts`, `src/components/RiskBadge.tsx` | `tests/test_risk_engine.py` (TEST 03: Rule R5 evaluation) | **COMPLETED** |
| **Configurable R1–R6 rules** | Externalized JSON rule configuration supporting dynamic operators, thresholds, and weights at runtime without restarts. | `rules/default_rules.json`, `server.ts`, `src/pages/RiskRulesPage.tsx` | `tests/test_risk_engine.py` (TEST 17: dynamic threshold calibration) | **COMPLETED** |
| **Explainable risk score** | Normalized, mathematically bounded score in $[0, 100]$ computed as the capped sum of active triggered rule weights. | `server.ts` (`evaluateRelease`), `src/components/RiskBadge.tsx` | `tests/test_risk_engine.py` (TEST 15: score strict bounding) | **COMPLETED** |
| **Rollback recommendation** | Emits `ROLLBACK RECOMMENDED` advisory when evaluated risk score $\ge 60$ points. | `server.ts` (`evaluateRelease`), `src/pages/ReleaseDetailPage.tsx` | `tests/test_risk_engine.py` (TEST 06: multi-signal failure) | **COMPLETED** |
| **Continue recommendation** | Emits `CONTINUE` advisory when evaluated risk score $< 30$ points, indicating safe operating parameters. | `server.ts`, `experiments/results.json` | Verified across healthy benchmark cohort (35 cases) | **COMPLETED** |
| **Human Review recommendation** | Emits `HUMAN REVIEW` advisory when evaluated risk score is between 30 and 59 points to triage isolated anomalies. | `server.ts`, `src/pages/ReleaseDetailPage.tsx` | `tests/test_risk_engine.py` (TEST 01, 02) | **COMPLETED** |
| **Human-in-the-loop confirmation** | Strict advisory system boundary: no automated rollback scripts exist. High-impact actions require interactive operator confirmation. | `src/components/DecisionModal.tsx`, `docs/ethics_and_safety.md` | `tests/test_overrides.py` (TEST 07: non-execution guarantee) | **COMPLETED** |
| **Override reason** | Submitting a decision differing from the adviser recommendation mandates a documented operational justification ($\ge 10$ chars). | `server.ts` (`/api/decisions`), `src/components/DecisionModal.tsx` | `tests/test_overrides.py` (TEST 08a, 08b: rejected; 08c: accepted) | **COMPLETED** |
| **Audit logging** | Decisions recorded with ISO timestamp, operator name, role, hospital, recommendation, final decision, and override justification. | `data/decisions.json`, `src/pages/DecisionHistoryPage.tsx` | `tests/test_end_to_end.py` (TEST 20: audit record check) | **COMPLETED** |
| **At least two organisational roles** | Implemented `SOC / Operations Analyst` (view & confirm) and `Release Manager` (calibrate rules) simulated operator personas. | `server.ts` (`/api/auth/login`), `src/components/RoleSwitchModal.tsx` | `server.ts` login credentials & persona tokens | **COMPLETED** |
| **Role-based access** | Server-side RBAC guard enforcing HTTP 403 Forbidden for Analysts attempting rule updates, and HTTP 200 OK for Release Managers. | `server.ts` (`PUT /api/rules/:rule_id`), `docs/security.md` | `tests/test_permissions.py` (TEST 09: 403, TEST 10: 200) | **COMPLETED** |
| **Multi-hospital support** | Partitioned multi-tenant telemetry and deployment isolation across 5 distinct hospital systems (`HOSP-CGH-01` to `HOSP-GVH-05`). | `data/releases.json`, `server.ts`, `src/pages/DashboardPage.tsx` | Verified via `GET /api/hospitals` and tenant filters | **COMPLETED** |
| **Release comparison** | Side-by-side release comparison (`/compare`) showing telemetry diffing, percentage deviations, and recommendation contrasts. | `src/pages/CompareReleasesPage.tsx` | Interactive UI verification on `/compare` | **COMPLETED** |
| **Failure/edge-case handling** | Graceful handling of missing signals (`null`), 100% throughput collapses, conflicting multi-dimensional telemetry, and boundary errors. | `server.ts`, `src/pages/FailureModesPage.tsx`, `docs/failure_mode_analysis.md` | `tests/test_failure_cases.py` (TEST 04, 05, 06) | **COMPLETED** |
| **Reproducible experiment** | Automated statistical evaluation script running with fixed random seed `42` across 60 evaluation scenarios. Exports JSON and CSV. | `scripts/run_experiment.py`, `scripts/run_experiment.ts` | `tests/test_experiment.py` (TEST 19: seed 42 reproduction) | **COMPLETED** |
| **Measurable evaluation** | Primary baseline: 38.2 min; measured adviser time: 4.3 min (88.7% reduction); accuracy: 95.0%; missed rollbacks: 0.0%. | `scripts/run_experiment.py`, `experiments/results.json` | Dynamic calculation in `scripts/run_experiment.py` | **COMPLETED** |
| **Usability workflow** | 13-step interactive operational walkthrough guiding operators from login to decision submission and audit inspection. | `src/pages/WalkthroughPage.tsx` (`/walkthrough`) | Interactive UI verification across all 13 steps | **COMPLETED** |
| **Ethics and safety** | Formal governance framework mandating advisory-only boundary, clinical non-interference, zero PHI, and human control. | `docs/ethics_and_safety.md`, `src/pages/EthicsSafetyPage.tsx` | `GET /api/health` advisory boundary verification | **COMPLETED** |
| **Deployment readiness** | 22-item operational checklist distinguishing implemented prototype controls from planned production infrastructure. | `docs/deployment_checklist.md`, `src/pages/DeploymentChecklistPage.tsx` | Interactive review on `/deployment` | **COMPLETED** |
| **Technical documentation** | Comprehensive technical documentation covering API reference, data schema, architecture, error handling, and testing. | `README.md`, `docs/api.md`, `docs/data_schema.md`, `docs/architecture.md`, `docs/error_handling.md`, `docs/testing.md` | Verification across all `/docs/` guides | **COMPLETED** |
| **Testing** | Dual-stack master test suites comprising 20 automated tests executed via `python3 tests/run_all_tests.py` and `npm test`. | `tests/run_all_tests.py`, `tests/run_all_tests.ts`, `docs/testing.md` | Synchronous execution: **20/20 PASSED** in both suites | **COMPLETED** |

---

## 3. Verification Commands

```bash
# Execute Python 3.10 Master Test Suite (20 tests)
python3 tests/run_all_tests.py

# Execute TypeScript / Node.js 22 Master Test Suite (20 tests)
npm test

# Execute Reproducible Experiment (Seed 42)
python3 scripts/run_experiment.py

# Verify TypeScript Compilation / Typecheck
npm run lint

# Compile Production Vite Bundle
npm run build
```
