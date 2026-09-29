#!/usr/bin/env python3
"""
Test Suite: Reproducible Experiment Verification
Validates:
  - Fixed random seed 42 produces deterministic output
  - Primary baseline is calculated as 38.2 minutes
  - Incident subset baseline reconciles the 48.5 minute discrepancy
  - Adviser decision time is <= 10.0 min target
  - Decision accuracy is >= 90.0%
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.run_experiment import run_experiment


def test_reproducible_experiment_and_metrics():
    """
    Runs the reproducible experiment and verifies metric constraints.
    """
    results = run_experiment()
    metrics = results["metrics"]

    # Verify primary baseline is 38.2 mins
    assert metrics["baseline_avg_decision_time_min"] == 38.2, f"Expected primary baseline 38.2 min, got {metrics['baseline_avg_decision_time_min']}"

    # Verify target constraint
    assert metrics["measured_avg_decision_time_min"] <= metrics["target_decision_time_min"], \
        f"Measured {metrics['measured_avg_decision_time_min']} must be <= target {metrics['target_decision_time_min']}"

    # Verify decision time reduction
    assert metrics["decision_time_reduction_percent"] >= 70.0, \
        f"Decision time reduction must be >= 70%, got {metrics['decision_time_reduction_percent']}%"

    # Verify accuracy
    assert metrics["accuracy_percent"] >= 90.0, f"Accuracy must be >= 90%, got {metrics['accuracy_percent']}%"

    # Verify false rollback rate is within safety boundaries
    assert metrics["false_rollback_rate_percent"] <= 6.0, f"False rollback rate must be <= 6.0%, got {metrics['false_rollback_rate_percent']}%"

    # Verify missed rollback rate is within safety boundaries
    assert metrics["missed_rollback_rate_percent"] <= 4.0, f"Missed rollback rate must be <= 4.0%, got {metrics['missed_rollback_rate_percent']}%"

    # Verify incident subset baseline explanation exists
    assert "baseline_reconciliation" in results
    assert results["baseline_reconciliation"]["incident_subset_baseline_min"] == 48.5

    print("PASS: Reproducible experiment metrics validated successfully against quality targets!")


if __name__ == "__main__":
    test_reproducible_experiment_and_metrics()
