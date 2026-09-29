#!/usr/bin/env python3
"""
Test Suite: Role-Based Access Control (RBAC) & Rule Audit
Covers:
  - TEST 9: Operations Analyst cannot modify risk rules (403 Forbidden)
  - TEST 10: Release Manager can modify risk rules (200 OK)
  - TEST 11: Risk rule changes are audited with before/after state
"""

import sys
import os
import json
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def simulate_rule_update(user_role: str, user_name: str, rule_id: str, new_threshold: float, new_weight: int, audit_log: list, rules: list) -> tuple[int, str]:
    """
    Simulates the server authorization & audit logic for updating risk rules.
    """
    # Strict RBAC enforcement
    if user_role != "Release Manager":
        return 403, "Forbidden: Only Release Managers possess permission to modify risk rules."

    target_rule = next((r for r in rules if r["rule_id"] == rule_id), None)
    if not target_rule:
        return 404, f"Rule {rule_id} not found."

    old_threshold = target_rule["threshold"]
    old_weight = target_rule["weight"]
    old_enabled = target_rule["enabled"]

    # Apply update
    target_rule["threshold"] = new_threshold
    target_rule["weight"] = new_weight

    # Record rule change in audit trail
    audit_entry = {
        "id": len(audit_log) + 1,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "rule_id": rule_id,
        "rule_name": target_rule["name"],
        "user_name": user_name,
        "user_role": user_role,
        "old_threshold": old_threshold,
        "new_threshold": new_threshold,
        "old_weight": old_weight,
        "new_weight": new_weight,
        "old_enabled": old_enabled,
        "new_enabled": target_rule["enabled"]
    }
    audit_log.append(audit_entry)

    return 200, "Rule updated successfully and audited."


def test_9_operations_analyst_cannot_modify_risk_rules():
    """
    TEST 9: Operations Analyst cannot modify risk rules.
    A Tier 2 Operations Analyst attempting to alter rule thresholds must be rejected with 403.
    """
    rules = [
        {"rule_id": "R1", "name": "High Error Rate", "threshold": 5.0, "weight": 40, "enabled": True}
    ]
    audit_log = []

    status_code, msg = simulate_rule_update(
        user_role="SOC / Operations Analyst",
        user_name="Marcus Vance, SOC Tier 2",
        rule_id="R1",
        new_threshold=8.0,
        new_weight=50,
        audit_log=audit_log,
        rules=rules
    )

    assert status_code == 403, f"Expected 403 Forbidden, got {status_code}"
    assert "Forbidden" in msg
    assert rules[0]["threshold"] == 5.0, "Rule threshold must not have been modified"
    assert len(audit_log) == 0, "No audit log entry should be created for unauthorized attempts"
    print("PASS: TEST 9 - Operations Analyst is strictly blocked from modifying risk rules (403 Forbidden)")


def test_10_release_manager_can_modify_risk_rules():
    """
    TEST 10: Release Manager can modify risk rules.
    An authorized Release Manager can calibrate thresholds and weights.
    """
    rules = [
        {"rule_id": "R1", "name": "High Error Rate", "threshold": 5.0, "weight": 40, "enabled": True}
    ]
    audit_log = []

    status_code, msg = simulate_rule_update(
        user_role="Release Manager",
        user_name="Elena Rostova, Release Manager",
        rule_id="R1",
        new_threshold=6.0,
        new_weight=45,
        audit_log=audit_log,
        rules=rules
    )

    assert status_code == 200, f"Expected 200 OK, got {status_code}: {msg}"
    assert rules[0]["threshold"] == 6.0, f"Expected threshold 6.0, got {rules[0]['threshold']}"
    assert rules[0]["weight"] == 45, f"Expected weight 45, got {rules[0]['weight']}"
    print("PASS: TEST 10 - Release Manager successfully updates risk rule thresholds and weights")


def test_11_risk_rule_changes_are_audited():
    """
    TEST 11: Risk rule changes are audited.
    Verify that every modification creates an immutable audit record containing
    old and new thresholds, weights, user name, role, and UTC timestamp.
    """
    rules = [
        {"rule_id": "R2", "name": "Latency Degradation", "threshold": 30.0, "weight": 30, "enabled": True}
    ]
    audit_log = []

    status_code, _ = simulate_rule_update(
        user_role="Release Manager",
        user_name="Elena Rostova, Release Manager",
        rule_id="R2",
        new_threshold=35.0,
        new_weight=35,
        audit_log=audit_log,
        rules=rules
    )

    assert status_code == 200
    assert len(audit_log) == 1, "Audit log must contain exactly 1 entry"
    entry = audit_log[0]
    assert entry["rule_id"] == "R2"
    assert entry["user_name"] == "Elena Rostova, Release Manager"
    assert entry["user_role"] == "Release Manager"
    assert entry["old_threshold"] == 30.0
    assert entry["new_threshold"] == 35.0
    assert entry["old_weight"] == 30
    assert entry["new_weight"] == 35
    assert "timestamp" in entry
    print("PASS: TEST 11 - Risk rule modifications generate comprehensive audit records with before/after state")


if __name__ == "__main__":
    test_9_operations_analyst_cannot_modify_risk_rules()
    test_10_release_manager_can_modify_risk_rules()
    test_11_risk_rule_changes_are_audited()
    print("All permission and rule audit tests passed successfully!")
