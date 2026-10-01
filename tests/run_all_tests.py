#!/usr/bin/env python3
"""
Master Test Runner - Phase 2 Executable Regression Test Suite
Executes all 14 mandatory regression and failure-mode tests:
  - TEST 1: High latency + normal errors + stable transactions
  - TEST 2: High error rate + low customer impact
  - TEST 3: Low technical risk + CRITICAL customer impact
  - TEST 4: Missing latency
  - TEST 5: Zero transactions
  - TEST 6: Conflicting technical signals
  - TEST 7: High-impact recommendation requires human confirmation
  - TEST 8: Override without reason must fail
  - TEST 9: Operations Analyst cannot modify risk rules
  - TEST 10: Release Manager can modify risk rules
  - TEST 11: Risk rule changes are audited
  - TEST 12: Invalid negative latency is rejected
  - TEST 13: Error rate > 100 is rejected
  - TEST 14: Duplicate release IDs are rejected
Plus reproducible experiment verification.
"""

import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tests.test_risk_engine import (
    test_1_high_latency_normal_errors_stable_transactions,
    test_2_high_error_rate_low_customer_impact,
    test_3_low_technical_risk_critical_customer_impact,
    test_15_risk_score_remains_within_valid_range,
    test_16_disabled_rules_do_not_contribute_to_score,
    test_17_configured_threshold_changes_actually_change_evaluation,
    test_18_explanation_matches_triggered_rules
)
from tests.test_failure_cases import (
    test_4_missing_latency,
    test_5_zero_transactions,
    test_6_conflicting_technical_signals
)
from tests.test_overrides import (
    test_7_high_impact_recommendation_requires_human_confirmation,
    test_8_override_without_reason_must_fail
)
from tests.test_permissions import (
    test_9_operations_analyst_cannot_modify_risk_rules,
    test_10_release_manager_can_modify_risk_rules,
    test_11_risk_rule_changes_are_audited
)
from tests.test_data_validation import (
    test_12_invalid_negative_latency_is_rejected,
    test_13_error_rate_greater_than_100_is_rejected,
    test_14_duplicate_release_ids_are_rejected
)
from tests.test_experiment import test_reproducible_experiment_and_metrics
from tests.test_end_to_end import test_20_end_to_end_user_journey_workflow


def run_all():
    print("\n" + "=" * 76)
    print("  EXPLAINABLE HEALTHCARE RELEASE ROLLBACK ADVISER - TEST SUITE")
    print("=" * 76 + "\n")

    tests = [
        ("TEST 01", "High latency + normal errors + stable transactions", test_1_high_latency_normal_errors_stable_transactions),
        ("TEST 02", "High error rate + low customer impact", test_2_high_error_rate_low_customer_impact),
        ("TEST 03", "Low technical risk + CRITICAL customer impact", test_3_low_technical_risk_critical_customer_impact),
        ("TEST 04", "Missing latency telemetry handling", test_4_missing_latency),
        ("TEST 05", "Zero transactions / traffic drop", test_5_zero_transactions),
        ("TEST 06", "Conflicting technical signals", test_6_conflicting_technical_signals),
        ("TEST 07", "High-impact recommendation requires human confirmation", test_7_high_impact_recommendation_requires_human_confirmation),
        ("TEST 08", "Override without mandatory reason must fail", test_8_override_without_reason_must_fail),
        ("TEST 09", "Operations Analyst cannot modify risk rules (403)", test_9_operations_analyst_cannot_modify_risk_rules),
        ("TEST 10", "Release Manager can modify risk rules (200)", test_10_release_manager_can_modify_risk_rules),
        ("TEST 11", "Risk rule changes are audited with before/after state", test_11_risk_rule_changes_are_audited),
        ("TEST 12", "Invalid negative latency is rejected by schema validator", test_12_invalid_negative_latency_is_rejected),
        ("TEST 13", "Error rate > 100% is rejected by schema validator", test_13_error_rate_greater_than_100_is_rejected),
        ("TEST 14", "Duplicate release IDs are rejected by registry validator", test_14_duplicate_release_ids_are_rejected),
        ("TEST 15", "Risk score strictly bounded within valid [0, 100] range", test_15_risk_score_remains_within_valid_range),
        ("TEST 16", "Disabled rules do not contribute to score or evidence", test_16_disabled_rules_do_not_contribute_to_score),
        ("TEST 17", "Configured threshold changes actually alter risk evaluation", test_17_configured_threshold_changes_actually_change_evaluation),
        ("TEST 18", "Explanation evidence precisely matches all triggered rules", test_18_explanation_matches_triggered_rules),
        ("TEST 19", "Reproducible experiment verification (Seed 42, 38.2m baseline)", test_reproducible_experiment_and_metrics),
        ("TEST 20", "End-to-end user workflow simulation from login to audit trail", test_20_end_to_end_user_journey_workflow),
    ]

    passed = 0
    failed = 0
    results = []

    start_time = time.time()

    for tag, desc, fn in tests:
        try:
            print(f"Running [{tag}] {desc}...")
            fn()
            passed += 1
            results.append((tag, desc, "PASSED", None))
        except Exception as e:
            failed += 1
            results.append((tag, desc, "FAILED", str(e)))
            print(f"FAILED [{tag}]: {e}")

    elapsed = round(time.time() - start_time, 2)

    print("\n" + "=" * 76)
    print("  TEST EXECUTION SUMMARY")
    print("=" * 76)
    for tag, desc, status, err in results:
        status_str = "✓ PASS" if status == "PASSED" else "✗ FAIL"
        print(f"  {status_str} | {tag:8s} | {desc}")
        if err:
            print(f"         Error: {err}")
    print("-" * 76)
    print(f"Total Tests: {len(tests)} | Passed: {passed} | Failed: {failed} | Time: {elapsed}s")
    print("=" * 76 + "\n")

    return failed == 0


if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)
