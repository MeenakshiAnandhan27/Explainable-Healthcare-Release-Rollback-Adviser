export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CustomerImpactLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DeploymentStatus = "MONITORING" | "CONTINUED" | "ROLLED_BACK" | "PENDING_REVIEW";

export type UserRole = "SOC / Operations Analyst" | "Release Manager";

export interface UserSession {
  username: string;
  role: UserRole;
  name: string;
  token: string;
}

export interface TriggeredRule {
  rule_id: string;
  name: string;
  description: string;
  weight: number;
  metric: string;
  value: any;
  threshold: any;
}

export interface Rule {
  rule_id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: string | number;
  weight: number;
  enabled: boolean;
  category: "technical" | "business" | "general";
  description: string;
}

export interface Release {
  release_id: string;
  hospital_id: string;
  hospital_name: string;
  application_name: string;
  version: string;
  previous_version: string;
  deployment_time: string;
  deployment_status: DeploymentStatus;
  deployment_type: string;
  engineer: string;
  latency_ms: number | null;
  latency_baseline_ms: number | null;
  latency_change_percent: number | null;
  error_rate_percent: number | null;
  error_baseline_percent: number | null;
  error_change: number | null;
  service_availability_percent: number | null;
  availability_change: number | null;
  transaction_count: number | null;
  baseline_transaction_count: number | null;
  transaction_drop_percent: number | null;
  customer_impact_level: CustomerImpactLevel;
  affected_hospitals_count: number;
  affected_workflows_count: number;
  affected_workflows: string[];
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: string;
  triggered_rules?: TriggeredRule[];
  explanation?: {
    summary: string;
    narrative_points: string[];
    warnings: string[];
    evidence: {
      error_rate: { value: string; baseline: string; threshold: string };
      latency: { value: string; baseline: string; change: string };
      transactions: { value: string; baseline: string; drop: string };
      customer_impact: string;
      affected_workflows: string[];
    };
  };
  notes?: string;
  case_tag?: string;
  ground_truth_decision?: string;
  baseline_decision_time_min?: number;
  adviser_decision_time_min?: number;
}

export interface DecisionRecord {
  id: number;
  timestamp: string;
  release_id: string;
  hospital_name: string;
  application_name: string;
  recommendation: string;
  final_decision: "ROLLBACK" | "CONTINUE" | "SEND FOR REVIEW";
  is_override: boolean;
  override_reason: string;
  decision_maker: string;
  role: string;
  risk_score: number;
  triggered_rules_summary: string;
}

export interface DashboardStats {
  total_deployments: number;
  releases_evaluated: number;
  high_risk_releases: number;
  rollback_recommendations: number;
  continue_recommendations: number;
  human_review_cases: number;
  average_decision_time_min: number;
  baseline_average_decision_time_min: number;
  customer_impact_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  recent_alerts: Release[];
}

export interface Hospital {
  id: string;
  name: string;
  tier: string;
  deployments: number;
}

export interface ExperimentMetrics {
  baseline_avg_decision_time_min: number;
  baseline_median_decision_time_min: number;
  target_decision_time_min: number;
  measured_avg_decision_time_min: number;
  measured_median_decision_time_min: number;
  decision_time_reduction_percent: number;
  correct_decisions: number;
  incorrect_decisions: number;
  correct_rollback_count: number;
  correct_continue_count: number;
  false_rollback_count: number;
  missed_rollback_count: number;
  human_review_count: number;
  accuracy_percent: number;
}

export interface ErrorAnalysisItem {
  release_id: string;
  hospital_name: string;
  application_name: string;
  expected_decision: string;
  adviser_recommendation: string;
  risk_score: number;
  triggered_rules: string[];
  likely_reason: string;
  type: string;
}

export interface ExperimentData {
  title: string;
  disclaimer: string;
  sample_size: number;
  metrics: ExperimentMetrics;
  comparison_table: {
    columns: string[];
    rows: string[][];
  };
  error_analysis: ErrorAnalysisItem[];
  scenarios: Array<{
    release_id: string;
    hospital_name: string;
    application_name: string;
    ground_truth: string;
    recommendation: string;
    classification: string;
    baseline_time_min: number;
    adviser_time_min: number;
    time_saved_percent: number;
    risk_score: number;
  }>;
}

export interface StakeholderValidation {
  id: number;
  timestamp: string;
  stakeholder_name?: string;
  role: string;
  stakeholder_role?: string;
  ease_of_use: number;
  explanation_clarity: number;
  confidence: number;
  decision_usefulness: number;
  evidence_usefulness: number;
  overall_usability: number;
  comments: string;
  feedback?: string;
  suggested_improvement?: string;
  is_prototype?: boolean;
  usability_rating?: number;
  explanation_clarity_rating?: number;
  confidence_rating?: number;
}

export interface RuleAuditRecord {
  id: number;
  timestamp: string;
  rule_id: string;
  rule_name: string;
  user_name: string;
  user_role: string;
  old_threshold: string | number;
  new_threshold: string | number;
  old_weight: number;
  new_weight: number;
  old_enabled: boolean;
  new_enabled: boolean;
  change_reason?: string;
}

export interface HospitalAnalytics {
  hospital_id: string;
  hospital_name: string;
  tier: string;
  total_releases: number;
  high_risk_count: number;
  rollback_count: number;
  avg_risk_score: number;
  avg_latency_change_percent: number;
  avg_error_rate_percent: number;
  customer_impact_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}
