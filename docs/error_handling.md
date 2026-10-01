# Comprehensive Error Handling & Fault-Tolerance Architecture

**Project:** Explainable Healthcare Release Rollback Adviser  
**Phase:** Phase 3 Architecture & Operational Hardening  
**Scope:** Client-Side React Error Boundaries, Express Middleware, Telemetry Sanitization, and Storage Safety  

---

## 1. Error Handling Philosophy & Safety Principles

In a mission-critical healthcare operations environment, application failures must **fail safe**, preserve operator context, and never leak sensitive clinical or infrastructure details.

The Explainable Healthcare Release Rollback Adviser adheres to five core fault-tolerance principles:

1. **Containment Over Cascading Failure:** A rendering failure in a complex chart component or telemetry card must not crash the entire operator dashboard or lock the operator out of emergency decision workflows.
2. **Deterministic Fallbacks:** When telemetry signals are missing or offline, the risk engine surfaces explicit `"Insufficient Evidence"` warnings rather than silently defaulting to a false-clean score.
3. **Strict Client-Server Validation Symmetry:** Input constraints (e.g. override justifications $\ge 10$ characters, error rates in $[0, 100]\%$) are enforced both on the client UI and the backend API.
4. **Sanitized User-Facing Errors:** Server responses provide clear, actionable descriptions of why a request failed without exposing internal file paths, database connection strings, or stack traces.
5. **No PHI or Secret Leakage:** Logs, audit records, and error responses strictly contain zero Protected Health Information (PHI) and zero infrastructure secrets.

---

## 2. React Client-Side Error Boundary

### Component: `src/components/ErrorBoundary.tsx`
The primary React Error Boundary intercepts uncaught JavaScript exceptions during the rendering, lifecycle, or constructor phases of child components.

```tsx
class ErrorBoundary extends Component<Props, State> {
  // Intercepts component render exceptions
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Logs diagnostic error info for debugging
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }
}
```

### Visual Fallback Interface
When an exception occurs within a wrapped route, the Error Boundary displays an isolated fallback interface:
- **Alert Header:** Displays a clear warning icon with contextual explanation: *"Application View Encountered an Error — A rendering issue was intercepted safely to prevent an application crash."*
- **Error Description Box:** Monospace diagnostic message displaying the safe sanitized error description.
- **Action Buttons:**
  - `Try Again` (calls `handleReset` to clear error state and attempt re-render)
  - `Return to System Dashboard` (resets page state back to `/dashboard` to restore operator visibility)

### Boundary Placement in Application Hierarchy (`src/App.tsx`)
```tsx
<main className="flex-1 p-6 max-w-7xl mx-auto w-full">
  <ErrorBoundary
    fallbackTitle="Operational View Intercepted"
    onReset={() => setCurrentPage("dashboard")}
  >
    {/* Page content rendered inside boundary */}
    {currentPage === "dashboard" && <DashboardPage ... />}
    {currentPage === "releases" && <ReleasesPage ... />}
    {currentPage === "release-detail" && <ReleaseDetailPage ... />}
    {/* ... other views */}
  </ErrorBoundary>
</main>
```

---

## 3. Backend Centralized Express Error Handling

### Middleware: `server.ts`
All unhandled exceptions, route errors, and async rejections pass into a centralized error handling middleware mounted at the end of the Express application pipeline:

```typescript
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = typeof err.status === "number" 
    ? err.status 
    : (typeof err.statusCode === "number" ? err.statusCode : 500);

  res.status(statusCode).json({
    error: err.message || "An unexpected internal server error occurred",
    status: statusCode,
    timestamp: new Date().toISOString()
  });
});
```

### Standardized Error Response Structure
Every failed API call returns a predictable JSON payload:
```json
{
  "error": "Descriptive reason for failure",
  "status": 400,
  "timestamp": "2026-10-01T04:30:00.000Z"
}
```

---

## 4. HTTP Status Code Taxonomy & Interception Catalog

| HTTP Status | Condition | Example Trigger | User-Facing Error Message |
| :--- | :--- | :--- | :--- |
| **400 Bad Request** | Schema violation or missing required justification | Operator overrides recommendation with empty reason or $<10$ characters | `"A documented operational/clinical override reason (minimum 10 characters) is mandatory when differing from the adviser recommendation."` |
| **401 Unauthorized** | Missing or invalid authentication credentials | Invalid login attempt on `/api/auth/login` | `"Invalid credentials. Use demo accounts: analyst/analyst123 or manager/manager123"` |
| **403 Forbidden** | RBAC permission violation | Operations Analyst attempting `PUT /api/rules/:rule_id` | `"Forbidden: Only Release Managers possess permission to modify risk rules."` |
| **404 Not Found** | Target resource ID does not exist in registry | Request for non-existent release `GET /api/releases/REL-9999` | `"Release REL-9999 not found"` |
| **500 Internal Error** | File I/O failure or unhandled server exception | Corrupt JSON file or disk write permission error | `"An unexpected internal server error occurred"` |

---

## 5. Telemetry Ingestion & Missing Signal Safety

### Safe Handling of Missing Telemetry (`server.ts` & `scripts/run_experiment.py`)
In real hospital deployment scenarios, telemetry collection agents may experience temporary network partitions. The risk engine explicitly evaluates null signals:

```typescript
// Missing Signal Sanitization
if (release.error_rate_percent === null || release.error_rate_percent === undefined) {
  warnings.push("Error rate telemetry signal is missing or offline.");
}
if (release.service_availability_percent === null || release.service_availability_percent === undefined) {
  warnings.push("Service availability telemetry is currently unavailable.");
}
if (release.transaction_count === 0) {
  warnings.push("Zero transactions recorded. Verify if this deployment occurred during a scheduled maintenance quiet period.");
}
```

### Edge Case Matrix:

| Signal Condition | Risk Engine Behavior | Safety Consequence |
| :--- | :--- | :--- |
| **Latency is `null`** | Skips Rule R2; attaches telemetry warning; does **not** evaluate to 0% | Avoids false-negative green rating |
| **Error rate is `null`** | Skips Rule R1; flags telemetry dropout | Surfaces warning in narrative evidence |
| **Transactions = 0 (Normal Baseline)** | Evaluates to 100% throughput drop $\implies$ Triggers Rule R3 (+25 pts) | Recommends `HUMAN REVIEW` to catch silent routing failures |
| **Transactions = 0 (Zero Baseline)** | Handled as un-onboarded tenant (0% drop) | Prevents false alert on inactive tenant |
| **Negative Latency (`< 0 ms`)** | Rejected by schema validator | Corrupted probe data discarded immediately |
| **Error Rate $> 100\%$** | Rejected by schema validator | Mathematical impossibility rejected |

---

## 6. Persistence & Storage Fault Tolerance

### File-Based Persistence Helpers (`readJsonSafe` / `writeJsonSafe`)
All JSON operations in `server.ts` use defensive I/O routines:
- **Read Safety (`readJsonSafe`):** If a file is missing or contains malformed JSON syntax, the routine catches the error, logs a diagnostic warning to the server console, and returns an empty fallback array (`[]` or `{}`) rather than crashing the Express process.
- **Write Safety (`writeJsonSafe`):** Before writing, the routine verifies that the parent directory (`data/`) exists (calling `fs.mkdirSync(dir, { recursive: true })` if absent) and writes formatted JSON.

---

## 7. Security & Privacy Guarantees in Error Handling

- **No Stack Traces Exposed:** Stack traces are logged server-side via `console.error` for developer investigation but are stripped from HTTP response payloads.
- **Zero Real PHI:** Because all release records, hospital tenant tags, and clinical workflows are 100% synthetic, no HIPAA or GDPR protected data exists in error messages or diagnostic traces.
- **Sanitized Audit Records:** Failed unauthorized actions (such as an Analyst attempting to modify a rule) are rejected with HTTP 403 and are prevented from polluting the production audit log.
