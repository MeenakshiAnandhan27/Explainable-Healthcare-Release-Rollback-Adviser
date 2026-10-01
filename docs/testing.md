# Comprehensive Testing & Verification Architecture

**Project:** Explainable Healthcare Release Rollback Adviser  
**Phase:** Phase 3 Architecture & Operational Hardening  
**Target Environment:** Node.js 22 + TypeScript / Python 3.10  

---

## 1. Testing Architecture Overview

The Explainable Healthcare Release Rollback Adviser employs a dual-stack test suite comprising **20 distinct automated test specifications** implemented in both Python 3.10 and TypeScript / Node.js. This ensures deterministic cross-language verification between the offline data science experimentation engine and the online full-stack runtime.

```
+---------------------------------------------------------------------------------------------------+
|                                  TEST EXECUTION ARCHITECTURE                                      |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|    TypeScript / Node.js Runner                     Python 3.10 Regression Suite                   |
|    `npm test` (tests/run_all_tests.ts)            `python3 tests/run_all_tests.py`                |
|               |                                                |                                  |
|               +-----------------------+------------------------+                                  |
|                                       |                                                           |
|                                       v                                                           |
|       +---------------------------------------------------------------+                           |
|       |               20 CORE TEST SPECIFICATION MODULES              |                           |
|       +---------------------------------------------------------------+                           |
|       |                                                               |                           |
|       |  [Category 1: Benchmark Failure Scenarios]                    |                           |
|       |    - TEST 01: High Latency + Normal Errors (Rule R2, 30 pts)  |                           |
|       |    - TEST 02: High Errors + Low Customer Impact (R1, 30 pts)  |                           |
|       |    - TEST 03: Low Tech Risk + Critical Impact (R5, 40 pts)    |                           |
|       |                                                               |                           |
|       |  [Category 2: Edge Cases & Telemetry Failures]                |                           |
|       |    - TEST 04: Missing / Null Latency Signal Handling          |                           |
|       |    - TEST 05: Zero Transactions / 100% Throughput Drop (R3)   |                           |
|       |    - TEST 06: Conflicting Multi-Dimensional Signals           |                           |
|       |                                                               |                           |
|       |  [Category 3: Human Confirmation & Override Governance]       |                           |
|       |    - TEST 07: High-Impact Advisory Non-Execution Boundary     |                           |
|       |    - TEST 08: Mandatory Override Justification Validation     |                           |
|       |                                                               |                           |
|       |  [Category 4: Role-Based Access Control (RBAC) & Auditing]    |                           |
|       |    - TEST 09: Operations Analyst 403 Forbidden on Rule Edit   |                           |
|       |    - TEST 10: Release Manager 200 OK on Rule Edit             |                           |
|       |    - TEST 11: Rule Change Audit Before/After Capture          |                           |
|       |                                                               |                           |
|       |  [Category 5: Data Quality & Schema Boundaries]               |                           |
|       |    - TEST 12: Rejection of Negative Latency Telemetry         |                           |
|       |    - TEST 13: Rejection of Error Rate > 100%                  |                           |
|       |    - TEST 14: Duplicate Release ID Collision Prevention       |                           |
|       |                                                               |                           |
|       |  [Category 6: Risk Engine Invariants & Explainability]        |                           |
|       |    - TEST 15: Risk Score Strict Bounding [0, 100]             |                           |
|       |    - TEST 16: Disabled Rule Zero-Contribution Invariant       |                           |
|       |    - TEST 17: Dynamic Threshold Sensitivity Verification      |                           |
|       |    - TEST 18: Narrative Explanation 1:1 Evidence Parity       |                           |
|       |                                                               |                           |
|       |  [Category 7: Experiment Reproducibility]                     |                           |
|       |    - TEST 19: Seed 42 Deterministic Metric Replication        |                           |
|       |                                                               |                           |
|       |  [Category 8: End-to-End Workflow Integration]                |                           |
|       |    - TEST 20: Full Lifecycle Simulation (Login to Audit)     |                           |
|       +---------------------------------------------------------------+                           |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Test File Locations & Modular Organization

| Module File | Language | Primary Purpose | Test IDs Covered |
| :--- | :--- | :--- | :--- |
| `tests/run_all_tests.py` | Python 3.10 | Master CLI test runner for Python environment | TEST 01 – TEST 19 |
| `tests/run_all_tests.ts` | TypeScript | Master CLI test runner for Node.js / Vite runtime | TEST 01 – TEST 19 |
| `tests/test_risk_engine.py` | Python 3.10 | Benchmark scenarios, score invariants, threshold sensitivity, explainability | TEST 01–03, TEST 15–18 |
| `tests/test_failure_cases.py`| Python 3.10 | Missing telemetry, throughput collapse, conflicting metrics | TEST 04 – TEST 06 |
| `tests/test_overrides.py` | Python 3.10 | Mandatory human confirmation boundary and override justification enforcement | TEST 07 – TEST 08 |
| `tests/test_permissions.py`| Python 3.10 | Role-based authorization (Analyst vs Release Manager) and rule audit state | TEST 09 – TEST 11 |
| `tests/test_data_validation.py`| Python 3.10| Schema boundaries (negative latency, error > 100%, duplicate IDs) | TEST 12 – TEST 14 |
| `tests/test_experiment.py` | Python 3.10 | Deterministic benchmark execution and statistical target validation | TEST 19 |

---

## 3. Granular Test Case Specifications

### Category 1: Benchmark Failure Scenarios

#### TEST 01 — High Latency + Normal Errors + Stable Transactions
- **File:** `tests/test_risk_engine.py` / `tests/run_all_tests.ts`
- **Scenario:** P95 latency spikes by +65.0% (threshold: >30%), but error rate remains low at 0.35% (threshold: >5%) and transaction throughput drops only 2%.
- **Expected Outcome:** Rule R2 triggers (+30 risk points). Final score is 30. Recommendation is `HUMAN REVIEW`.
- **Validation Rationale:** Prevents premature, costly rollbacks when downstream cache warms up or transient network hops occur.

#### TEST 02 — High Error Rate + Low Customer Impact
- **File:** `tests/test_risk_engine.py` / `tests/run_all_tests.ts`
- **Scenario:** Error rate reaches 7.5% (threshold: >5.0%), but customer impact is tagged `LOW` with latency change at +5.0%.
- **Expected Outcome:** Rule R1 triggers (+30 risk points). Final score is 30. Recommendation is `HUMAN REVIEW`.
- **Validation Rationale:** Accurately flags elevated technical failure without misclassifying it as a patient-safety emergency.

#### TEST 03 — Low Technical Risk + CRITICAL Customer Impact
- **File:** `tests/test_risk_engine.py` / `tests/run_all_tests.ts`
- **Scenario:** Technical telemetry appears green (latency +2%, error rate 0.2%, availability 99.9%), but clinical impact is tagged `CRITICAL` (e.g. ICU medication dispensing blocked).
- **Expected Outcome:** Rule R5 triggers (+40 risk points). Final score is 40. Recommendation is `HUMAN REVIEW`.
- **Validation Rationale:** Proves customer and clinical impact signals escalate risk even when technical server metrics appear completely healthy.

---

### Category 2: Edge Cases & Telemetry Failures

#### TEST 04 — Missing / Null Latency Signal Handling
- **File:** `tests/test_failure_cases.py` / `tests/run_all_tests.ts`
- **Scenario:** Latency signal is `null` or `None` due to agent telemetry drop or probe timeout.
- **Expected Outcome:** Evaluator handles null signal without crashing (no `TypeError` or unhandled exception). Rule R2 does not false-trigger. Warning is attached to explanation.
- **Validation Rationale:** Ensures system resilience against partial telemetry dropouts.

#### TEST 05 — Zero Transactions / 100% Throughput Drop
- **File:** `tests/test_failure_cases.py` / `tests/run_all_tests.ts`
- **Scenario:** Current transaction count is 0 against a baseline of 5,000 transactions (100% throughput collapse).
- **Expected Outcome:** Rule R3 (Transaction Drop > 10%) triggers (+25 risk points). Recommendation is `HUMAN REVIEW`.
- **Validation Rationale:** Detects silent traffic collapse (e.g. gateway misconfiguration) where no 500 errors are returned because requests never reach backend servers.

#### TEST 06 — Conflicting Multi-Dimensional Signals
- **File:** `tests/test_failure_cases.py` / `tests/run_all_tests.ts`
- **Scenario:** Severe latency degradation (+85.0%, R2 triggers +30 pts) and high throughput drop (40.0%, R3 triggers +25 pts), while error rate is deceptively low (0.1%).
- **Expected Outcome:** Evaluator accumulates orthogonal risk: 30 + 25 = 55 points. Recommendation is elevated `HUMAN REVIEW`.
- **Validation Rationale:** Prevents conflicting signals from canceling each other out.

---

### Category 3: Human Confirmation & Override Governance

#### TEST 07 — High-Impact Advisory Non-Execution Boundary
- **File:** `tests/test_overrides.py` / `tests/run_all_tests.ts`
- **Scenario:** Critical release triggers multiple rules (score $\ge 60$ or $\ge 80$).
- **Expected Outcome:** System produces `ROLLBACK RECOMMENDED`, but `production_action_executed` is strictly false. No automated container termination or rollback command is issued.
- **Validation Rationale:** Verifies the non-negotiable safety requirement: the platform is strictly advisory.

#### TEST 08 — Mandatory Override Justification Validation
- **File:** `tests/test_overrides.py` / `tests/run_all_tests.ts`
- **Scenario:** Operator attempts to override recommendation with (a) an empty string, (b) whitespace, or (c) short reason under 10 characters.
- **Expected Outcome:** Rejection with error message `"Override requires a documented clinical/operational reason (min 10 characters)"` and HTTP 400. Documented valid justifications are accepted.
- **Validation Rationale:** Enforces legal and clinical audit accountability.

---

### Category 4: Role-Based Access Control (RBAC) & Auditing

#### TEST 09 — Operations Analyst Cannot Modify Risk Rules (403 Forbidden)
- **File:** `tests/test_permissions.py` / `tests/run_all_tests.ts`
- **Scenario:** Operator with role `"SOC / Operations Analyst"` sends `PUT /api/rules/R1` attempting to alter threshold.
- **Expected Outcome:** HTTP 403 Forbidden. Rule configuration remains unchanged. No audit record created.
- **Validation Rationale:** Enforces least-privilege principle.

#### TEST 10 — Release Manager Can Modify Risk Rules (200 OK)
- **File:** `tests/test_permissions.py` / `tests/run_all_tests.ts`
- **Scenario:** Operator with role `"Release Manager"` sends `PUT /api/rules/R1` with updated threshold.
- **Expected Outcome:** HTTP 200 OK. Rule threshold updates immediately.
- **Validation Rationale:** Allows authorized leadership to calibrate organizational risk tolerance.

#### TEST 11 — Risk Rule Changes Audited with Before/After State
- **File:** `tests/test_permissions.py` / `tests/run_all_tests.ts`
- **Scenario:** An authorized rule update is processed.
- **Expected Outcome:** An audit record is created capturing `rule_id`, `rule_name`, `user_name`, `user_role`, `old_threshold`, `new_threshold`, `old_weight`, `new_weight`, and `timestamp`.
- **Validation Rationale:** Guarantees total traceability of risk calibration changes.

---

### Category 5: Data Quality & Schema Boundaries

#### TEST 12 — Rejection of Negative Latency Telemetry
- **File:** `tests/test_data_validation.py` / `tests/run_all_tests.ts`
- **Scenario:** Record contains invalid negative latency (e.g. `-45.0 ms`).
- **Expected Outcome:** Schema validator rejects payload with error `"Invalid negative latency"`.
- **Validation Rationale:** Prevents corrupted telemetry probes from poisoning risk calculations.

#### TEST 13 — Rejection of Error Rate > 100%
- **File:** `tests/test_data_validation.py` / `tests/run_all_tests.ts`
- **Scenario:** Record contains mathematically impossible error rate (e.g. `142.5%`).
- **Expected Outcome:** Schema validator rejects payload with error `"Invalid error rate"`.
- **Validation Rationale:** Enforces mathematical boundaries on input telemetry.

#### TEST 14 — Duplicate Release ID Rejection
- **File:** `tests/test_data_validation.py` / `tests/run_all_tests.ts`
- **Scenario:** Attempting to ingest a release ID that already exists in the registry.
- **Expected Outcome:** Registry validator rejects insertion with error `"Duplicate release ID"`.
- **Validation Rationale:** Preserves historical audit record integrity.

---

### Category 6: Risk Engine Invariants & Explainability

#### TEST 15 — Risk Score Strictly Bounded Within [0, 100]
- **File:** `tests/test_risk_engine.py` / `tests/run_all_tests.ts`
- **Scenario:** Catastrophic failure triggers all rules simultaneously (raw sum = 30 + 30 + 25 + 40 + 20 = 145 points).
- **Expected Outcome:** Final score is capped at exactly 100. Range invariant $0 \le \text{Score} \le 100$ holds.
- **Validation Rationale:** Prevents UI gauge overflows and uncalibrated risk metrics.

#### TEST 16 — Disabled Rules Do Not Contribute to Score or Evidence
- **File:** `tests/test_risk_engine.py` / `tests/run_all_tests.ts`
- **Scenario:** Rule R1 is set to `enabled: false`. Telemetry triggers R1's condition.
- **Expected Outcome:** R1 contributes 0 points. R1 does not appear in `triggered_rules` or narrative evidence.
- **Validation Rationale:** Allows temporary rule deactivation during scheduled maintenance without deleting the rule.

#### TEST 17 — Configured Threshold Changes Alter Risk Evaluation
- **File:** `tests/test_risk_engine.py` / `tests/run_all_tests.ts`
- **Scenario:** Error threshold is changed from 5.0% to 10.0%. Release has 7.5% error rate.
- **Expected Outcome:** Default configuration triggers R1 (30 pts); calibrated configuration does not trigger R1 (0 pts).
- **Validation Rationale:** Proves rule engine evaluates dynamically against configuration.

#### TEST 18 — Explanation Evidence Matches Triggered Rules
- **File:** `tests/test_risk_engine.py` / `tests/run_all_tests.ts`
- **Scenario:** Release triggers multiple rules.
- **Expected Outcome:** Every triggered rule has an explicit representation in the explanation payload with matching rule ID, name, value, threshold, and narrative point.
- **Validation Rationale:** Guarantees 100% explainability without hidden criteria.

---

### Category 7: Experiment Reproducibility

#### TEST 19 — Seed 42 Deterministic Metric Replication
- **File:** `tests/test_experiment.py` / `tests/run_all_tests.ts`
- **Scenario:** Automated benchmark experiment runs across 60 evaluation scenarios with random seed `42`.
- **Expected Outcome:**
  - Primary baseline average decision time equals 38.2 minutes.
  - Measured adviser decision time $\le 10.0$ minutes (measured: 4.3 min).
  - Accuracy $\ge 90.0\%$ (measured: 95.0%).
  - Missed rollback rate $\le 4.0\%$ (measured: 0.0%).
- **Validation Rationale:** Eliminates static hardcoded figures and verifies algorithmic reproducibility.

---

### Category 8: End-to-End User Journey & Workflow Integration

#### TEST 20 — End-to-End User Workflow Simulation
- **File:** `tests/test_end_to_end.py` / `tests/run_all_tests.ts`
- **Scenario:** Full operational lifecycle: operator authentication $\rightarrow$ tenant-isolated hospital selection $\rightarrow$ active release inspection $\rightarrow$ telemetry validation $\rightarrow$ deterministic rule evaluation $\rightarrow$ advisory recommendation $\rightarrow$ human confirmation with justified override $\rightarrow$ immutable audit record verification.
- **Expected Outcome:** Complete workflow completes without broken state, ensuring end-to-end data integrity.
- **Validation Rationale:** Guarantees total cohesion across all functional modules.

---

## 4. Execution Commands & Expected Outputs

### Running Python Master Test Suite
```bash
python3 tests/run_all_tests.py
```
**Expected CLI Summary:**
```
============================================================================
  TEST EXECUTION SUMMARY
============================================================================
  ✓ PASS | TEST 01  | High latency + normal errors + stable transactions
  ✓ PASS | TEST 02  | High error rate + low customer impact
  ✓ PASS | TEST 03  | Low technical risk + CRITICAL customer impact
  ✓ PASS | TEST 04  | Missing latency telemetry handling
  ✓ PASS | TEST 05  | Zero transactions / traffic drop
  ✓ PASS | TEST 06  | Conflicting technical signals
  ✓ PASS | TEST 07  | High-impact recommendation requires human confirmation
  ✓ PASS | TEST 08  | Override without mandatory reason must fail
  ✓ PASS | TEST 09  | Operations Analyst cannot modify risk rules (403)
  ✓ PASS | TEST 10  | Release Manager can modify risk rules (200)
  ✓ PASS | TEST 11  | Risk rule changes are audited with before/after state
  ✓ PASS | TEST 12  | Invalid negative latency is rejected by schema validator
  ✓ PASS | TEST 13  | Error rate > 100% is rejected by schema validator
  ✓ PASS | TEST 14  | Duplicate release IDs are rejected by registry validator
  ✓ PASS | TEST 15  | Risk score strictly bounded within valid [0, 100] range
  ✓ PASS | TEST 16  | Disabled rules do not contribute to score or evidence
  ✓ PASS | TEST 17  | Configured threshold changes actually alter risk evaluation
  ✓ PASS | TEST 18  | Explanation evidence precisely matches all triggered rules
  ✓ PASS | TEST 19  | Reproducible experiment verification (Seed 42, 38.2m baseline)
  ✓ PASS | TEST 20  | End-to-end user workflow simulation from login to audit trail
----------------------------------------------------------------------------
Total Tests: 20 | Passed: 20 | Failed: 0 | Time: 0.02s
============================================================================
```

### Running TypeScript / Node.js Test Suite
```bash
npm test
```
**Expected CLI Summary:**
```
============================================================================
TEST RUN COMPLETE: 20/20 PASSED (Failed: 0)
============================================================================
```

---

## 5. Failure Handling & Error Conditions in Tests

| Condition | Injected Input | Expected Interception | Safety Result |
| :--- | :--- | :--- | :--- |
| **Missing Field** | `latency_ms: null` | `val === null \|\| val === undefined` check | Handled gracefully without crash; warning added |
| **Out-of-Bounds Error** | `error_rate_percent: 142.5` | `err < 0.0 \|\| err > 100.0` check | Ingestion rejected with descriptive message |
| **Negative Latency** | `latency_ms: -45.0` | `lat < 0` boundary check | Ingestion rejected; corrupt telemetry discarded |
| **Duplicate ID** | `release_id: "REL-CASE-001"` | `existing_ids.has(id)` set lookup | Replaced with conflict notification; existing data intact |
| **Unauthorized Role** | `user_role: "SOC / Operations Analyst"` | RBAC guard in `PUT /api/rules/:id` | HTTP 403 Forbidden; zero changes to configuration |
| **Short Override** | `override_reason: "ok"` | `override_reason.trim().length < 10` check | HTTP 400 Bad Request; decision submission blocked |
