# Comprehensive Data & Persistence Schema Specification

**Project:** Explainable Healthcare Release Rollback Adviser  
**Phase:** Phase 3 Architecture & Operational Hardening  
**Storage Engine:** Schema-Validated JSON File Persistence (Prototype Implementation)  
**Storage Directory:** `/data/` and `/rules/`  

---

## 1. Storage Architecture Overview

The prototype application implements structured, schema-validated JSON file persistence.  
This decoupled flat-file architecture provides immediate cold-start execution without external database provisioning, while preserving strict entity schemas, foreign key relationships, and validation invariants.

### Storage Files Inventory:
1. `data/releases.json`: Catalog of 512 synthetic multi-tenant hospital software deployments.
2. `rules/default_rules.json`: Canonical rule definitions (R1–R6) with active thresholds and weights.
3. `data/decisions.json`: Immutable audit trail of human authorization and override records.
4. `data/rules_audit.json`: Historical change log tracking rule threshold and weight calibrations.
5. `data/validations.json`: Stakeholder review ratings and qualitative feedback submissions.
6. `experiments/results.json`: Benchmark experiment evaluation metrics and scenario classifications.

---

## 2. Release Record Schema (`data/releases.json`)

Represents a software deployment promoted to a specific hospital tenant.

### Field Definitions:
| Field Name | Type | Required | Allowed Values / Constraints | Description |
| :--- | :--- | :---: | :--- | :--- |
| `release_id` | `string` | **Yes** | Unique format: `REL-CASE-XXX` or `REL-YYYY-XXXX` | Primary release identifier |
| `hospital_id` | `string` | **Yes** | `HOSP-CGH-01`, `HOSP-SMMC-02`, `HOSP-LKH-03`, `HOSP-MCH-04`, `HOSP-GVH-05` | Foreign key referencing hospital tenant |
| `hospital_name` | `string` | **Yes** | Full string matching tenant | Human-readable hospital name |
| `application_name` | `string` | **Yes** | `Clinical Portal`, `Laboratory Application`, `Electronic Health Record Service`, `Pharmacy Management Service`, `Radiology PACS`, `Patient Billing & Scheduling` | Hospital software microservice |
| `version` | `string` | **Yes** | Semantic versioning format `vX.Y.Z` | Deployed software release version |
| `previous_version`| `string` | **Yes** | Semantic versioning format `vX.Y.Z` | Baseline prior version |
| `deployment_time` | `string` | **Yes** | ISO-8601 UTC timestamp | Deployment promotion timestamp |
| `deployment_status`| `string` | **Yes** | `MONITORING`, `CONTINUED`, `ROLLED_BACK`, `PENDING_REVIEW` | Lifecycle operational status |
| `deployment_type` | `string` | **Yes** | `SCHEDULED`, `HOTFIX`, `CANARY` | Release promotion modality |
| `engineer` | `string` | **Yes** | String (Name + Role) | Deploying engineer |
| `latency_ms` | `number \| null` | No | $\ge 0.0$ ms or `null` if probe offline | Measured P95 request latency |
| `latency_baseline_ms`| `number`| **Yes** | $> 0.0$ ms | Historical baseline P95 latency |
| `latency_change_percent`| `number \| null`| No | $\ge -100.0\%$ or `null` | Percentage change vs baseline |
| `error_rate_percent`| `number` | **Yes** | $0.0 \le \text{rate} \le 100.0\%$ | HTTP 5xx error rate percentage |
| `error_baseline_percent`| `number`| **Yes** | $0.0 \le \text{rate} \le 100.0\%$ | Historical baseline error rate |
| `error_change` | `number` | **Yes** | Percentage delta | Difference in error percentage points |
| `service_availability_percent`| `number`| **Yes** | $0.0 \le \text{rate} \le 100.0\%$ | Uptime SLA compliance percentage |
| `transaction_count`| `number` | **Yes** | Integer $\ge 0$ | Total transactions during window |
| `baseline_transaction_count`| `number`| **Yes** | Integer $\ge 0$ | Historical transaction benchmark |
| `transaction_drop_percent`| `number`| **Yes** | $0.0 \le \text{drop} \le 100.0\%$ | Throughput deficit percentage |
| `customer_impact_level`| `string` | **Yes** | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Clinical / business impact severity |
| `affected_workflows`| `string[]`| **Yes** | Array of string workflow labels | Clinical workflows impacted |
| `risk_score` | `number` | Computed | Integer in $[0, 100]$ | Evaluated risk score |
| `risk_level` | `string` | Computed | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Risk severity classification |
| `recommendation` | `string` | Computed | `CONTINUE`, `HUMAN REVIEW`, `ROLLBACK RECOMMENDED`, `ROLLBACK RECOMMENDED (HIGH IMPACT CONFIRMATION REQUIRED)` | Deterministic advisory output |
| `triggered_rules`| `array` | Computed | Array of triggered rule evidence objects | Explanation evidence items |

### Example Record:
```json
{
  "release_id": "REL-CASE-001",
  "hospital_id": "HOSP-CGH-01",
  "hospital_name": "City General Hospital",
  "application_name": "Clinical Portal",
  "version": "v4.14.2",
  "previous_version": "v4.14.1",
  "deployment_time": "2026-09-06T07:29:36.690151Z",
  "deployment_status": "MONITORING",
  "deployment_type": "HOTFIX",
  "engineer": "Sarah Chen (Release Eng)",
  "latency_ms": 1650.0,
  "latency_baseline_ms": 1000.0,
  "latency_change_percent": 65.0,
  "error_rate_percent": 0.35,
  "error_baseline_percent": 0.40,
  "error_change": -0.05,
  "service_availability_percent": 99.85,
  "transaction_count": 9800,
  "baseline_transaction_count": 10000,
  "transaction_drop_percent": 2.0,
  "customer_impact_level": "LOW",
  "affected_workflows": ["Clinical documentation"],
  "risk_score": 30,
  "risk_level": "MEDIUM",
  "recommendation": "HUMAN REVIEW"
}
```

---

## 3. Decision Record Schema (`data/decisions.json`)

Records human authorization decisions, confirming or overriding advisory recommendations.

### Field Definitions:
| Field Name | Type | Required | Constraints | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `number` | **Yes** | Auto-incrementing integer $\ge 1$ | Primary audit key |
| `timestamp` | `string` | **Yes** | ISO-8601 UTC timestamp | Time human decision recorded |
| `release_id` | `string` | **Yes** | Foreign key to `releases.json` | Associated release |
| `hospital_name` | `string` | **Yes** | Matches hospital tenant | Tenant name |
| `application_name`| `string` | **Yes** | Matches microservice | Application service name |
| `recommendation` | `string` | **Yes** | Matches adviser recommendation | System advisory recommendation |
| `final_decision` | `string` | **Yes** | `CONTINUE`, `ROLLBACK`, `SEND FOR REVIEW` | Final human operator action |
| `is_override` | `boolean` | **Yes** | `true` if `final_decision` differs from `recommendation` | Override indicator flag |
| `override_reason` | `string` | **Conditional**| Required if `is_override == true` (min 10 characters) | Documented clinical/operational reason |
| `decision_maker` | `string` | **Yes** | Non-empty string | Human operator name |
| `role` | `string` | **Yes** | `SOC / Operations Analyst` or `Release Manager` | Role of operator submitting decision |
| `risk_score` | `number` | **Yes** | Integer in $[0, 100]$ | Evaluated risk score at decision time |
| `triggered_rules_summary`| `string` | No | Comma-delimited list of rule names | Summary of triggered rules |

---

## 4. Rule Configuration Schema (`rules/default_rules.json`)

Governs the active criteria, operators, thresholds, and weights for rules R1–R6.

### Field Definitions:
| Field Name | Type | Required | Allowed Values | Description |
| :--- | :--- | :---: | :--- | :--- |
| `rule_id` | `string` | **Yes** | `R1`, `R2`, `R3`, `R4`, `R5`, `R6` | Rule identifier |
| `name` | `string` | **Yes** | Descriptive name | Short display name |
| `metric` | `string` | **Yes** | `error_rate_percent`, `latency_change_percent`, `transaction_drop_percent`, `customer_impact_level`, `service_availability_percent` | Signal property inspected |
| `operator` | `string` | **Yes** | `>`, `>=`, `<`, `<=`, `==` | Comparison operator |
| `threshold` | `number \| string`| **Yes**| Float or categorical string (`HIGH`, `CRITICAL`) | Boundary condition threshold |
| `weight` | `number` | **Yes** | Integer in $[1, 100]$ | Risk points contributed when triggered |
| `enabled` | `boolean` | **Yes** | `true` or `false` | Rule evaluation toggle |
| `category` | `string` | **Yes** | `technical` or `business` | Metric category classification |
| `description` | `string` | **Yes** | Clear plain-English sentence | Rule explanation string |

---

## 5. Rule Audit Schema (`data/rules_audit.json`)

Immutable historical log of all threshold, weight, or enablement changes.

### Field Definitions:
- `id`: Auto-incrementing integer key.
- `timestamp`: ISO-8601 UTC timestamp.
- `rule_id`: Identifier of modified rule (`R1`–`R6`).
- `rule_name`: Name of modified rule.
- `user_name`: Name of Release Manager executing modification.
- `user_role`: Operator role (strictly `"Release Manager"`).
- `old_threshold` & `new_threshold`: Captured threshold before and after edit.
- `old_weight` & `new_weight`: Captured weight before and after edit.
- `old_enabled` & `new_enabled`: Enablement toggle before and after edit.
- `change_reason`: Documented rationale for threshold recalibration.

---

## 6. Stakeholder Feedback Schema (`data/validations.json`)

Stores authentic multi-role user feedback from operations and clinical reviewers.

### Field Definitions:
- `id`: Integer primary key.
- `timestamp`: ISO-8601 UTC timestamp.
- `stakeholder_name`: Name of reviewer.
- `role`: Organizational persona (`SOC Analyst`, `Release Manager`, `Clinical User`, `DevOps Engineer`).
- `ease_of_use`: Numeric rating $1$ to $5$.
- `explanation_clarity`: Numeric rating $1$ to $5$.
- `confidence`: Numeric rating $1$ to $5$.
- `decision_usefulness`: Numeric rating $1$ to $5$.
- `evidence_usefulness`: Numeric rating $1$ to $5$.
- `overall_usability`: Numeric rating $1$ to $5$.
- `comments`: Qualitative feedback comments and suggestions.
- `is_prototype`: Boolean (`true`).

---

## 7. Entity Relationship Model

```
+-------------------+            1:N            +---------------------+
|   Hospital Tenant |-------------------------->|    Release Record   |
|   (HOSP-CGH-01)   |                           |    (REL-CASE-001)   |
+-------------------+                           +---------------------+
                                                           |
                                                           | 1:1
                                                           v
+-------------------+            1:N            +---------------------+
|     Operator      |-------------------------->|   Decision Record   |
| (Analyst/Manager) |                           |   (Audit Log ID)    |
+-------------------+                           +---------------------+
          |
          | 1:N
          v
+-------------------+            1:N            +---------------------+
|    Rule Audit     |<--------------------------|  Rule Configuration |
|  (Before / After) |                           |       (R1 - R6)     |
+-------------------+                           +---------------------+
```

---

## 8. Limitations of File-Based JSON Persistence

While JSON storage enables clean local demonstration, it has structural limitations for enterprise production:
1. **Concurrency & Locking:** Standard file operations do not support atomic multi-threaded write locking; concurrent writes could encounter race conditions under heavy load.
2. **Indexing:** All queries require in-memory filtering (`releases.filter(...)`) rather than B-tree index lookups.
3. **Audit Immutability:** OS-level file manipulation is theoretically possible without database row-level security (RLS).

---

## 9. Future Production Database Architecture

In an enterprise healthcare hospital deployment, this flat-file schema maps directly to **PostgreSQL with Row-Level Security (RLS)**:

```sql
-- Planned Enterprise DDL (Future Evolution)
CREATE TABLE hospitals (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    tier VARCHAR(64) NOT NULL
);

CREATE TABLE releases (
    release_id VARCHAR(64) PRIMARY KEY,
    hospital_id VARCHAR(32) REFERENCES hospitals(id),
    application_name VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL,
    latency_ms NUMERIC(10,2) CHECK (latency_ms >= 0),
    error_rate_percent NUMERIC(5,2) CHECK (error_rate_percent BETWEEN 0 AND 100),
    transaction_count INTEGER CHECK (transaction_count >= 0),
    customer_impact_level VARCHAR(16) CHECK (customer_impact_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    recommendation VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE decisions (
    id BIGSERIAL PRIMARY KEY,
    release_id VARCHAR(64) REFERENCES releases(release_id),
    final_decision VARCHAR(32) NOT NULL,
    is_override BOOLEAN NOT NULL,
    override_reason TEXT,
    decision_maker VARCHAR(128) NOT NULL,
    role VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** The current working prototype uses schema-validated JSON persistence as described in Sections 1–6. The relational database schema above is documented as the planned enterprise architecture for Phase 3+.
