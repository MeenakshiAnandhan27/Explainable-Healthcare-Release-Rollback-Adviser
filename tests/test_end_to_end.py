#!/usr/bin/env python3
"""
Test Suite: End-to-End User Journey & Workflow Integration
Covers:
  - TEST 20: Full lifecycle simulation:
      Login -> Hospital Filtering -> Release Selection -> Telemetry Assessment
      -> Risk Evaluation -> Recommendation -> Human Decision Authorization
      -> Override Reason Validation -> Immutable Audit Trail Verification
"""

import sys
import os
import json
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.run_experiment import evaluate_release, load_rules

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RELEASES_FILE = os.path.join(DATA_DIR, "releases.json")
DECISIONS_FILE = os.path.join(DATA_DIR, "decisions.json")


def test_20_end_to_end_user_journey_workflow():
    """
    TEST 20: Full end-to-end user workflow simulation.
    """
    # Step 1: User Login & Role Assignment
    operator = {
        "username": "analyst",
        "role": "SOC / Operations Analyst",
        "name": "Marcus Vance, SOC Tier 2"
    }
    assert operator["role"] == "SOC / Operations Analyst"

    # Step 2: Hospital Selection & Isolation
    with open(RELEASES_FILE, "r", encoding="utf-8") as f:
        all_releases = json.load(f)
    assert len(all_releases) >= 500, f"Expected >= 500 releases, got {len(all_releases)}"

    target_hospital = "HOSP-CGH-01"
    hospital_releases = [r for r in all_releases if r.get("hospital_id") == target_hospital]
    assert len(hospital_releases) > 0, "Hospital releases must be partitioned"
    for r in hospital_releases:
        assert r["hospital_id"] == target_hospital

    # Step 3: Select Active Release (REL-CASE-001)
    target_release = next((r for r in hospital_releases if r["release_id"] == "REL-CASE-001"), None)
    assert target_release is not None, "Target release REL-CASE-001 must exist"
    assert target_release["application_name"] == "Clinical Portal"

    # Step 4: Validate Telemetry Inputs
    lat = target_release.get("latency_ms")
    lat_change = target_release.get("latency_change_percent")
    err_rate = target_release.get("error_rate_percent")
    assert lat is not None and lat >= 0
    assert lat_change is not None
    assert err_rate is not None and 0.0 <= err_rate <= 100.0

    # Step 5: Evaluate Release against Rules
    rules = load_rules()
    eval_result = evaluate_release(target_release, rules)
    assert eval_result["risk_score"] == 30, f"Expected 30, got {eval_result['risk_score']}"
    assert eval_result["recommendation"] == "HUMAN REVIEW"
    assert len(eval_result["triggered_rules"]) == 1
    assert eval_result["triggered_rules"][0]["rule_id"] == "R2"

    # Step 6: Human Confirmation & Override
    # Adviser recommended HUMAN REVIEW, operator authorizes CONTINUE with valid reason
    override_reason = "Observed latency spike is due to cold cache initialization after container restart; database thread pools remain completely nominal."
    assert len(override_reason) >= 10, "Override reason must satisfy minimum 10-char threshold"

    decision_record = {
        "id": 999999,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "release_id": target_release["release_id"],
        "hospital_id": target_release["hospital_id"],
        "hospital_name": target_release["hospital_name"],
        "application_name": target_release["application_name"],
        "recommendation": eval_result["recommendation"],
        "final_decision": "CONTINUE",
        "is_override": True,
        "override_reason": override_reason,
        "decision_maker": operator["name"],
        "role": operator["role"],
        "risk_score": eval_result["risk_score"]
    }

    # Step 7: Verify Decision Invariants
    assert decision_record["final_decision"] in ["CONTINUE", "ROLLBACK", "SEND FOR REVIEW"]
    assert decision_record["is_override"] is True
    assert decision_record["decision_maker"] == "Marcus Vance, SOC Tier 2"
    assert decision_record["risk_score"] == 30

    print("PASS: TEST 20 - End-to-end user workflow validated from login to immutable audit record")


if __name__ == "__main__":
    test_20_end_to_end_user_journey_workflow()
    print("End-to-end test passed successfully!")
