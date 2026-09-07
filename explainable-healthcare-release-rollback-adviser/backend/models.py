"""
Data models and schemas for Explainable Healthcare Release Rollback Adviser.
SYNTHETIC / SIMULATION ONLY - NO REAL PATIENT DATA.
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class RuleModel(BaseModel):
    rule_id: str
    name: str
    metric: str
    operator: str
    threshold: Any
    weight: int
    enabled: bool = True
    category: str = "technical"
    description: str

class RuleUpdate(BaseModel):
    threshold: Optional[Any] = None
    weight: Optional[int] = None
    enabled: Optional[bool] = None
    description: Optional[str] = None

class TriggeredRule(BaseModel):
    rule_id: str
    name: str
    description: str
    weight: int
    metric: str
    value: Any
    threshold: Any

class ReleaseModel(BaseModel):
    release_id: str
    hospital_id: str
    hospital_name: str
    application_name: str
    version: str
    previous_version: str
    deployment_time: str
    deployment_status: str
    deployment_type: str
    engineer: str
    latency_ms: Optional[float] = None
    latency_baseline_ms: Optional[float] = None
    latency_change_percent: Optional[float] = None
    error_rate_percent: Optional[float] = None
    error_baseline_percent: Optional[float] = None
    error_change: Optional[float] = None
    service_availability_percent: Optional[float] = None
    availability_change: Optional[float] = None
    transaction_count: Optional[int] = None
    baseline_transaction_count: Optional[int] = None
    transaction_drop_percent: Optional[float] = None
    customer_impact_level: str
    affected_hospitals_count: int = 1
    affected_workflows_count: int = 0
    affected_workflows: List[str] = []
    risk_score: int
    risk_level: str
    recommendation: str
    triggered_rules: List[TriggeredRule] = []
    notes: Optional[str] = ""
    case_tag: Optional[str] = ""
    ground_truth_decision: Optional[str] = None
    baseline_decision_time_min: Optional[float] = None
    adviser_decision_time_min: Optional[float] = None

class DecisionCreate(BaseModel):
    release_id: str
    final_decision: str  # ROLLBACK, CONTINUE, HUMAN REVIEW
    override_reason: Optional[str] = ""
    decision_maker: str
    role: str

class DecisionRecord(BaseModel):
    id: int
    timestamp: str
    release_id: str
    hospital_name: str
    application_name: str
    recommendation: str
    final_decision: str
    is_override: bool
    override_reason: str
    decision_maker: str
    role: str
    risk_score: int
    triggered_rules_summary: str

class StakeholderValidationCreate(BaseModel):
    stakeholder_name: str
    stakeholder_role: str
    usability_rating: int = Field(ge=1, le=5)
    explanation_clarity_rating: int = Field(ge=1, le=5)
    confidence_rating: int = Field(ge=1, le=5)
    feedback: str
    suggested_improvement: Optional[str] = ""

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    username: str
    role: str
    token: str
    name: str
