#!/usr/bin/env python3
"""
Test Suite: Human Confirmation & Override Governance
Covers:
  - TEST 7: High-impact recommendation requires human confirmation (no auto-rollback)
  - TEST 8: Override without reason must fail (mandatory justification validation)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.run_experiment import evaluate_release, load_rules


def validate_decision_submission(payload: dict) -> tuple[bool, str]:
    """
    Simulates server-side decision validation logic.
    """
    final_decision = payload.get("final_decision")
    recommendation = payload.get("recommendation", "")
    override_reason = (payload.get("override_reason") or "").strip()
    decision_maker = payload.get("decision_maker")

    if not decision_maker:
        return False, "Missing decision_maker identity"

    if final_decision not in ["ROLLBACK", "CONTINUE", "SEND FOR REVIEW"]:
        return False, f"Invalid final decision: {final_decision}"

    # Check if this constitutes an override
    rec_norm = "ROLLBACK" if "ROLLBACK" in recommendation else recommendation
    dec_norm = "ROLLBACK" if final_decision == "ROLLBACK" else ("CONTINUE" if final_decision == "CONTINUE" else "HUMAN REVIEW")

    is_override = rec_norm != dec_norm

    # TEST 8 check: If it's an override, mandatory justification is strictly enforced
    if is_override and len(override_reason) < 10:
        return False, "Override requires a documented clinical/operational reason (min 10 characters)"

    return True, "Valid decision"


def test_7_high_impact_recommendation_requires_human_confirmation():
    """
    TEST 7: High-impact recommendation (ROLLBACK RECOMMENDED) requires human confirmation.
    System must NEVER automatically trigger rollback or set final_decision = ROLLBACK
    without explicit human operator action.
    """
    rules = load_rules()
    critical_release = {
        "release_id": "TEST-CRITICAL-001",
        "error_rate_percent": 12.0,  # triggers R1 (+40)
        "latency_change_percent": 80.0, # triggers R2 (+30)
        "customer_impact_level": "CRITICAL", # triggers R5 (+45)
        "service_availability_percent": 95.0 # triggers R4 (+35)
    }
    result = evaluate_release(critical_release, rules)
    assert result["risk_score"] >= 60, f"Expected critical risk score >= 60, got {result['risk_score']}"
    assert "ROLLBACK" in result["recommendation"], f"Expected ROLLBACK recommendation, got {result['recommendation']}"

    # Verify advisory boundary: The engine outputs a RECOMMENDATION, not a production action
    assert "production_action_executed" not in result or result["production_action_executed"] is False
    assert result.get("status") != "AUTO_ROLLED_BACK", "Engine must not perform automatic production execution"
    print("PASS: TEST 7 - High-impact release produces advisory recommendation requiring human confirmation")


def test_8_override_without_reason_must_fail():
    """
    TEST 8: Override without reason must fail.
    When adviser recommends ROLLBACK, but an operator selects CONTINUE without providing
    a valid justification, the submission must be rejected.
    """
    # Attempting override without reason
    payload_invalid = {
        "release_id": "REL-CASE-003",
        "recommendation": "ROLLBACK RECOMMENDED (HIGH IMPACT CONFIRMATION REQUIRED)",
        "final_decision": "CONTINUE",
        "override_reason": "",  # Empty!
        "decision_maker": "Marcus Vance, SOC Tier 2",
        "role": "SOC / Operations Analyst"
    }

    valid, err_msg = validate_decision_submission(payload_invalid)
    assert valid is False, "Override with empty reason must be rejected"
    assert "Override requires a documented clinical/operational reason" in err_msg
    print("PASS: TEST 8a - Empty override reason rejected as expected")

    # Attempting override with trivial/blank space reason
    payload_trivial = {
        "release_id": "REL-CASE-003",
        "recommendation": "ROLLBACK RECOMMENDED",
        "final_decision": "CONTINUE",
        "override_reason": "   ok   ",  # < 10 characters
        "decision_maker": "Marcus Vance, SOC Tier 2",
        "role": "SOC / Operations Analyst"
    }
    valid, err_msg = validate_decision_submission(payload_trivial)
    assert valid is False, "Trivial override reason must be rejected"
    print("PASS: TEST 8b - Trivial short override reason rejected as expected")

    # Legitimate override with clinical justification
    payload_valid = {
        "release_id": "REL-CASE-003",
        "recommendation": "ROLLBACK RECOMMENDED",
        "final_decision": "CONTINUE",
        "override_reason": "Downstream third-party insurer gateway was down for scheduled maintenance; hospital core services unaffected.",
        "decision_maker": "Elena Rostova, Release Manager",
        "role": "Release Manager"
    }
    valid, err_msg = validate_decision_submission(payload_valid)
    assert valid is True, f"Valid override should succeed, got error: {err_msg}"
    print("PASS: TEST 8c - Documented clinical/operational override accepted with audit trace")


if __name__ == "__main__":
    test_7_high_impact_recommendation_requires_human_confirmation()
    test_8_override_without_reason_must_fail()
    print("All human confirmation & override tests passed successfully!")
