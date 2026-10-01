# Complete REST API Reference Specification

**Project:** Explainable Healthcare Release Rollback Adviser  
**Phase:** Phase 3 Architecture & Operational Hardening  
**Runtime:** Node.js 22 + TypeScript / Express 4.21  
**Base URL:** `http://localhost:3000` (or root domain in deployment)  

---

## 1. Overview & Authentication Model

All API endpoints follow standard REST semantics and exchange JSON payloads.  
The application enforces simulated **Role-Based Access Control (RBAC)** across two roles:
- `SOC / Operations Analyst` (Default operator; read-only rule configurations)
- `Release Manager` (Privileged operator; authorized to calibrate risk rules)

For state-mutating rule endpoints (`PUT /api/rules/:rule_id`), the server checks the operator role either via the JSON request payload (`user_role`) or the custom HTTP request header (`x-user-role`).

---

## 2. API Endpoints Directory

| Method | Endpoint | Purpose | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health check & advisory notice | Public |
| `POST` | `/api/auth/login` | Authenticate simulated operator persona | Public |
| `GET` | `/api/hospitals` | List all 5 hospital tenants & deployment tiers | Any |
| `GET` | `/api/rules` | Retrieve active risk rule configurations (R1–R6) | Any |
| `GET` | `/api/rules/audit` | Fetch historical rule modification audit log | Any |
| `PUT` | `/api/rules/:rule_id` | Update rule threshold, weight, or enabled state | **Release Manager** |
| `GET` | `/api/analytics/multi-hospital` | Aggregate cross-tenant deployment analytics | Any |
| `POST` | `/api/rules/evaluate` | Evaluate an arbitrary release telemetry object | Any |
| `GET` | `/api/dashboard/stats` | KPI summary statistics (filterable by tenant) | Any |
| `GET` | `/api/releases` | Paginated and filterable release catalog | Any |
| `GET` | `/api/releases/:release_id` | Full release record with explainable evidence | Any |
| `POST` | `/api/decisions` | Submit human decision / override with justification | Any |
| `GET` | `/api/decisions` | Audit history of past human release decisions | Any |
| `GET` | `/api/experiments` | Get benchmark experiment metrics & scenario results | Any |
| `GET` | `/api/experiment/results` | Fetch or compute benchmark experiment metrics | Any |
| `POST` | `/api/experiment/run` | Execute reproducible benchmark experiment (Seed 42) | Any |
| `POST` | `/api/tests/run` | Execute / query status of 20 regression tests | Any |
| `GET` | `/api/observability/prometheus` | Prometheus exposition text format metric scraper | Any |
| `GET` | `/api/observability/anomaly/:release_id` | Statistical Modified Z-Score anomaly indicator | Any |
| `POST` | `/api/validations` | Submit authentic stakeholder review feedback | Any |
| `GET` | `/api/validations` | Fetch all submitted stakeholder reviews | Any |

---

## 3. Detailed Endpoint Documentation

### 1. `GET /api/health`
- **Purpose:** System liveness check, advisory boundary verification, and environment metadata.
- **Role Requirement:** None (Public)
- **Status Codes:** `200 OK`
- **Example Response:**
```json
{
  "status": "healthy",
  "system": "Explainable Healthcare Release Rollback Adviser",
  "advisory_notice": "Advisory system — no automatic production rollback.",
  "environment": "prototype_synthetic",
  "timestamp": "2026-10-01T04:30:00.000Z"
}
```

---

### 2. `POST /api/auth/login`
- **Purpose:** Authenticate simulated user credentials and establish session context.
- **Role Requirement:** None (Public)
- **Request Body:**
```json
{
  "username": "manager",
  "password": "manager123"
}
```
- **Status Codes:** `200 OK`, `401 Unauthorized`
- **Example Response (200 OK):**
```json
{
  "success": true,
  "username": "manager",
  "role": "Release Manager",
  "name": "Dr. Marcus Brody (Lead Release Mgr)",
  "token": "demo-token-manager-1727757000000"
}
```

---

### 3. `GET /api/hospitals`
- **Purpose:** Retrieve the registry of managed hospital network tenants.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`
- **Example Response:**
```json
[
  { "id": "HOSP-CGH-01", "name": "City General Hospital", "tier": "Trauma Level 1", "deployments": 104 },
  { "id": "HOSP-SMMC-02", "name": "St. Mary's Medical Center", "tier": "Specialty Cardiac", "deployments": 102 },
  { "id": "HOSP-LKH-03", "name": "Lakeside Hospital", "tier": "Community Regional", "deployments": 101 },
  { "id": "HOSP-MCH-04", "name": "Metro Care Hospital", "tier": "Academic Medical Center", "deployments": 103 },
  { "id": "HOSP-GVH-05", "name": "Green Valley Hospital", "tier": "Ambulatory & Surgical", "deployments": 102 }
]
```

---

### 4. `GET /api/rules`
- **Purpose:** Fetch all active configurable risk rules (R1–R6).
- **Role Requirement:** Any
- **Status Codes:** `200 OK`
- **Example Response:**
```json
[
  {
    "rule_id": "R1",
    "name": "High Error Rate",
    "metric": "error_rate_percent",
    "operator": ">",
    "threshold": 5.0,
    "weight": 30,
    "enabled": true,
    "category": "technical",
    "description": "If error rate > 5%, add 30 risk points."
  },
  {
    "rule_id": "R2",
    "name": "Latency Degradation",
    "metric": "latency_change_percent",
    "operator": ">",
    "threshold": 30.0,
    "weight": 30,
    "enabled": true,
    "category": "technical",
    "description": "If latency increases > 30% from baseline, add 30 risk points."
  }
]
```

---

### 5. `GET /api/rules/audit`
- **Purpose:** Retrieve immutable audit logs of historical rule threshold/weight changes.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`
- **Example Response:**
```json
[
  {
    "id": 1,
    "timestamp": "2026-09-28T18:00:00.000Z",
    "rule_id": "R1",
    "rule_name": "High Error Rate",
    "user_name": "Elena Rostova, Release Manager",
    "user_role": "Release Manager",
    "old_threshold": 6.0,
    "new_threshold": 5.0,
    "old_weight": 30,
    "new_weight": 30,
    "old_enabled": true,
    "new_enabled": true,
    "change_reason": "Calibrated error threshold from 6.0% to 5.0% following Clinical Portal review"
  }
]
```

---

### 6. `PUT /api/rules/:rule_id`
- **Purpose:** Reconfigure a risk rule threshold, weight, or enabled flag. Automatically creates an audit trail entry and recalculates risk scores across active releases.
- **Role Requirement:** **Release Manager** (Enforces strict RBAC)
- **Path Parameter:** `rule_id` (e.g. `R1`)
- **Request Body:**
```json
{
  "threshold": 6.5,
  "weight": 35,
  "enabled": true,
  "user_role": "Release Manager",
  "user_name": "Elena Rostova",
  "change_reason": "Adjusted threshold for holiday weekend scheduled maintenance"
}
```
- **Status Codes:** `200 OK`, `403 Forbidden` (if role is not Release Manager), `404 Not Found`
- **Example Response (200 OK):**
```json
{
  "rule": {
    "rule_id": "R1",
    "name": "High Error Rate",
    "metric": "error_rate_percent",
    "operator": ">",
    "threshold": 6.5,
    "weight": 35,
    "enabled": true
  },
  "audit": {
    "id": 3,
    "timestamp": "2026-10-01T04:35:00.000Z",
    "rule_id": "R1",
    "old_threshold": 5.0,
    "new_threshold": 6.5,
    "user_role": "Release Manager"
  }
}
```

---

### 7. `GET /api/analytics/multi-hospital`
- **Purpose:** Aggregate telemetry metrics, deployment volume, risk scores, and customer impact across all 5 hospital tenants.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`
- **Example Response:**
```json
[
  {
    "hospital_id": "HOSP-CGH-01",
    "hospital_name": "City General Hospital",
    "tier": "Trauma Level 1",
    "total_releases": 104,
    "high_risk_count": 22,
    "rollback_count": 18,
    "avg_risk_score": 38.4,
    "avg_latency_change_percent": 14.2,
    "avg_error_rate_percent": 2.15,
    "customer_impact_distribution": {
      "LOW": 52,
      "MEDIUM": 24,
      "HIGH": 18,
      "CRITICAL": 10
    }
  }
]
```

---

### 8. `POST /api/rules/evaluate`
- **Purpose:** Run deterministic evaluation on arbitrary release telemetry without saving.
- **Role Requirement:** Any
- **Request Body:**
```json
{
  "error_rate_percent": 7.5,
  "latency_change_percent": 45.0,
  "transaction_drop_percent": 15.0,
  "customer_impact_level": "HIGH",
  "service_availability_percent": 98.8
}
```
- **Status Codes:** `200 OK`
- **Example Response:**
```json
{
  "risk_score": 100,
  "risk_level": "CRITICAL",
  "recommendation": "ROLLBACK RECOMMENDED (HIGH IMPACT CONFIRMATION REQUIRED)",
  "triggered_rules": [
    { "rule_id": "R1", "name": "High Error Rate", "weight": 30, "value": 7.5, "threshold": 5.0 },
    { "rule_id": "R2", "name": "Latency Degradation", "weight": 30, "value": 45.0, "threshold": 30.0 },
    { "rule_id": "R3", "name": "Transaction Drop", "weight": 25, "value": 15.0, "threshold": 10.0 },
    { "rule_id": "R4", "name": "High Customer Impact", "weight": 25, "value": "HIGH", "threshold": "HIGH" }
  ],
  "explanation": {
    "summary": "Critical operational degradation or high-severity workflow impact detected...",
    "narrative_points": [
      "Error rate reached 7.5%, surpassing configured safety threshold of 5.0%.",
      "Service latency increased by 45.0% over baseline (threshold: 30.0%)."
    ]
  }
}
```

---

### 9. `GET /api/dashboard/stats`
- **Purpose:** High-level operational metrics for dashboard overview.
- **Query Parameters:** `hospital_id` (`ALL` or specific hospital ID like `HOSP-CGH-01`)
- **Status Codes:** `200 OK`
- **Example Response:**
```json
{
  "total_deployments": 512,
  "releases_evaluated": 512,
  "high_risk_releases": 118,
  "rollback_recommendations": 96,
  "continue_recommendations": 284,
  "human_review_cases": 132,
  "average_decision_time_min": 4.3,
  "baseline_average_decision_time_min": 38.2,
  "customer_impact_distribution": {
    "LOW": 280,
    "MEDIUM": 114,
    "HIGH": 80,
    "CRITICAL": 38
  }
}
```

---

### 10. `GET /api/releases`
- **Purpose:** Filterable, paginated list of release records across hospital deployments.
- **Query Parameters:**
  - `hospital_id` (string, optional, e.g. `HOSP-CGH-01`)
  - `risk_level` (string, optional: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `search` (string, optional: keyword matching release ID, app, version, engineer)
  - `limit` (integer, default: 50)
  - `offset` (integer, default: 0)
- **Status Codes:** `200 OK`
- **Example Response:**
```json
{
  "total": 512,
  "items": [
    {
      "release_id": "REL-CASE-001",
      "hospital_id": "HOSP-CGH-01",
      "hospital_name": "City General Hospital",
      "application_name": "Clinical Portal",
      "version": "v4.14.2",
      "deployment_status": "MONITORING",
      "deployment_type": "HOTFIX",
      "latency_change_percent": 65.0,
      "error_rate_percent": 0.35,
      "risk_score": 30,
      "risk_level": "MEDIUM",
      "recommendation": "HUMAN REVIEW"
    }
  ]
}
```

---

### 11. `GET /api/releases/:release_id`
- **Purpose:** Retrieve full telemetry, metadata, and explainable rule evidence for a specific release.
- **Path Parameter:** `release_id` (e.g. `REL-CASE-001`)
- **Status Codes:** `200 OK`, `404 Not Found`
- **Example Response:**
```json
{
  "release_id": "REL-CASE-001",
  "hospital_name": "City General Hospital",
  "application_name": "Clinical Portal",
  "version": "v4.14.2",
  "latency_ms": 1650.0,
  "latency_baseline_ms": 1000.0,
  "latency_change_percent": 65.0,
  "error_rate_percent": 0.35,
  "customer_impact_level": "LOW",
  "affected_workflows": ["Clinical documentation"],
  "risk_score": 30,
  "risk_level": "MEDIUM",
  "recommendation": "HUMAN REVIEW",
  "triggered_rules": [
    {
      "rule_id": "R2",
      "name": "Latency Degradation",
      "weight": 30,
      "metric": "latency_change_percent",
      "value": 65.0,
      "threshold": 30.0
    }
  ]
}
```

---

### 12. `POST /api/decisions`
- **Purpose:** Submit human confirmation or override decision for an active release. Validates mandatory $\ge 10$ character justification on override. Updates release deployment status and appends to audit log.
- **Role Requirement:** Any authenticated operator
- **Request Body:**
```json
{
  "release_id": "REL-CASE-001",
  "final_decision": "CONTINUE",
  "override_reason": "Latency spike is transient due to cold cache initialization after container restart; database thread pools remain completely nominal.",
  "decision_maker": "Marcus Vance, SOC Tier 2",
  "role": "SOC / Operations Analyst"
}
```
- **Status Codes:** `200 OK`, `400 Bad Request` (if override justification $<10$ characters), `404 Not Found`
- **Example Response (200 OK):**
```json
{
  "status": "success",
  "message": "Decision for REL-CASE-001 successfully recorded and audited.",
  "decision": {
    "id": 5,
    "timestamp": "2026-10-01T04:40:00.000Z",
    "release_id": "REL-CASE-001",
    "hospital_name": "City General Hospital",
    "recommendation": "HUMAN REVIEW",
    "final_decision": "CONTINUE",
    "is_override": true,
    "override_reason": "Latency spike is transient due to cold cache initialization...",
    "decision_maker": "Marcus Vance, SOC Tier 2",
    "role": "SOC / Operations Analyst",
    "risk_score": 30
  }
}
```

---

### 13. `GET /api/decisions`
- **Purpose:** Query the immutable decision audit log with optional tenant, role, and decision filtering.
- **Query Parameters:** `hospital`, `role`, `decision`, `limit`
- **Status Codes:** `200 OK`

---

### 14. `GET /api/experiments`
- **Purpose:** Retrieve the latest reproducible benchmark experiment metrics and scenario evaluations.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`
- **Example Response:**
```json
{
  "metrics": {
    "sample_size": 60,
    "baseline_avg_decision_time_min": 38.2,
    "target_decision_time_min": 10.0,
    "measured_avg_decision_time_min": 4.3,
    "decision_time_reduction_percent": 88.7,
    "accuracy_percent": 95.0,
    "false_rollback_rate_percent": 3.3,
    "missed_rollback_rate_percent": 0.0,
    "human_review_rate_percent": 35.0
  }
}
```

---

### 15. `POST /api/experiment/run`
- **Purpose:** Execute the deterministic benchmark evaluation script (Seed 42) and return calculated metrics.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`, `500 Internal Error`

---

### 16. `POST /api/tests/run`
- **Purpose:** Execute or query the status of all 20 automated regression tests.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`
- **Example Response:**
```json
{
  "status": "success",
  "total_tests": 20,
  "passed": 20,
  "failed": 0,
  "test_framework": "TypeScript / Node.js 22 + Python 3.10",
  "results": [
    { "id": "TEST 01", "name": "High latency + normal errors + stable transactions", "status": "PASSED" }
  ]
}
```

---

### 17. `POST /api/validations` & `GET /api/validations`
- **Purpose:** Submit or list authentic stakeholder feedback ratings (1–5) and operational suggestions.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`

---

### 18. `GET /api/observability/prometheus`
- **Purpose:** Prometheus standard text exposition format metric endpoint (`# HELP`, `# TYPE`) for production APM scraping.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`
- **Content-Type:** `text/plain; version=0.0.4; charset=utf-8`
- **Example Metrics:**
  - `rollback_adviser_releases_total`: Total managed hospital releases
  - `rollback_adviser_risk_score_gauge`: Real-time evaluated risk score
  - `rollback_adviser_decision_latency_seconds`: Decision evaluation latency

---

### 19. `GET /api/observability/anomaly/:release_id`
- **Purpose:** Auxiliary statistical anomaly indicator calculating Modified Z-Scores across latency, error rate, and throughput deltas.
- **Role Requirement:** Any
- **Status Codes:** `200 OK`, `404 Not Found`
- **Notice:** Advisory and auxiliary only — does not supersede deterministic R1–R6 scoring.
- **Example Response:**
```json
{
  "release_id": "REL-CASE-001",
  "is_anomaly": true,
  "composite_z_score": 3.42,
  "confidence": "HIGH",
  "anomalous_features": ["latency_change_percent"],
  "advisory_note": "Auxiliary statistical indicator only. Deterministic R1-R6 rules remain authoritative."
}
```
