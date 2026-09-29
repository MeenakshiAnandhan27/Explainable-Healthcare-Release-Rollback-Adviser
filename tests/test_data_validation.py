#!/usr/bin/env python3
"""
Test Suite: Data Quality & Schema Validation
Covers:
  - TEST 12: Invalid negative latency is rejected
  - TEST 13: Error rate > 100% is rejected
  - TEST 14: Duplicate release IDs are rejected
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def validate_release_record(record: dict, existing_ids: set) -> tuple[bool, str]:
    """
    Validates release metadata and telemetry signals according to data quality specifications:
      - release_id must be unique and non-empty
      - latency_ms must be >= 0 (if provided)
      - error_rate_percent must be between 0.0 and 100.0 (if provided)
      - transaction_count must be >= 0 (if provided)
      - customer_impact_level must be one of LOW, MEDIUM, HIGH, CRITICAL
    """
    rel_id = record.get("release_id")
    if not rel_id or not isinstance(rel_id, str):
        return False, "Missing or invalid release_id"

    # TEST 14: Duplicate release ID check
    if rel_id in existing_ids:
        return False, f"Duplicate release ID '{rel_id}' is rejected."

    # TEST 12: Negative latency check
    lat = record.get("latency_ms")
    if lat is not None:
        if not isinstance(lat, (int, float)) or lat < 0:
            return False, f"Invalid negative latency ({lat} ms) is rejected. Latency must be >= 0."

    # TEST 13: Error rate out of bounds check
    err = record.get("error_rate_percent")
    if err is not None:
        if not isinstance(err, (int, float)) or err < 0.0 or err > 100.0:
            return False, f"Invalid error rate ({err}%) is rejected. Error rate must be between 0.0 and 100.0."

    # Transaction count check
    tx = record.get("transaction_count")
    if tx is not None:
        if not isinstance(tx, (int, float)) or tx < 0:
            return False, f"Invalid transaction count ({tx}) is rejected. Transaction count must be >= 0."

    # Customer impact check
    impact = record.get("customer_impact_level")
    if impact and impact not in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        return False, f"Invalid customer impact level '{impact}'."

    return True, "Valid release record"


def test_12_invalid_negative_latency_is_rejected():
    """
    TEST 12: Invalid negative latency is rejected.
    Telemetry errors that send negative values (e.g. -250 ms) must fail schema validation.
    """
    existing_ids = {"REL-2026-0001", "REL-2026-0002"}
    corrupt_record = {
        "release_id": "REL-CORRUPT-LATENCY",
        "hospital_id": "HOSP-01",
        "hospital_name": "City General",
        "latency_ms": -45.0,  # Negative latency!
        "error_rate_percent": 0.5,
        "transaction_count": 1000,
        "customer_impact_level": "LOW"
    }

    is_valid, error = validate_release_record(corrupt_record, existing_ids)
    assert is_valid is False, "Record with negative latency must be rejected"
    assert "Invalid negative latency" in error
    print("PASS: TEST 12 - Negative latency (-45.0 ms) rejected by data validation engine")


def test_13_error_rate_greater_than_100_is_rejected():
    """
    TEST 13: Error rate > 100% is rejected.
    A percentage value > 100% (e.g. 142.5%) violates mathematical boundaries and must fail validation.
    """
    existing_ids = {"REL-2026-0001", "REL-2026-0002"}
    corrupt_record = {
        "release_id": "REL-CORRUPT-ERROR-RATE",
        "hospital_id": "HOSP-01",
        "hospital_name": "City General",
        "latency_ms": 320.0,
        "error_rate_percent": 142.5,  # > 100%!
        "transaction_count": 1000,
        "customer_impact_level": "LOW"
    }

    is_valid, error = validate_release_record(corrupt_record, existing_ids)
    assert is_valid is False, "Record with error rate > 100% must be rejected"
    assert "Invalid error rate" in error
    print("PASS: TEST 13 - Error rate > 100% (142.5%) rejected by data validation engine")


def test_14_duplicate_release_ids_are_rejected():
    """
    TEST 14: Duplicate release IDs are rejected.
    Attempting to register a release whose release_id already exists in the registry must fail.
    """
    existing_ids = {"REL-2026-0001", "REL-2026-0002", "REL-CASE-001"}
    duplicate_record = {
        "release_id": "REL-CASE-001",  # Already exists!
        "hospital_id": "HOSP-01",
        "hospital_name": "City General",
        "latency_ms": 1200.0,
        "error_rate_percent": 0.4,
        "transaction_count": 5000,
        "customer_impact_level": "LOW"
    }

    is_valid, error = validate_release_record(duplicate_record, existing_ids)
    assert is_valid is False, "Duplicate release ID must be rejected"
    assert "Duplicate release ID 'REL-CASE-001' is rejected" in error
    print("PASS: TEST 14 - Duplicate release ID (REL-CASE-001) successfully prevented from overwriting")


if __name__ == "__main__":
    test_12_invalid_negative_latency_is_rejected()
    test_13_error_rate_greater_than_100_is_rejected()
    test_14_duplicate_release_ids_are_rejected()
    print("All data validation and quality tests passed successfully!")
