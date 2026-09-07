import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");
const RULES_FILE = path.join(ROOT_DIR, "rules", "default_rules.json");
const RELEASES_FILE = path.join(DATA_DIR, "releases.json");
const EXPERIMENTS_FILE = path.join(ROOT_DIR, "experiments", "experiment_data.json");
const DECISIONS_FILE = path.join(DATA_DIR, "decisions.json");
const VALIDATIONS_FILE = path.join(DATA_DIR, "validations.json");

// Helper to safely read JSON
function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to safely write JSON
function writeJsonSafe(filePath: string, data: any): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Ensure initial decision & validation files exist
if (!fs.existsSync(DECISIONS_FILE)) {
  const initialDecisions = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      release_id: "REL-2026-0008",
      hospital_name: "City General Hospital",
      application_name: "Clinical Portal",
      recommendation: "CONTINUE",
      final_decision: "CONTINUE",
      is_override: false,
      override_reason: "",
      decision_maker: "analyst (SOC Analyst)",
      role: "SOC / Operations Analyst",
      risk_score: 15,
      triggered_rules_summary: "None"
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      release_id: "REL-2026-0012",
      hospital_name: "St. Mary's Medical Center",
      application_name: "Electronic Health Record Service",
      recommendation: "ROLLBACK RECOMMENDED",
      final_decision: "CONTINUE",
      is_override: true,
      override_reason: "Error spike was caused by a temporary downstream lab connector timeout during scheduled vendor maintenance, which has already resolved.",
      decision_maker: "manager (Release Manager)",
      role: "Release Manager",
      risk_score: 65,
      triggered_rules_summary: "High Error Rate (>5%), Latency Degradation (>30%)"
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      release_id: "REL-2026-0019",
      hospital_name: "Metro Care Hospital",
      application_name: "Pharmacy Management Service",
      recommendation: "ROLLBACK RECOMMENDED (HIGH IMPACT CONFIRMATION REQUIRED)",
      final_decision: "ROLLBACK",
      is_override: false,
      override_reason: "",
      decision_maker: "manager (Release Manager)",
      role: "Release Manager",
      risk_score: 85,
      triggered_rules_summary: "Critical Customer Impact, Transaction Drop (>10%), High Error Rate (>5%)"
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      release_id: "REL-CASE-001",
      hospital_name: "City General Hospital",
      application_name: "Clinical Portal",
      recommendation: "HUMAN REVIEW",
      final_decision: "HUMAN REVIEW",
      is_override: false,
      override_reason: "",
      decision_maker: "analyst (SOC Analyst)",
      role: "SOC / Operations Analyst",
      risk_score: 40,
      triggered_rules_summary: "Latency Degradation (+65% > 30%)"
    }
  ];
  writeJsonSafe(DECISIONS_FILE, initialDecisions);
}

if (!fs.existsSync(VALIDATIONS_FILE)) {
  const initialValidations = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      stakeholder_name: "Dr. Aris Thorne",
      stakeholder_role: "Chief Medical Information Officer (CMIO)",
      usability_rating: 5,
      explanation_clarity_rating: 5,
      confidence_rating: 4,
      feedback: "The separation of clinical workflow impact versus raw error logs is exceptional. Engineers often roll back prematurely without knowing if doctors are actually blocked.",
      suggested_improvement: "Include a quick filter for releases impacting inpatient ICU medication pathways specifically.",
      is_prototype: true
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      stakeholder_name: "Rachel Vance",
      stakeholder_role: "Clinical Operations Incident Commander",
      usability_rating: 4,
      explanation_clarity_rating: 5,
      confidence_rating: 5,
      feedback: "Requiring a mandatory override reason has created an instant audit trail that saves us hours in post-incident reviews.",
      suggested_improvement: "Add a one-click export of the decision audit log for compliance reporting.",
      is_prototype: true
    }
  ];
  writeJsonSafe(VALIDATIONS_FILE, initialValidations);
}

// Rule Engine Evaluator in Node (identical to backend/rules_engine.py)
function evaluateRelease(release: any, rules: any[]) {
  let score = 0;
  const triggered: any[] = [];
  const warnings: string[] = [];

  if (release.error_rate_percent === null || release.error_rate_percent === undefined) {
    warnings.push("Error rate telemetry signal is missing or offline.");
  }
  if (release.service_availability_percent === null || release.service_availability_percent === undefined) {
    warnings.push("Service availability telemetry is currently unavailable.");
  }
  if (release.transaction_count === 0) {
    warnings.push("Zero transactions recorded. Verify if this deployment occurred during a scheduled maintenance quiet period.");
  }
  if (typeof release.latency_change_percent === "number" && release.latency_change_percent < -20) {
    warnings.push(`Significant latency improvement (${release.latency_change_percent}%) detected (e.g. cache warm-up or indexing gain).`);
  }

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const val = release[rule.metric];
    if (val === null || val === undefined) continue;

    let isTriggered = false;
    const thresh = rule.threshold;

    if (rule.operator === ">" && typeof val === "number" && val > Number(thresh)) {
      isTriggered = true;
    } else if (rule.operator === "<" && typeof val === "number" && val < Number(thresh)) {
      isTriggered = true;
    } else if (rule.operator === "==" && String(val).toUpperCase() === String(thresh).toUpperCase()) {
      isTriggered = true;
    }

    if (isTriggered) {
      score += Number(rule.weight || 0);
      triggered.push({
        rule_id: rule.rule_id,
        name: rule.name,
        description: rule.description,
        weight: rule.weight,
        metric: rule.metric,
        value: val,
        threshold: thresh
      });
    }
  }

  score = Math.min(100, Math.max(0, score));

  let riskLevel = "LOW";
  let recommendation = "CONTINUE";

  if (score < 30) {
    riskLevel = "LOW";
    recommendation = "CONTINUE";
  } else if (score < 60) {
    riskLevel = "MEDIUM";
    recommendation = "HUMAN REVIEW";
  } else if (score < 80) {
    riskLevel = "HIGH";
    recommendation = "ROLLBACK RECOMMENDED";
  } else {
    riskLevel = "CRITICAL";
    recommendation = "ROLLBACK RECOMMENDED (HIGH IMPACT CONFIRMATION REQUIRED)";
  }

  const narrativePoints: string[] = [];
  if (triggered.length === 0) {
    narrativePoints.push("All technical and clinical impact signals remain well within acceptable operational baseline envelopes.");
  } else {
    for (const t of triggered) {
      if (t.metric === "error_rate_percent") {
        narrativePoints.push(`Error rate reached ${t.value}%, surpassing configured safety threshold of ${t.threshold}%.`);
      } else if (t.metric === "latency_change_percent") {
        narrativePoints.push(`Service latency increased by ${t.value}% over baseline (threshold: ${t.threshold}%).`);
      } else if (t.metric === "transaction_drop_percent") {
        narrativePoints.push(`Transaction throughput dropped by ${t.value}% compared to historical baseline (threshold: ${t.threshold}%).`);
      } else if (t.metric === "customer_impact_level") {
        narrativePoints.push(`Clinical customer impact classified as ${t.value} affecting patient-care workflows.`);
      } else if (t.metric === "service_availability_percent") {
        narrativePoints.push(`Service availability degraded to ${t.value}% (below required ${t.threshold}% SLA).`);
      } else {
        narrativePoints.push(`Rule '${t.name}' triggered with value ${t.value} against threshold ${t.threshold}.`);
      }
    }
  }

  let summary = "";
  if (riskLevel === "LOW") {
    summary = "Release demonstrates healthy technical telemetry and minimal patient-care risk. Proceed with standard monitoring.";
  } else if (riskLevel === "MEDIUM") {
    summary = "Anomalies detected in technical or business signals that warrant human engineer review before authorizing promotion.";
  } else if (riskLevel === "HIGH") {
    summary = "Multiple critical risk thresholds have been exceeded. A release rollback is strongly recommended to preserve hospital operations.";
  } else {
    summary = "Critical operational degradation or high-severity workflow impact detected. Rollback recommended immediately with mandatory senior confirmation.";
  }

  const explanation = {
    summary,
    narrative_points: narrativePoints,
    warnings,
    evidence: {
      error_rate: {
        value: release.error_rate_percent !== null && release.error_rate_percent !== undefined ? `${release.error_rate_percent}%` : "N/A",
        baseline: release.error_baseline_percent !== null && release.error_baseline_percent !== undefined ? `${release.error_baseline_percent}%` : "N/A",
        threshold: "5.0%"
      },
      latency: {
        value: release.latency_ms !== null && release.latency_ms !== undefined ? `${release.latency_ms} ms` : "N/A",
        baseline: release.latency_baseline_ms !== null && release.latency_baseline_ms !== undefined ? `${release.latency_baseline_ms} ms` : "N/A",
        change: release.latency_change_percent !== null && release.latency_change_percent !== undefined ? `${release.latency_change_percent}%` : "N/A"
      },
      transactions: {
        value: release.transaction_count !== null && release.transaction_count !== undefined ? String(release.transaction_count) : "N/A",
        baseline: release.baseline_transaction_count !== null && release.baseline_transaction_count !== undefined ? String(release.baseline_transaction_count) : "N/A",
        drop: release.transaction_drop_percent !== null && release.transaction_drop_percent !== undefined ? `${release.transaction_drop_percent}%` : "N/A"
      },
      customer_impact: release.customer_impact_level || "UNKNOWN",
      affected_workflows: release.affected_workflows || []
    }
  };

  return {
    risk_score: score,
    risk_level: riskLevel,
    recommendation,
    triggered_rules: triggered,
    explanation
  };
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    system: "Explainable Healthcare Release Rollback Adviser",
    advisory_notice: "Advisory system — no automatic production rollback.",
    environment: "prototype_synthetic",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const u = (username || "").trim().toLowerCase();
  
  if (u === "analyst" && password === "analyst123") {
    return res.json({
      success: true,
      username: "analyst",
      role: "SOC / Operations Analyst",
      name: "Sarah Connor (SOC Tier 2)",
      token: `demo-token-analyst-${Date.now()}`
    });
  } else if (u === "manager" && password === "manager123") {
    return res.json({
      success: true,
      username: "manager",
      role: "Release Manager",
      name: "Dr. Marcus Brody (Lead Release Mgr)",
      token: `demo-token-manager-${Date.now()}`
    });
  }

  return res.status(401).json({
    error: "Invalid credentials. Use demo accounts: analyst/analyst123 or manager/manager123"
  });
});

app.get("/api/hospitals", (req, res) => {
  res.json([
    { id: "HOSP-CGH-01", name: "City General Hospital", tier: "Trauma Level 1", deployments: 104 },
    { id: "HOSP-SMMC-02", name: "St. Mary's Medical Center", tier: "Specialty Cardiac", deployments: 102 },
    { id: "HOSP-LKH-03", name: "Lakeside Hospital", tier: "Community Regional", deployments: 101 },
    { id: "HOSP-MCH-04", name: "Metro Care Hospital", tier: "Academic Medical Center", deployments: 103 },
    { id: "HOSP-GVH-05", name: "Green Valley Hospital", tier: "Ambulatory & Surgical", deployments: 102 }
  ]);
});

app.get("/api/rules", (req, res) => {
  const rules = readJsonSafe<any[]>(RULES_FILE, []);
  res.json(rules);
});

app.put("/api/rules/:rule_id", (req, res) => {
  const ruleId = req.params.rule_id;
  const updates = req.body;
  const rules = readJsonSafe<any[]>(RULES_FILE, []);
  
  const idx = rules.findIndex((r) => r.rule_id === ruleId);
  if (idx === -1) {
    return res.status(404).json({ error: `Rule ${ruleId} not found` });
  }

  rules[idx] = {
    ...rules[idx],
    ...updates
  };

  writeJsonSafe(RULES_FILE, rules);

  // Recalculate releases with updated rules
  const releases = readJsonSafe<any[]>(RELEASES_FILE, []);
  for (const rel of releases) {
    const evalRes = evaluateRelease(rel, rules);
    rel.risk_score = evalRes.risk_score;
    rel.risk_level = evalRes.risk_level;
    rel.recommendation = evalRes.recommendation;
    rel.triggered_rules = evalRes.triggered_rules;
  }
  writeJsonSafe(RELEASES_FILE, releases);

  res.json(rules[idx]);
});

app.post("/api/rules/evaluate", (req, res) => {
  const releaseData = req.body;
  const rules = readJsonSafe<any[]>(RULES_FILE, []);
  const evalRes = evaluateRelease(releaseData, rules);
  res.json(evalRes);
});

app.get("/api/dashboard/stats", (req, res) => {
  const hospitalId = req.query.hospital_id as string;
  let releases = readJsonSafe<any[]>(RELEASES_FILE, []);
  
  if (hospitalId && hospitalId !== "ALL") {
    releases = releases.filter((r) => r.hospital_id === hospitalId);
  }

  const total = releases.length;
  const evaluated = releases.filter((r) => r.risk_score !== undefined).length;
  const highRisk = releases.filter((r) => r.risk_level === "HIGH" || r.risk_level === "CRITICAL").length;
  const rollbacks = releases.filter((r) => (r.recommendation || "").includes("ROLLBACK")).length;
  const continues = releases.filter((r) => (r.recommendation || "").includes("CONTINUE")).length;
  const humanReviews = releases.filter((r) => (r.recommendation || "").includes("HUMAN REVIEW")).length;

  const times = releases.map((r) => r.adviser_decision_time_min || 4.2);
  const avgDecisionTime = times.length > 0 ? Number((times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)) : 4.2;

  const impactDist = {
    LOW: releases.filter((r) => r.customer_impact_level === "LOW").length,
    MEDIUM: releases.filter((r) => r.customer_impact_level === "MEDIUM").length,
    HIGH: releases.filter((r) => r.customer_impact_level === "HIGH").length,
    CRITICAL: releases.filter((r) => r.customer_impact_level === "CRITICAL").length
  };

  res.json({
    total_deployments: total,
    releases_evaluated: evaluated,
    high_risk_releases: highRisk,
    rollback_recommendations: rollbacks,
    continue_recommendations: continues,
    human_review_cases: humanReviews,
    average_decision_time_min: avgDecisionTime,
    baseline_average_decision_time_min: 48.5,
    customer_impact_distribution: impactDist,
    recent_alerts: releases.slice(0, 5)
  });
});

app.get("/api/releases", (req, res) => {
  const hospitalId = req.query.hospital_id as string;
  const riskLevel = req.query.risk_level as string;
  const search = ((req.query.search as string) || "").toLowerCase().trim();
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  let releases = readJsonSafe<any[]>(RELEASES_FILE, []);

  if (hospitalId && hospitalId !== "ALL") {
    releases = releases.filter((r) => r.hospital_id === hospitalId);
  }
  if (riskLevel && riskLevel !== "ALL") {
    releases = releases.filter((r) => r.risk_level === riskLevel);
  }
  if (search) {
    releases = releases.filter(
      (r) =>
        r.release_id.toLowerCase().includes(search) ||
        r.application_name.toLowerCase().includes(search) ||
        r.hospital_name.toLowerCase().includes(search) ||
        r.version.toLowerCase().includes(search) ||
        (r.engineer || "").toLowerCase().includes(search)
    );
  }

  const total = releases.length;
  const items = releases.slice(offset, offset + limit);

  res.json({
    total,
    items
  });
});

app.get("/api/releases/:release_id", (req, res) => {
  const releaseId = req.params.release_id;
  const releases = readJsonSafe<any[]>(RELEASES_FILE, []);
  const rules = readJsonSafe<any[]>(RULES_FILE, []);

  const rel = releases.find((r) => r.release_id === releaseId);
  if (!rel) {
    return res.status(404).json({ error: `Release ${releaseId} not found` });
  }

  const evalRes = evaluateRelease(rel, rules);
  const detail = {
    ...rel,
    ...evalRes
  };

  res.json(detail);
});

app.post("/api/decisions", (req, res) => {
  const { release_id, final_decision, override_reason, decision_maker, role } = req.body;
  const releases = readJsonSafe<any[]>(RELEASES_FILE, []);
  const rules = readJsonSafe<any[]>(RULES_FILE, []);
  const decisions = readJsonSafe<any[]>(DECISIONS_FILE, []);

  const relIndex = releases.findIndex((r) => r.release_id === release_id);
  if (relIndex === -1) {
    return res.status(404).json({ error: `Release ${release_id} not found` });
  }

  const rel = releases[relIndex];
  const evalRes = evaluateRelease(rel, rules);
  const rec = evalRes.recommendation;

  const isRollbackRec = rec.includes("ROLLBACK");
  const isContinueRec = rec.includes("CONTINUE");
  const isReviewRec = rec.includes("HUMAN REVIEW");

  const normalizedDecision = (final_decision || "").toUpperCase().trim();
  let isOverride = false;

  if (isRollbackRec && (normalizedDecision === "CONTINUE" || normalizedDecision === "SEND FOR REVIEW")) {
    isOverride = true;
  } else if (isContinueRec && (normalizedDecision === "ROLLBACK" || normalizedDecision === "SEND FOR REVIEW")) {
    isOverride = true;
  } else if (isReviewRec && (normalizedDecision === "ROLLBACK" || normalizedDecision === "CONTINUE")) {
    isOverride = true;
  }

  if (isOverride && (!override_reason || !override_reason.trim())) {
    return res.status(400).json({
      error: "An override reason is mandatory when your decision differs from the adviser recommendation."
    });
  }

  const triggeredSummary = evalRes.triggered_rules.map((t: any) => t.name).join(", ") || "None";

  const newDecision = {
    id: decisions.length > 0 ? Math.max(...decisions.map((d: any) => d.id)) + 1 : 1,
    timestamp: new Date().toISOString(),
    release_id,
    hospital_name: rel.hospital_name,
    application_name: rel.application_name,
    recommendation: rec,
    final_decision: normalizedDecision,
    is_override: isOverride,
    override_reason: isOverride ? override_reason.trim() : "",
    decision_maker: decision_maker || "Unknown",
    role: role || "Operations Analyst",
    risk_score: evalRes.risk_score,
    triggered_rules_summary: triggeredSummary
  };

  decisions.unshift(newDecision);
  writeJsonSafe(DECISIONS_FILE, decisions);

  // Update release status
  const newStatus = normalizedDecision === "ROLLBACK" ? "ROLLED_BACK" : (normalizedDecision === "CONTINUE" ? "CONTINUED" : "PENDING_REVIEW");
  releases[relIndex].deployment_status = newStatus;
  writeJsonSafe(RELEASES_FILE, releases);

  res.json({
    status: "success",
    message: `Decision for ${release_id} successfully recorded and audited.`,
    decision: newDecision
  });
});

app.get("/api/decisions", (req, res) => {
  const hospital = req.query.hospital as string;
  const role = req.query.role as string;
  const decision = req.query.decision as string;
  const limit = parseInt(req.query.limit as string) || 50;

  let decisions = readJsonSafe<any[]>(DECISIONS_FILE, []);

  if (hospital && hospital !== "ALL") {
    decisions = decisions.filter((d) => d.hospital_name === hospital);
  }
  if (role && role !== "ALL") {
    decisions = decisions.filter((d) => d.role === role);
  }
  if (decision && decision !== "ALL") {
    decisions = decisions.filter((d) => d.final_decision === decision);
  }

  res.json(decisions.slice(0, limit));
});

app.get("/api/experiments", (req, res) => {
  const expData = readJsonSafe<any>(EXPERIMENTS_FILE, null);
  if (!expData) {
    return res.status(404).json({ error: "Experiment data not available" });
  }
  res.json(expData);
});

app.post("/api/validations", (req, res) => {
  const { stakeholder_name, stakeholder_role, usability_rating, explanation_clarity_rating, confidence_rating, feedback, suggested_improvement } = req.body;
  const validations = readJsonSafe<any[]>(VALIDATIONS_FILE, []);

  const newFeedback = {
    id: validations.length > 0 ? Math.max(...validations.map((v: any) => v.id)) + 1 : 1,
    timestamp: new Date().toISOString(),
    stakeholder_name: stakeholder_name || "Anonymous Stakeholder",
    stakeholder_role: stakeholder_role || "Clinical User",
    usability_rating: Number(usability_rating || 5),
    explanation_clarity_rating: Number(explanation_clarity_rating || 5),
    confidence_rating: Number(confidence_rating || 5),
    feedback: feedback || "",
    suggested_improvement: suggested_improvement || "",
    is_prototype: true
  };

  validations.unshift(newFeedback);
  writeJsonSafe(VALIDATIONS_FILE, validations);

  res.json({
    status: "success",
    message: "Stakeholder feedback recorded for prototype validation.",
    data: newFeedback
  });
});

app.get("/api/validations", (req, res) => {
  const validations = readJsonSafe<any[]>(VALIDATIONS_FILE, []);
  res.json(validations);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
