"""
FastAPI Backend Application for Explainable Healthcare Release Rollback Adviser.
Advisory-only risk assessment engine combining technical & clinical signals.
SYNTHETIC DATASET ONLY - NO REAL PATIENT DATA.
"""

from datetime import datetime
import json
import os
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .models import (
    RuleModel, RuleUpdate, ReleaseModel, DecisionCreate,
    StakeholderValidationCreate, LoginRequest, LoginResponse
)
from .database import (
    get_all_rules, update_rule, get_releases, get_release_by_id,
    insert_decision, get_decisions, insert_validation, get_validations
)
from .rules_engine import evaluate_release_risk

app = FastAPI(
    title="Explainable Healthcare Release Rollback Adviser API",
    description="Risk engine & explainability backend for healthcare software deployments. Prototype advisory system.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
EXP_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "experiments", "experiment_data.json")

DEMO_USERS = {
    "analyst": {
        "password": "analyst123",
        "role": "SOC / Operations Analyst",
        "name": "Sarah Connor (SOC Tier 2)"
    },
    "manager": {
        "password": "manager123",
        "role": "Release Manager",
        "name": "Dr. Marcus Brody (Lead Release Mgr)"
    }
}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "Explainable Healthcare Release Rollback Adviser",
        "advisory_notice": "Advisory system — no automatic production rollback.",
        "environment": "prototype_synthetic"
    }

@app.post("/api/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    user = DEMO_USERS.get(req.username.strip().lower())
    if not user or user["password"] != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use demo credentials: analyst/analyst123 or manager/manager123"
        )
    return LoginResponse(
        success=True,
        username=req.username.lower(),
        role=user["role"],
        name=user["name"],
        token=f"demo-token-{req.username}-{int(datetime.now().timestamp())}"
    )

@app.get("/api/hospitals")
def list_hospitals():
    return [
        {"id": "HOSP-CGH-01", "name": "City General Hospital"},
        {"id": "HOSP-SMMC-02", "name": "St. Mary's Medical Center"},
        {"id": "HOSP-LKH-03", "name": "Lakeside Hospital"},
        {"id": "HOSP-MCH-04", "name": "Metro Care Hospital"},
        {"id": "HOSP-GVH-05", "name": "Green Valley Hospital"},
    ]

@app.get("/api/dashboard/stats")
def get_dashboard_stats(hospital_id: Optional[str] = None):
    res = get_releases(hospital_id=hospital_id, limit=600)
    releases = res["items"]
    
    total = len(releases)
    evaluated = len([r for r in releases if r.get("risk_score") is not None])
    high_risk = len([r for r in releases if r.get("risk_level") in ["HIGH", "CRITICAL"]])
    rollbacks = len([r for r in releases if "ROLLBACK" in (r.get("recommendation") or "")])
    continues = len([r for r in releases if "CONTINUE" in (r.get("recommendation") or "")])
    human_reviews = len([r for r in releases if "HUMAN REVIEW" in (r.get("recommendation") or "")])
    
    times = [r.get("adviser_decision_time_min", 4.5) for r in releases if r.get("adviser_decision_time_min")]
    avg_decision_time = round(sum(times) / len(times), 1) if times else 4.2
    
    # Customer impact breakdown
    impact_dist = {
        "LOW": len([r for r in releases if r.get("customer_impact_level") == "LOW"]),
        "MEDIUM": len([r for r in releases if r.get("customer_impact_level") == "MEDIUM"]),
        "HIGH": len([r for r in releases if r.get("customer_impact_level") == "HIGH"]),
        "CRITICAL": len([r for r in releases if r.get("customer_impact_level") == "CRITICAL"])
    }

    return {
        "total_deployments": total,
        "releases_evaluated": evaluated,
        "high_risk_releases": high_risk,
        "rollback_recommendations": rollbacks,
        "continue_recommendations": continues,
        "human_review_cases": human_reviews,
        "average_decision_time_min": avg_decision_time,
        "baseline_average_decision_time_min": 48.5,
        "customer_impact_distribution": impact_dist,
        "recent_alerts": releases[:5]
    }

@app.get("/api/releases")
def list_releases(
    hospital_id: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=600),
    offset: int = Query(0, ge=0)
):
    return get_releases(hospital_id=hospital_id, risk_level=risk_level, search=search, limit=limit, offset=offset)

@app.get("/api/releases/{release_id}")
def get_release_detail(release_id: str):
    rel = get_release_by_id(release_id)
    if not rel:
        raise HTTPException(status_code=404, detail=f"Release {release_id} not found")
        
    rules = get_all_rules()
    score, risk_level, rec, triggered, explanation = evaluate_release_risk(rel, rules)
    
    rel["risk_score"] = score
    rel["risk_level"] = risk_level
    rel["recommendation"] = rec
    rel["triggered_rules"] = triggered
    rel["explanation"] = explanation
    
    return rel

@app.get("/api/rules")
def list_rules():
    return get_all_rules()

@app.put("/api/rules/{rule_id}")
def modify_rule(rule_id: str, payload: RuleUpdate):
    updates = payload.dict(exclude_unset=True)
    updated = update_rule(rule_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found or no changes provided")
    return updated

@app.post("/api/rules/evaluate")
def recalculate_release(payload: Dict[str, Any]):
    rules = get_all_rules()
    score, risk_level, rec, triggered, explanation = evaluate_release_risk(payload, rules)
    return {
        "risk_score": score,
        "risk_level": risk_level,
        "recommendation": rec,
        "triggered_rules": triggered,
        "explanation": explanation
    }

@app.post("/api/decisions")
def record_decision(payload: DecisionCreate):
    rel = get_release_by_id(payload.release_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Release not found")
        
    rules = get_all_rules()
    score, risk_level, rec, triggered, explanation = evaluate_release_risk(rel, rules)
    
    # Check if override:
    # If recommendation contains ROLLBACK and decision is CONTINUE, or vice versa
    is_rollback_rec = "ROLLBACK" in rec
    is_continue_rec = "CONTINUE" in rec
    is_review_rec = "HUMAN REVIEW" in rec
    
    user_decision = payload.final_decision.upper().strip()
    is_override = False
    
    if is_rollback_rec and user_decision in ["CONTINUE", "SEND FOR REVIEW"]:
        is_override = True
    elif is_continue_rec and user_decision in ["ROLLBACK", "SEND FOR REVIEW"]:
        is_override = True
    elif is_review_rec and user_decision in ["ROLLBACK", "CONTINUE"]:
        is_override = True
        
    if is_override and (not payload.override_reason or not payload.override_reason.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An override reason is mandatory when your decision differs from the adviser recommendation."
        )
        
    trig_summary = ", ".join([t["name"] for t in triggered]) if triggered else "None"
    
    decision_record = {
        "timestamp": datetime.now().isoformat(),
        "release_id": payload.release_id,
        "hospital_name": rel["hospital_name"],
        "application_name": rel["application_name"],
        "recommendation": rec,
        "final_decision": user_decision,
        "is_override": is_override,
        "override_reason": payload.override_reason.strip() if is_override else "",
        "decision_maker": payload.decision_maker,
        "role": payload.role,
        "risk_score": score,
        "triggered_rules_summary": trig_summary
    }
    
    saved = insert_decision(decision_record)
    return {
        "status": "success",
        "message": f"Decision for {payload.release_id} successfully recorded and audited.",
        "decision": saved
    }

@app.get("/api/decisions")
def list_decisions(
    hospital: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    decision: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200)
):
    return get_decisions(hospital=hospital, role=role, decision=decision, limit=limit)

@app.get("/api/experiments")
def get_experiments():
    if os.path.exists(EXP_FILE):
        with open(EXP_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Experiment data not generated yet"}

@app.post("/api/validations")
def submit_validation(feedback: StakeholderValidationCreate):
    data = {
        "timestamp": datetime.now().isoformat(),
        "stakeholder_name": feedback.stakeholder_name,
        "stakeholder_role": feedback.stakeholder_role,
        "usability_rating": feedback.usability_rating,
        "explanation_clarity_rating": feedback.explanation_clarity_rating,
        "confidence_rating": feedback.confidence_rating,
        "feedback": feedback.feedback,
        "suggested_improvement": feedback.suggested_improvement
    }
    saved = insert_validation(data)
    return {
        "status": "success",
        "message": "Stakeholder feedback recorded for prototype evaluation.",
        "data": saved
    }

@app.get("/api/validations")
def list_validations():
    return get_validations()
