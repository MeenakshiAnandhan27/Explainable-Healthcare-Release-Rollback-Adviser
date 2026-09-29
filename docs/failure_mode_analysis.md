# Failure Mode & Edge-Case Analysis

This document provides a systematic engineering breakdown of the **6 benchmark and edge-case failure modes** identified in the Explainable Healthcare Release Rollback Adviser. Every scenario is grounded in an executable test in `tests/test_risk_engine.py` and `tests/test_failure_cases.py`.

---

## Failure Mode Matrix Overview

| Case ID | Scenario Name | Category | Primary Trigger | Risk Score | Expected Recommendation | Test Case Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CASE 1** | High latency + normal errors | Benchmark | Latency Degradation | 30 pts | `HUMAN REVIEW` | `tests/test_risk_engine.py::test_1` |
| **CASE 2** | High error rate + low customer impact | Benchmark | High Error Rate | 30 pts | `HUMAN REVIEW` | `tests/test_risk_engine.py::test_2` |
| **CASE 3** | Low technical risk + critical customer impact | Benchmark | Critical Customer Impact | 40 pts | `HUMAN REVIEW` | `tests/test_risk_engine.py::test_3` |
| **EDGE 4** | Missing latency signal | Edge Case | Telemetry Drop | Insufficient Ev. | `HUMAN REVIEW` | `tests/test_failure_cases.py::test_4` |
| **EDGE 5** | Zero transactions / volume collapse | Edge Case | Transaction Drop | 25 pts | `HUMAN REVIEW` | `tests/test_failure_cases.py::test_5` |
| **EDGE 6** | Conflicting technical signals | Edge Case | Latency + Tx Drop | 55 pts | `HUMAN REVIEW` (Near Rollback) | `tests/test_failure_cases.py::test_6` |

---

## Detailed Scenario Analysis

### 1. High Latency But Normal Errors (`REL-CASE-001`)

- **Scenario Description:** Following a database migration hotfix to the Clinical Portal, P95 API latency jumps by +65% (1000 ms baseline $\to$ 1650 ms). However, the HTTP error rate remains low and stable at 0.35% (baseline 0.40%), transactions are steady, and customer impact is LOW.
- **Input Telemetry:**
  - `latency_change_percent`: +65.0%
  - `error_rate_percent`: 0.35%
  - `transaction_drop_percent`: 2.0%
  - `customer_impact_level`: LOW
- **Expected Behaviour:** Latency rule R2 triggers (+30 points). The score reaches 30, producing `HUMAN REVIEW`. The adviser deliberately avoids a knee-jerk `ROLLBACK` because clinical transactions are still succeeding and error rates are healthy.
- **Actual Behaviour in Prototype:** Risk score = 30 pts; Rule R2 triggered; Recommendation = `HUMAN REVIEW`.
- **Operational Risk:** Prematurely rolling back could interrupt doctors currently typing patient notes, whereas ignoring latency could cause request queue exhaustion under peak load.
- **Mitigation:** Flag for Tier-2 SOC inspection; alert database administrator to check index cache hit ratios before deciding to roll back.
- **Executable Test:** `tests/test_risk_engine.py:test_1_high_latency_normal_errors_stable_transactions()`

---

### 2. High Error Rate But Low Customer Impact (`REL-CASE-002`)

- **Scenario Description:** Laboratory Application deploys a canary build with an error rate spike to 7.5% (baseline 0.15%), exceeding the 5.0% threshold. However, investigation reveals that the errors are localized to non-critical background telemetry sync; no doctors or lab technicians report diagnostic blocking.
- **Input Telemetry:**
  - `error_rate_percent`: 7.5%
  - `latency_change_percent`: +5.0%
  - `transaction_drop_percent`: 3.0%
  - `customer_impact_level`: LOW
- **Expected Behaviour:** Rule R1 (High Error Rate) triggers (+30 points). The score reaches 30, recommending `HUMAN REVIEW`. The operator reviews logs to verify whether errors affect core clinical pathways.
- **Actual Behaviour in Prototype:** Risk score = 30 pts; Rule R1 triggered; Recommendation = `HUMAN REVIEW`.
- **Operational Risk:** If rolled back automatically, engineers might invalidate a critical security patch; if ignored, the error could cascade to upstream clinical queues.
- **Mitigation:** Surface error log traces alongside customer impact level; human confirmation required before rollback.
- **Executable Test:** `tests/test_risk_engine.py:test_2_high_error_rate_low_customer_impact()`

---

### 3. Low Technical Risk But Critical Customer Impact (`REL-CASE-003`)

- **Scenario Description:** Pharmacy Management Service deploys v3.2.0. Server CPU is 12%, HTTP error rate is 0.20%, and latency is nominal (+2.0%). However, hospital pharmacy clinicians report that the medication order verification button has disappeared from the UI due to a CSS z-index regression, halting inpatient ICU medication dispensing.
- **Input Telemetry:**
  - `customer_impact_level`: CRITICAL
  - `error_rate_percent`: 0.20%
  - `latency_change_percent`: +2.0%
  - `transaction_drop_percent`: 1.0%
  - `service_availability_percent`: 99.9%
- **Expected Behaviour:** Technical metrics look green, but Rule R5 (Critical Customer Impact) triggers (+40 points), instantly elevating the release out of `CONTINUE` to `HUMAN REVIEW`. (When coupled with any transaction drop, easily escalates to `ROLLBACK RECOMMENDED`).
- **Actual Behaviour in Prototype:** Risk score = 40 pts; Rule R5 triggered; Recommendation = `HUMAN REVIEW`.
- **Operational Risk:** Pure technical telemetry would declare this deployment "healthy", causing prolonged patient medication dispensing delays.
- **Mitigation:** Explicitly incorporate business and customer-impact signals into the risk scoring formula alongside raw APM metrics.
- **Executable Test:** `tests/test_risk_engine.py:test_3_low_technical_risk_critical_customer_impact()`

---

### 4. Missing Latency Signal (`REL-EDGE-004`)

- **Scenario Description:** Medical Device Integration Service deploys a patch, but the Prometheus latency scraping agent crashes, leaving `latency_ms` and `latency_change_percent` as `null` or uncollected.
- **Input Telemetry:**
  - `latency_change_percent`: `null`
  - `error_rate_percent`: 0.20%
  - `customer_impact_level`: LOW
- **Expected Behaviour:** The system must **never** treat `null` as 0% change. It must flag `"Insufficient evidence"`, surface a prominent warning banner, and advise human review.
- **Actual Behaviour in Prototype:** Engine validates presence of signals; null values emit telemetry warnings in narrative evidence; no false rule triggers occur.
- **Operational Risk:** Silent failure where a degraded release is declared "Safe" simply because monitoring telemetry failed.
- **Mitigation:** Negative signal validation; mandatory inspection when data quality fails.
- **Executable Test:** `tests/test_failure_cases.py:test_4_missing_latency()`

---

### 5. Zero Transactions / Volume Collapse (`REL-EDGE-005`)

- **Scenario Description:** Electronic Health Record Service deploys late Sunday evening. Only 2 transactions occur (or 0 transactions). The transaction drop percentage registers as 100% relative to normal daytime baselines.
- **Input Telemetry:**
  - `transaction_count`: 0
  - `baseline_transaction_count`: 5,000
  - `transaction_drop_percent`: 100.0%
- **Expected Behaviour:** Rule R3 (Transaction Drop > 10%) triggers (+25 points), elevating score to 25 (`HUMAN REVIEW`). The operator determines whether low volume is expected off-hours scheduling or a total ingress gateway blockage.
- **Actual Behaviour in Prototype:** Risk score = 25 pts; Rule R3 triggered; Recommendation = `HUMAN REVIEW`.
- **Operational Risk:** Distinguishing between scheduled maintenance / quiet night hours and a catastrophic DNS blackhole.
- **Mitigation:** Operator inspects time of deployment and baseline profiles; human discretion required.
- **Executable Test:** `tests/test_failure_cases.py:test_5_zero_transactions()`

---

### 6. Conflicting Technical Signals (`REL-EDGE-006`)

- **Scenario Description:** Electronic Health Record Service deploys v4.9.1. Latency degrades by +85% and transactions drop by 40%. However, the error rate appears green at 0.10% because clients are timing out at the load balancer before reaching the application server (HTTP 504 not logged in app metrics).
- **Input Telemetry:**
  - `latency_change_percent`: +85.0% (triggers R2: +30 pts)
  - `transaction_drop_percent`: 40.0% (triggers R3: +25 pts)
  - `error_rate_percent`: 0.10% (deceptive green)
- **Expected Behaviour:** Risk engine accumulates orthogonal signals: R2 (+30) + R3 (+25) = 55 points. Recommends elevated `HUMAN REVIEW` just 5 points below automatic `ROLLBACK` advisory.
- **Actual Behaviour in Prototype:** Risk score = 55 pts; Rules R2 and R3 triggered; Recommendation = `HUMAN REVIEW`.
- **Operational Risk:** Relying solely on error rates would miss client-side transaction dropouts.
- **Mitigation:** Multi-dimensional risk accumulation prevents single-metric masking.
- **Executable Test:** `tests/test_failure_cases.py:test_6_conflicting_technical_signals()`
