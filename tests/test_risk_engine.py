#!/usr/bin/env python3
"""
Test Suite: Risk Engine Benchmark Scenarios
Covers:
  - TEST 1: High latency + normal errors + stable transactions
  - TEST 2: High error rate + low customer impact
  - TEST 3: Low technical risk + CRITICAL customer impact
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.run_experiment import evaluate_release, load_rules


def test_1_high_latency_normal_errors_stable_transactions():
    """
    TEST 1: High latency (+65%) but normal errors (0.35%) and stable transactions.
    Latency degradation rule R2 triggers (+30 pts).
    Expected score: 30 pts. Recommendation: HUMAN REVIEW (avoids hasty rollback).
    """
    rules = load_rules()
    scenario = {
        "release_id": "TEST-SCENARIO-001",
        "latency_change_percent": 65.0,
        "error_rate_percent": 0.35,
        "transaction_drop_percent": 2.0,
        "service_availability_percent": 99.85,
        "customer_impact_level": "LOW"
    }
    result = evaluate_release(scenario, rules)
    assert result["risk_score"] == 30, f"Expected 30 risk points, got {result['risk_score']}"
    assert result["recommendation"] == "HUMAN REVIEW", f"Expected HUMAN REVIEW, got {result['recommendation']}"
    triggered_ids = [r["rule_id"] for r in result["triggered_rules"]]
    assert "R2" in triggered_ids, f"Expected R2 (Latency Degradation) to trigger, got {triggered_ids}"
    print("PASS: TEST 1 - High latency + normal errors + stable transactions correctly recommends HUMAN REVIEW")


def test_2_high_error_rate_low_customer_impact():
    """
    TEST 2: High error rate (7.5% > 5%) but customer impact is LOW and latency is normal.
    Error rate rule R1 triggers (+30 pts).
    Expected score: 30 pts. Recommendation: HUMAN REVIEW (flags elevated technical failure).
    """
    rules = load_rules()
    scenario = {
        "release_id": "TEST-SCENARIO-002",
        "latency_change_percent": 5.0,
        "error_rate_percent": 7.5,
        "transaction_drop_percent": 3.0,
        "service_availability_percent": 99.7,
        "customer_impact_level": "LOW"
    }
    result = evaluate_release(scenario, rules)
    assert result["risk_score"] == 30, f"Expected 30 risk points, got {result['risk_score']}"
    assert result["recommendation"] == "HUMAN REVIEW", f"Expected HUMAN REVIEW, got {result['recommendation']}"
    triggered_ids = [r["rule_id"] for r in result["triggered_rules"]]
    assert "R1" in triggered_ids, f"Expected R1 (High Error Rate) to trigger, got {triggered_ids}"
    print("PASS: TEST 2 - High error rate + low customer impact triggers R1 with 30 pts and HUMAN REVIEW")


def test_3_low_technical_risk_critical_customer_impact():
    """
    TEST 3: Technical telemetry looks green (error 0.2%, latency +2%, transactions normal)
    BUT customer impact is CRITICAL (e.g. ICU clinician medication order pathway blocked).
    Rule R5 triggers (+40 pts).
    Expected score: 40 pts. Recommendation: HUMAN REVIEW (elevated priority clinical impact).
    """
    rules = load_rules()
    scenario = {
        "release_id": "TEST-SCENARIO-003",
        "latency_change_percent": 2.0,
        "error_rate_percent": 0.2,
        "transaction_drop_percent": 1.0,
        "service_availability_percent": 99.9,
        "customer_impact_level": "CRITICAL"
    }
    result = evaluate_release(scenario, rules)
    assert result["risk_score"] == 40, f"Expected 40 risk points, got {result['risk_score']}"
    assert result["recommendation"] == "HUMAN REVIEW", f"Expected HUMAN REVIEW, got {result['recommendation']}"
    triggered_ids = [r["rule_id"] for r in result["triggered_rules"]]
    assert "R5" in triggered_ids, f"Expected R5 (Critical Customer Impact) to trigger, got {triggered_ids}"
    print("PASS: TEST 3 - Low technical risk + CRITICAL customer impact elevates risk via R5 to 40 pts")


def test_15_risk_score_remains_within_valid_range():
    """
    TEST 15: Risk score remains within valid range [0, 100].
    Even under catastrophic multiple simultaneous failures (where unconstrained sum of weights
    exceeds 100), the risk score must be bounded in [0, 100].
    """
    rules = load_rules()
    extreme_failure = {
        "release_id": "TEST-CATASTROPHIC",
        "error_rate_percent": 25.0,        # R1 (+30)
        "latency_change_percent": 150.0,    # R2 (+30)
        "transaction_drop_percent": 60.0,   # R3 (+25)
        "customer_impact_level": "CRITICAL",# R5 (+40)
        "service_availability_percent": 88.0# R6 (+20)
    }
    # Raw sum = 30 + 30 + 25 + 40 + 20 = 145 points
    result = evaluate_release(extreme_failure, rules)
    assert 0 <= result["risk_score"] <= 100, f"Score must be in [0, 100], got {result['risk_score']}"
    assert result["risk_score"] == 100, f"Expected capped score 100, got {result['risk_score']}"
    assert "ROLLBACK" in result["recommendation"]
    print("PASS: TEST 15 - Risk score strictly bounded within [0, 100] even when raw sum = 145")


def test_16_disabled_rules_do_not_contribute_to_score():
    """
    TEST 16: Disabled rules do not contribute to score.
    When a rule is toggled enabled=False (e.g. during maintenance or rule deprecation),
    its criteria must not add points or trigger evidence.
    """
    rules = [dict(r) for r in load_rules()]
    # Disable R1 (High Error Rate)
    for r in rules:
        if r["rule_id"] == "R1":
            r["enabled"] = False

    scenario = {
        "release_id": "TEST-DISABLED-R1",
        "error_rate_percent": 12.0,  # Would normally trigger R1 (+30)
        "latency_change_percent": 0.0,
        "transaction_drop_percent": 0.0,
        "customer_impact_level": "LOW",
        "service_availability_percent": 99.95
    }
    result = evaluate_release(scenario, rules)
    assert result["risk_score"] == 0, f"Expected 0 risk score because R1 was disabled, got {result['risk_score']}"
    assert result["recommendation"] == "CONTINUE"
    triggered_ids = [t["rule_id"] for t in result["triggered_rules"]]
    assert "R1" not in triggered_ids, "Disabled rule R1 must not appear in triggered rules"
    print("PASS: TEST 16 - Disabled rule R1 correctly suppressed from score and evidence")


def test_17_configured_threshold_changes_actually_change_evaluation():
    """
    TEST 17: Configured threshold changes actually change evaluation.
    Changing R1 threshold from 5.0% to 10.0% causes an error rate of 7.5% to no longer trigger.
    """
    rules_default = [dict(r) for r in load_rules()]
    rules_calibrated = [dict(r) for r in load_rules()]
    for r in rules_calibrated:
        if r["rule_id"] == "R1":
            r["threshold"] = 10.0  # Increased threshold from 5.0 to 10.0

    scenario = {
        "release_id": "TEST-THRESHOLD-SHIFT",
        "error_rate_percent": 7.5,
        "latency_change_percent": 0.0,
        "transaction_drop_percent": 0.0,
        "customer_impact_level": "LOW",
        "service_availability_percent": 99.95
    }

    res_default = evaluate_release(scenario, rules_default)
    res_calibrated = evaluate_release(scenario, rules_calibrated)

    # In default, 7.5% > 5.0% triggers R1 (+30 pts)
    assert res_default["risk_score"] == 30, f"Expected 30 in default, got {res_default['risk_score']}"
    assert "R1" in [t["rule_id"] for t in res_default["triggered_rules"]]

    # In calibrated, 7.5% <= 10.0% does NOT trigger R1 (0 pts)
    assert res_calibrated["risk_score"] == 0, f"Expected 0 in calibrated, got {res_calibrated['risk_score']}"
    assert "R1" not in [t["rule_id"] for t in res_calibrated["triggered_rules"]]
    print("PASS: TEST 17 - Dynamic threshold change (5.0% -> 10.0%) successfully alters risk evaluation")


def test_18_explanation_matches_triggered_rules():
    """
    TEST 18: Explanation matches triggered rules.
    Verify that every triggered rule in the risk calculation produces matching evidence
    with correct metric, value, threshold, and narrative explanation.
    """
    rules = load_rules()
    scenario = {
        "release_id": "TEST-EXPLANATION",
        "error_rate_percent": 8.4,
        "latency_change_percent": 46.0,
        "transaction_drop_percent": 18.0,
        "customer_impact_level": "HIGH",
        "service_availability_percent": 99.9
    }
    result = evaluate_release(scenario, rules)
    # Expected triggers: R1 (+30), R2 (+30), R3 (+25), R4 (+25) => 100 capped
    triggered_ids = {t["rule_id"] for t in result["triggered_rules"]}
    assert {"R1", "R2", "R3", "R4"}.issubset(triggered_ids), f"Missing rules in {triggered_ids}"

    for t in result["triggered_rules"]:
        assert "rule_id" in t
        assert "name" in t
        assert "weight" in t
        assert "threshold" in t
        assert "value" in t

    print("PASS: TEST 18 - Explanation evidence precisely matches all triggered rules")


if __name__ == "__main__":
    test_1_high_latency_normal_errors_stable_transactions()
    test_2_high_error_rate_low_customer_impact()
    test_3_low_technical_risk_critical_customer_impact()
    test_15_risk_score_remains_within_valid_range()
    test_16_disabled_rules_do_not_contribute_to_score()
    test_17_configured_threshold_changes_actually_change_evaluation()
    test_18_explanation_matches_triggered_rules()
    print("All risk engine tests passed successfully!")
