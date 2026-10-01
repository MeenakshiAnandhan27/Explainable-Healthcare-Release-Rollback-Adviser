# Security Architecture & Role-Based Access Control (RBAC)

**Project:** Explainable Healthcare Release Rollback Adviser  
**Phase:** Phase 3 Architecture & Operational Hardening  
**Compliance Profile:** Healthcare IT Operational Governance Simulation  

---

## 1. Security Principles & Non-Negotiable Boundaries

The Explainable Healthcare Release Rollback Adviser is designed as an operational decision-support tool adhering to enterprise healthcare security standards:

1. **Least Privilege by Design:** Operations Analysts monitoring 24/7 queues possess authorization to view telemetry and execute advisory decisions, but are strictly prohibited from altering corporate risk calibration rules.
2. **Zero Protected Health Information (PHI):** The system strictly avoids ingesting, storing, or processing patient identifiers, electronic medical records (EMR), or HIPAA-regulated data. All releases, hospitals, and workflows are 100% synthetic simulations.
3. **No Autonomous Production Access:** The system possesses zero write access to Kubernetes clusters, cloud orchestrators, or continuous deployment pipelines. It outputs recommendations that require human authorization.
4. **Mandatory Audit Immutability:** Any attempt to override a system recommendation or reconfigure a risk threshold creates a tamper-evident audit record capturing user identity, timestamp, role, and before/after states.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Capability / Endpoint | SOC / Operations Analyst | Release Manager | Security Enforcement Mechanism |
| :--- | :---: | :---: | :--- |
| **Authenticate & Obtain Session** (`POST /api/auth/login`) | Yes | Yes | Demo credential verification returning role claims |
| **View Multi-Hospital Dashboards** (`GET /api/dashboard/stats`) | Yes | Yes | Tenant-scoped data partitioning |
| **Inspect Release Telemetry & Evidence** (`GET /api/releases/:id`) | Yes | Yes | Read-only API |
| **Submit Decision / Authorize Action** (`POST /api/decisions`) | Yes | Yes | Validates operator identity & role in payload |
| **Override Adviser Recommendation** (`POST /api/decisions`) | Yes | Yes | **Mandatory $\ge 10$ character justification check** |
| **View Historical Audit Logs** (`GET /api/decisions`) | Yes | Yes | Filterable read-only access |
| **Reconfigure Risk Rules** (`PUT /api/rules/:rule_id`) | **DENIED (403 Forbidden)** | **AUTHORIZED (200 OK)** | **Server-side RBAC Guard in `server.ts`** |
| **View Rule Change History** (`GET /api/rules/audit`) | Yes | Yes | Complete historical transparency |
| **Execute Reproducible Experiments** (`POST /api/experiment/run`)| Yes | Yes | Benchmark execution |

---

## 3. Server-Side RBAC Enforcement Implementation

Authorization is enforced directly on the Express API layer, never relying exclusively on client-side button hiding:

```typescript
// server.ts - RBAC Guard on Rule Reconfiguration
app.put("/api/rules/:rule_id", (req, res) => {
  const ruleId = req.params.rule_id;
  const updates = req.body;
  const userRole = updates.user_role || (req.headers["x-user-role"] as string);

  // RBAC Guard: Only Release Manager can modify rules
  if (userRole !== "Release Manager") {
    return res.status(403).json({
      error: "Forbidden: Only Release Managers possess permission to modify risk rules."
    });
  }

  // ... Proceed with authorized modification & audit log generation
});
```

### Verification via Automated Test:
- **`TEST 09` (`tests/test_permissions.py`):** Injects an Operations Analyst session attempting to alter Rule R1. Verifies that the server returns HTTP 403 Forbidden and preserves existing threshold state.
- **`TEST 10` (`tests/test_permissions.py`):** Injects a Release Manager session. Verifies HTTP 200 OK and immediate persistence to disk.

---

## 4. Input Validation & Defense-in-Depth Sanitization

### 1. Override Justification Validation
When an operator chooses a decision different from the adviser recommendation (e.g. choosing `CONTINUE` when `ROLLBACK RECOMMENDED` was advised):
```typescript
if (isOverride && (!override_reason || override_reason.trim().length < 10)) {
  return res.status(400).json({
    error: "A documented operational/clinical override reason (minimum 10 characters) is mandatory when differing from the adviser recommendation."
  });
}
```
- Prevents bypass via empty strings, whitespace, or single-word entries.

### 2. Telemetry Signal Boundary Validation
- **Negative Latency:** Prohibited by schema validation (`lat < 0` $\implies$ rejection).
- **Error Rate Overflows:** Prohibited by mathematical boundary check (`err < 0.0 || err > 100.0` $\implies$ rejection).
- **Duplicate ID Collisions:** Registry checks prevent accidental overwriting of historical releases.

---

## 5. Secret Management & Environment Hygiene

- **No Committed Secrets:** The repository contains no production database credentials, private API keys, or JWT private keys.
- **Environment Template:** Staging and deployment environments configure variables via `.env.example`:
  ```bash
  PORT=3000
  NODE_ENV=production
  ```
- **Demo Credentials:** Demo accounts (`analyst` / `analyst123` and `manager` / `manager123`) are explicitly flagged as simulated demonstration accounts for prototyping.
