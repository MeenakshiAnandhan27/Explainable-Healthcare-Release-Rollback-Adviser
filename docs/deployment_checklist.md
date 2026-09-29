# Deployment Readiness Checklist

> **PROTOTYPE READINESS DISCLAIMER:**
> This checklist documents operational readiness requirements for migrating the Explainable Healthcare Release Rollback Adviser from the current Phase 2 engineering prototype to an enterprise staging or production healthcare environment.
> Items marked **[X]** reflect features implemented and validated within this prototype. Items marked **[ ]** represent infrastructure and governance requirements mandatory for live production deployment.

---

## 1. ENVIRONMENT

- [X] **Prototype staging and development runtime identified:** Node.js 22 + TypeScript + Vite + Express proxy running on port 3000.
- [X] **Environment configuration templated:** `.env.example` defined with `PORT` and `NODE_ENV`.
- [ ] **Production cloud hosting identified:** HIPAA-compliant dedicated VPC cluster (e.g. Google Cloud Run / GKE with customer-managed encryption keys).
- [ ] **Production environment variables isolated:** Secret Manager / Vault integration configured for all API credentials.
- [ ] **Secrets management pipeline verified:** Zero hardcoded tokens or production credentials committed to version control.
- [ ] **High availability and load balancing configured:** Multi-zone ingress controllers with health check endpoints.

---

## 2. DATABASE & DATA PERSISTENCE

- [X] **Prototype data persistence established:** Schema-validated JSON file storage (`data/releases.json`, `data/decisions.json`, `data/validations.json`, `rules/default_rules.json`) with atomic in-memory access.
- [X] **Decision audit trail implemented:** Every human confirmation, override justification, and recommendation is immutably recorded with timestamps.
- [X] **Rule change audit logging enabled:** Every threshold or weight modification by Release Managers captures previous and updated state.
- [ ] **Production relational database provisioned:** Enterprise PostgreSQL / Cloud SQL with automated failover and read replicas.
- [ ] **Database migrations automated:** Schema versioning via Flyway or Drizzle ORM migrations.
- [ ] **Automated backup & point-in-time recovery (PITR):** Verified daily snapshots with 30-day retention and tested restore procedures.

---

## 3. MONITORING & TELEMETRY INGESTION

- [X] **Technical latency monitoring signals modeled:** Baseline latency ms, post-release latency ms, and percentage degradation calculated.
- [X] **Error rate monitoring signals modeled:** Baseline error %, current error %, and delta error rate monitored.
- [X] **Transaction throughput monitoring modeled:** Baseline transaction volume, current volume, and percentage drop calculated.
- [X] **Clinical/customer impact indicators integrated:** 4-tier categorical impact (LOW, MEDIUM, HIGH, CRITICAL) mapping affected hospital workflows.
- [X] **Missing telemetry handling:** Missing signals explicitly flagged as "Insufficient evidence" rather than silently presumed safe.
- [ ] **Live OpenTelemetry / Prometheus connectors:** Real-time push collectors feeding live Datadog, Prometheus, or Cloud Monitoring metrics.
- [ ] **Automated dead-man alerts:** PagerDuty integration triggered if telemetry collectors go silent for > 60 seconds post-deployment.

---

## 4. SECURITY & ACCESS CONTROL

- [X] **Role-Based Access Control (RBAC) modeled:** Distinct capabilities for "SOC / Operations Analyst" (view, confirm, override) vs. "Release Manager" (rule configuration, experiments, validations).
- [X] **Negative permission enforcement:** Analysts strictly forbidden from modifying risk rule thresholds (HTTP 403 Forbidden verified via automated test).
- [X] **Audit integrity:** Override reasons strictly mandated (minimum 10 characters) and persisted with operator identity.
- [ ] **Enterprise Single Sign-On (SSO):** SAML 2.0 / OAuth2 OpenID Connect integration with hospital enterprise identity providers (Okta / Azure AD).
- [ ] **End-to-End TLS Encryption:** Strict HTTPS enforcement with TLS 1.3, HSTS headers, and automated certificate renewal.
- [ ] **Protected Health Information (PHI) sanitization:** Automated log scrubber to guarantee no patient identifiers ever enter SOC audit logs.

---

## 5. OPERATIONS & INCIDENT PROCEDURES

- [X] **Advisory boundary enforced:** System explicitly restricted to advisory recommendations (`ROLLBACK RECOMMENDED`, `HUMAN REVIEW`, `CONTINUE`); no direct automated production rollback.
- [X] **Mandatory human confirmation workflow:** Interactive UI modal requires deliberate human authorization to execute rollback advisories.
- [X] **Standardized failure mode catalog:** 6 benchmark and edge cases documented with expected behavior and mitigations.
- [ ] **Documented SOP for emergency manual rollback:** Step-by-step Runbook for container revert, blue-green traffic switch, and database schema rollback.
- [ ] **Incident Command escalation protocol:** Defined on-call rotation with primary and secondary clinical SRE contacts.
- [ ] **Post-incident review (PIR) export:** Automated export of adviser audit trail for joint engineering and clinical governance post-mortems.

---

## 6. VALIDATION & TESTING

- [X] **Deterministic risk engine validation:** Rules R1–R6 validated against 100% deterministic mathematical evaluations.
- [X] **Automated regression test suite:** 15 executable tests verifying risk calculation, failure modes, RBAC permissions, override constraints, and data validation.
- [X] **Reproducible experiment verification:** Scripted benchmark (`scripts/run_experiment.py`) with fixed random seed 42 verifying decision time, accuracy, and baseline reconciliation.
- [X] **Data quality validation:** Schema engine rejecting negative latency, error rates > 100%, and duplicate release IDs.
- [X] **Real stakeholder feedback collection module:** Dedicated un-fabricated collection interface capturing multi-role usability, clarity, and usefulness scores.
- [ ] **Chaos engineering / fault injection:** Staging verification with simulated Kafka/Redis outages to confirm adviser resilience.
- [ ] **Hospital clinical governance committee sign-off:** Formal approval by hospital CMIO and IT steering committee.
