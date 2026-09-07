import {
  DashboardStats,
  DecisionRecord,
  ExperimentData,
  Hospital,
  Release,
  Rule,
  StakeholderValidation,
  UserSession
} from "../types";

const BASE_URL = "/api";

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function loginUser(username: string, password: string): Promise<UserSession> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || err.detail || "Authentication failed");
  }
  return res.json();
}

export async function fetchHospitals(): Promise<Hospital[]> {
  const res = await fetch(`${BASE_URL}/hospitals`);
  if (!res.ok) throw new Error("Failed to load hospitals");
  return res.json();
}

export async function fetchDashboardStats(hospitalId?: string): Promise<DashboardStats> {
  const url = hospitalId && hospitalId !== "ALL" 
    ? `${BASE_URL}/dashboard/stats?hospital_id=${encodeURIComponent(hospitalId)}`
    : `${BASE_URL}/dashboard/stats`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load dashboard stats");
  return res.json();
}

export async function fetchReleases(params: {
  hospital_id?: string;
  risk_level?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; items: Release[] }> {
  const query = new URLSearchParams();
  if (params.hospital_id && params.hospital_id !== "ALL") query.append("hospital_id", params.hospital_id);
  if (params.risk_level && params.risk_level !== "ALL") query.append("risk_level", params.risk_level);
  if (params.search) query.append("search", params.search);
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.offset) query.append("offset", params.offset.toString());

  const res = await fetch(`${BASE_URL}/releases?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load releases");
  return res.json();
}

export async function fetchReleaseDetail(releaseId: string): Promise<Release> {
  const res = await fetch(`${BASE_URL}/releases/${encodeURIComponent(releaseId)}`);
  if (!res.ok) throw new Error(`Failed to load release ${releaseId}`);
  return res.json();
}

export async function fetchRules(): Promise<Rule[]> {
  const res = await fetch(`${BASE_URL}/rules`);
  if (!res.ok) throw new Error("Failed to load risk rules");
  return res.json();
}

export async function updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule> {
  const res = await fetch(`${BASE_URL}/rules/${encodeURIComponent(ruleId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || err.detail || "Failed to update rule");
  }
  return res.json();
}

export async function submitDecision(payload: {
  release_id: string;
  final_decision: "ROLLBACK" | "CONTINUE" | "SEND FOR REVIEW";
  override_reason?: string;
  decision_maker: string;
  role: string;
}): Promise<{ status: string; message: string; decision: DecisionRecord }> {
  const res = await fetch(`${BASE_URL}/decisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || err.detail || "Failed to record decision");
  }
  return res.json();
}

export async function fetchDecisions(filters?: {
  hospital?: string;
  role?: string;
  decision?: string;
  limit?: number;
}): Promise<DecisionRecord[]> {
  const query = new URLSearchParams();
  if (filters?.hospital && filters.hospital !== "ALL") query.append("hospital", filters.hospital);
  if (filters?.role && filters.role !== "ALL") query.append("role", filters.role);
  if (filters?.decision && filters.decision !== "ALL") query.append("decision", filters.decision);
  if (filters?.limit) query.append("limit", filters.limit.toString());

  const res = await fetch(`${BASE_URL}/decisions?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load decision history");
  return res.json();
}

export async function fetchExperiments(): Promise<ExperimentData> {
  const res = await fetch(`${BASE_URL}/experiments`);
  if (!res.ok) throw new Error("Failed to load experiment benchmark data");
  return res.json();
}

export async function fetchValidations(): Promise<StakeholderValidation[]> {
  const res = await fetch(`${BASE_URL}/validations`);
  if (!res.ok) throw new Error("Failed to load stakeholder validations");
  return res.json();
}

export async function submitValidation(feedback: {
  stakeholder_name: string;
  stakeholder_role: string;
  usability_rating: number;
  explanation_clarity_rating: number;
  confidence_rating: number;
  feedback: string;
  suggested_improvement?: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/validations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedback)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || err.detail || "Failed to submit validation");
  }
  return res.json();
}
