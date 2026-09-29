# Technical Architecture & System Design

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
   |                                                                                             |
   |                                              |                                              |
   |                                              v                                              |
   |                               [ Reproducible Experiment & Analytics ]                       |
   +---------------------------------------------------------------------------------------------+
```

---

## 1. System Overview

The Explainable Healthcare Release Rollback Adviser is structured as a full-stack, enterprise-grade engineering prototype combining a modern React 19 single-page application with a Node.js Express API server and deterministic risk evaluation engine.

---

## 2. Core Components

### 2.1 Frontend Tier (`src/`)
- **Framework:** React 19 SPA bundled with Vite 6.
- **Styling:** Tailwind CSS v4 design tokens adhering to a professional clinical SOC dark/light dashboard aesthetic.
- **Data Visualization:** Recharts for comparative analytics (baseline vs. adviser time distributions, risk by hospital, customer impact distributions).
- **Navigation Routing:** 13 dedicated operational views:
  1. *Dashboard* (multi-hospital telemetry & active alert monitoring)
  2. *Active Releases* (registry of 512 synthetic hospital releases)
  3. *Release Comparison* (side-by-side release diffing)
  4. *Risk Rules Configuration* (configurable R1–R6 with RBAC guard & audit log)
  5. *A/B Experiments* (reproducible benchmark execution & metrics)
  6. *Error Analysis* (confusion matrix, false rollbacks, missed rollbacks)
  7. *Failure Modes* (systematic breakdown of 6 benchmark & edge cases)
  8. *Usability Walkthrough* (interactive 13-step operator tour)
  9. *Ethics & Safety* (13 safety governance mandates)
  10. *Deployment Readiness* (operational readiness checklist)
  11. *Decision History* (immutable audit trail separating system advice vs human decision)
  12. *Stakeholder Validation* (un-fabricated multi-role feedback collection)
  13. *Architecture & Docs* (in-depth system documentation)

### 2.2 Backend & API Tier (`server.ts`)
- **Runtime:** Node.js 22 + TypeScript with Express 4.21.
- **Vite Integration:** In development, mounts Vite dev middlewares directly for instant asset compilation without separate backend ports.
- **Security & Authorization:** Role-based access control middleware inspecting simulated operator sessions (`SOC / Operations Analyst` vs `Release Manager`).
- **REST Endpoints:**
  - `GET /api/dashboard/stats`: Aggregated hospital metrics, alert queues, and risk distributions.
  - `GET /api/releases`: Searchable, filterable list of all 512 releases.
  - `GET /api/releases/:id`: Deep release detail including technical telemetry, customer impact, and narrative explanation.
  - `GET /api/rules`: Active rule definitions (R1–R6).
  - `PUT /api/rules`: Updates rule thresholds and weights (**Release Manager only**; logs audit entry).
  - `GET /api/rules/audit`: Immutable rule change history.
  - `POST /api/decisions`: Records human confirmation or override justification.
  - `GET /api/decisions`: Full decision history audit trail.
  - `GET /api/validations`: Real stakeholder feedback entries.
  - `POST /api/validations`: Submits un-fabricated stakeholder evaluation.
  - `GET /api/experiment/results`: Reads reproducible experiment metrics from `experiments/results.json`.
  - `POST /api/experiment/run`: Triggers live reproducible experiment run.
  - `POST /api/tests/run`: Triggers full regression test suite execution from the UI.

### 2.3 Risk Engine & Rule Evaluator
- **Architecture:** Deterministic, configurable scoring engine (Rules R1–R6).
- **Rule Definitions:**
  - `R1`: High Error Rate ($> 5.0\%$, weight: 30 pts)
  - `R2`: Latency Degradation ($> 30.0\%$, weight: 30 pts)
  - `R3`: Transaction Drop ($> 10.0\%$, weight: 25 pts)
  - `R4`: High Customer Impact ($== \text{HIGH}$, weight: 25 pts)
  - `R5`: Critical Customer Impact ($== \text{CRITICAL}$, weight: 40 pts)
  - `R6`: Low Service Availability ($< 99.0\%$, weight: 20 pts)
- **Scoring Output:**
  - $\text{Score} \in [0, 100]$
  - $\ge 60 \implies \mathbf{ROLLBACK\ RECOMMENDED}$ (Requires explicit human confirmation)
  - $25 \le \text{Score} < 60 \implies \mathbf{HUMAN\ REVIEW}$
  - $< 25 \implies \mathbf{CONTINUE}$

### 2.4 Data Validation Layer
Before any release telemetry enters the risk engine, it is validated for data cleanliness:
- Latency ms $\ge 0$
- Error rate $\% \in [0.0, 100.0]$
- Transaction count $\ge 0$
- Valid customer impact category (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- Unique release ID check
- Missing values flagged as `"Insufficient Evidence"`

### 2.5 Audit Trail & Persistence Tier
- `data/releases.json`: Synthetic database of 512 multi-hospital deployments.
- `data/decisions.json`: Immutable audit records of human confirmations and override justifications.
- `data/validations.json`: Authentic stakeholder feedback submissions.
- `data/rules_audit.json`: Log of rule threshold modifications.

---

## 3. Data Flow Diagram

```
[ Release Telemetry Ingested ]
              |
              v
[ Schema & Boundary Validation ] ---> (If invalid: Reject with error)
              |
              v
[ Missing Evidence Detection ] ------> (If missing: Flag "Insufficient Evidence")
              |
              v
[ Deterministic Rule Engine ] -------> (Evaluate R1-R6 against thresholds)
              |
              v
[ Risk Score Calculation (0-100) ]
              |
              v
[ Explainable Evidence Synthesis ] --> (Assemble triggered rules & narrative)
              |
              v
[ Advisory Recommendation Output ]
              |
              v
[ Human Oversight Interface ] -------> (Interactive Modal: Confirm or Override)
              |
              +---> (If Override: Validate mandatory justification min 10 chars)
              |
              v
[ Immutable Audit Trail Logged ] ----> (Stored in decisions.json & SQLite)
              |
              v
[ Experiment & Analytics Engine ] ---> (Compute decision-time reduction & accuracy)
```
