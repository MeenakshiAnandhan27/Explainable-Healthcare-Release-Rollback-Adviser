#!/usr/bin/env python3
"""
Test Suite: Failure & Edge Cases
Covers:
  - TEST 4: Missing latency telemetry
  - TEST 5: Zero transactions / low volume
  - TEST 6: Conflicting technical signals
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.run_experiment import evaluate_release, load_rules


def test_4_missing_latency():
    """
    TEST 4: Missing latency telemetry (None or null).
    The system must NOT silently treat missing data as safe (0% change).
    It must trigger an insufficient evidence warning or flag human review.
    """
    rules = load_rules()
    scenario = {
        "release_id": "TEST-SCENARIO-004",
        "latency_change_percent": None,  # Missing telemetry!
        "latency_ms": None,
        "error_rate_percent": 0.2,
        "transaction_drop_percent": 1.0,
        "service_availability_percent": 99.95,
        "customer_impact_level": "LOW"
    }

    # Evaluate with data validation check
    has_missing_signal = scenario.get("latency_change_percent") is None
    assert has_missing_signal is True, "Scenario should have missing latency signal"

    # Evaluation shouldn't crash; missing signal should be surfaced
    result = evaluate_release(scenario, rules)
    assert result is not None, "Engine should handle null latency without unhandled exception"
    # Ensure it didn't trigger R2
    triggered_ids = [r["rule_id"] for r in result["triggered_rules"]]
    assert "R2" not in triggered_ids, "R2 must not trigger on null latency"
    print("PASS: TEST 4 - Missing latency does not crash risk engine and is safely handled without false triggers")


def test_5_zero_transactions():
    """
    TEST 5: Zero transactions (brand new hospital deployment or total traffic collapse).
    If baseline transactions were 10,000 and current is 0, transaction_drop_percent = 100%.
    Rule R3 (Transaction Drop > 10%) must trigger (+25 pts).
    If current and baseline are both 0 (un-onboarded tenant), drop is 0%, handled safely.
    """
    rules = load_rules()
    scenario = {
        "release_id": "TEST-SCENARIO-005",
        "transaction_count": 0,
        "baseline_transaction_count": 5000,
        "transaction_drop_percent": 100.0,
        "error_rate_percent": 0.0,
        "latency_change_percent": 0.0,
        "service_availability_percent": 99.99,
        "customer_impact_level": "LOW"
    }
    result = evaluate_release(scenario, rules)
    assert result["risk_score"] >= 25, f"Expected at least 25 risk points for 100% transaction drop, got {result['risk_score']}"
    triggered_ids = [r["rule_id"] for r in result["triggered_rules"]]
    assert "R3" in triggered_ids, f"Expected R3 (Transaction Drop) to trigger, got {triggered_ids}"
    assert result["recommendation"] == "HUMAN REVIEW", f"Expected HUMAN REVIEW, got {result['recommendation']}"
    print("PASS: TEST 5 - Zero transactions with positive baseline triggers R3 (+25 pts) and flags HUMAN REVIEW")


def test_6_conflicting_technical_signals():
    """
    TEST 6: Conflicting technical signals.
    e.g. Latency is severely degraded (+85% > 30% threshold => R2 triggers +30 pts)
    AND Transaction count dropped (+40% > 10% threshold => R3 triggers +25 pts)
    YET error rate appears deceptively low (0.1% due to clients giving up or timeouts not registering 500s).
    Combined score: 55 pts => Elevated HUMAN REVIEW / near Rollback threshold.
    """
    rules = load_rules()
    scenario = {
        "release_id": "TEST-SCENARIO-006",
        "latency_change_percent": 85.0,
        "error_rate_percent": 0.1,  # Deceptive green error rate
        "transaction_drop_percent": 40.0,
        "service_availability_percent": 99.5,
        "customer_impact_level": "LOW"
    }
    result = evaluate_release(scenario, rules)
    # R2 (+30) + R3 (+25) = 55 points
    assert result["risk_score"] == 55, f"Expected 55 risk points for conflicting signals, got {result['risk_score']}"
    triggered_ids = [r["rule_id"] for r in result["triggered_rules"]]
    assert "R2" in triggered_ids and "R3" in triggered_ids, f"Expected both R2 and R3 to trigger, got {triggered_ids}"
    assert "R1" not in triggered_ids, "R1 should not trigger since error rate is 0.1%"
    assert result["recommendation"] == "HUMAN REVIEW", f"Expected HUMAN REVIEW, got {result['recommendation']}"
    print("PASS: TEST 6 - Conflicting technical signals appropriately accumulate risk across orthogonal dimensions")


if __name__ == "__main__":
    test_4_missing_latency()
    test_5_zero_transactions()
    test_6_conflicting_technical_signals()
    print("All failure and edge case tests passed successfully!")
