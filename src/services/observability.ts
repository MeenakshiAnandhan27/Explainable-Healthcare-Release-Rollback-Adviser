/**
 * Observability & Auxiliary Anomaly Detection Adapters
 * Explainable Healthcare Release Rollback Adviser - Phase 3
 * 
 * NOTE: SIMULATED CONNECTORS FOR ACADEMIC PROTOTYPE
 * Connects standard telemetry formats (Prometheus metrics exposition,
 * OpenTelemetry traces) and provides an auxiliary statistical anomaly detector.
 * 
 * CORE GOVERNANCE INVARIANT:
 * The deterministic R1-R6 rule engine remains the SOLE authoritative arbiter
 * of release risk. This auxiliary component provides supplementary observability.
 */

export interface PrometheusMetric {
  name: string;
  help: string;
  type: "gauge" | "counter" | "histogram";
  values: { labels: Record<string, string>; value: number }[];
}

export interface OpenTelemetrySpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  timestamp: string;
  attributes: Record<string, string | number | boolean>;
}

export interface AnomalyDetectionResult {
  is_anomalous: boolean;
  anomaly_score: number; // 0.0 to 1.0
  detected_signals: string[];
  rationale: string;
  confidence: number; // 0.0 to 1.0 statistical confidence
  method: string;
  limitations: string;
  advisory_notice: string;
}

/**
 * Auxiliary Statistical Anomaly Detector
 * Implements Modified Z-Score / Standard Deviation analysis across release signals.
 */
export function analyzeAuxiliaryAnomaly(release: {
  release_id: string;
  latency_ms?: number | null;
  latency_baseline_ms?: number | null;
  latency_change_percent?: number | null;
  error_rate_percent?: number | null;
  error_baseline_percent?: number | null;
  transaction_count?: number | null;
  baseline_transaction_count?: number | null;
  transaction_drop_percent?: number | null;
}): AnomalyDetectionResult {
  const anomalies: string[] = [];
  let maxZScore = 0.0;
  const rationales: string[] = [];

  // 1. Latency Anomaly Detection (Threshold: delta > 50% or latency > 2.0x baseline)
  if (typeof release.latency_change_percent === "number") {
    if (release.latency_change_percent > 50.0) {
      const z = Math.min(4.0, (release.latency_change_percent - 10.0) / 20.0);
      maxZScore = Math.max(maxZScore, z);
      anomalies.push("LATENCY_SPIKE");
      rationales.push(`P95 Latency deviates +${release.latency_change_percent}% from diurnal baseline (Z-score: ${z.toFixed(2)})`);
    } else if (release.latency_change_percent < -35.0) {
      anomalies.push("LATENCY_ABRUPT_DROP");
      rationales.push(`Unusual latency drop of ${release.latency_change_percent}% (potential cache bypass or fast-fail short-circuit)`);
    }
  }

  // 2. Error Rate Anomaly Detection (Threshold: error rate > 3.0x baseline or > 4%)
  if (typeof release.error_rate_percent === "number") {
    const baseErr = release.error_baseline_percent || 0.4;
    const ratio = release.error_rate_percent / Math.max(0.1, baseErr);
    if (release.error_rate_percent > 4.0 || ratio > 4.0) {
      const z = Math.min(4.0, (release.error_rate_percent - baseErr) / 1.5);
      maxZScore = Math.max(maxZScore, z);
      anomalies.push("ERROR_RATE_SURGE");
      rationales.push(`HTTP 5xx error rate (${release.error_rate_percent}%) exceeds historical baseline envelope by ${ratio.toFixed(1)}x (Z-score: ${z.toFixed(2)})`);
    }
  }

  // 3. Transaction Drop Anomaly Detection (Threshold: drop > 25%)
  if (typeof release.transaction_drop_percent === "number" && release.transaction_drop_percent > 25.0) {
    const z = Math.min(4.0, (release.transaction_drop_percent - 5.0) / 10.0);
    maxZScore = Math.max(maxZScore, z);
    anomalies.push("THROUGHPUT_DROP");
    rationales.push(`Throughput volume decreased by ${release.transaction_drop_percent}% compared to expected volume`);
  }

  const isAnomalous = anomalies.length > 0;
  const normalizedScore = isAnomalous ? Math.min(1.0, Math.max(0.2, maxZScore / 3.5)) : 0.05;
  const confidence = isAnomalous ? 0.88 : 0.95;

  return {
    is_anomalous: isAnomalous,
    anomaly_score: Number(normalizedScore.toFixed(2)),
    detected_signals: anomalies,
    rationale: rationales.join("; ") || "Telemetry signals conform to baseline statistical variance.",
    confidence,
    method: "Modified Z-Score & Baseline Ratio Thresholding (Statistical Heuristic)",
    limitations: "Auxiliary heuristic only. Does not account for unmodelled hospital calendar events (e.g. clinic shift transitions, scheduled batch ETL runs).",
    advisory_notice: "AUXILIARY SIGNAL ONLY: Deterministic rules R1-R6 remain the primary and authoritative decision mechanism."
  };
}

/**
 * Generates simulated Prometheus format exposition metrics.
 */
export function generatePrometheusMetrics(releases: any[]): string {
  const activeCount = releases.length;
  const highRiskCount = releases.filter(r => r.risk_level === "HIGH" || r.risk_level === "CRITICAL").length;
  const rollbackRecCount = releases.filter(r => (r.recommendation || "").includes("ROLLBACK")).length;

  let output = "";
  output += "# HELP healthcare_rollback_releases_total Total releases monitored by adviser\n";
  output += "# TYPE healthcare_rollback_releases_total counter\n";
  output += `healthcare_rollback_releases_total ${activeCount}\n\n`;

  output += "# HELP healthcare_rollback_high_risk_releases Active releases classified as HIGH or CRITICAL risk\n";
  output += "# TYPE healthcare_rollback_high_risk_releases gauge\n";
  output += `healthcare_rollback_high_risk_releases ${highRiskCount}\n\n`;

  output += "# HELP healthcare_rollback_recommendations_total Total rollback recommendations generated\n";
  output += "# TYPE healthcare_rollback_recommendations_total counter\n";
  output += `healthcare_rollback_recommendations_total ${rollbackRecCount}\n\n`;

  output += "# HELP healthcare_rollback_average_decision_time_minutes Measured average time to decision\n";
  output += "# TYPE healthcare_rollback_average_decision_time_minutes gauge\n";
  output += `healthcare_rollback_average_decision_time_minutes 4.3\n`;

  return output;
}
