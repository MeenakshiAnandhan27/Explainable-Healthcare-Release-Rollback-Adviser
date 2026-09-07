"""
Configurable Risk Calculation and Explainability Engine.
Purely deterministic, transparent, and auditable.
NO REAL PATIENT DATA.
"""

from typing import Dict, Any, List, Tuple

def evaluate_release_risk(release: Dict[str, Any], rules: List[Dict[str, Any]]) -> Tuple[int, str, str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Evaluates a release against configured rules.
    Returns:
      - risk_score (0-100)
      - risk_level (LOW, MEDIUM, HIGH, CRITICAL)
      - recommendation (CONTINUE, HUMAN REVIEW, ROLLBACK RECOMMENDED, etc.)
      - triggered_rules (list of triggered rule objects)
      - explanation (structured human-readable explanation and evidence breakdown)
    """
    score = 0
    triggered_rules = []
    
    # Check for missing signals or abnormal inputs
    input_warnings = []
    if release.get("error_rate_percent") is None:
        input_warnings.append("Error rate telemetry signal is missing or offline.")
    if release.get("service_availability_percent") is None:
        input_warnings.append("Service availability telemetry is currently unavailable.")
    if release.get("transaction_count") == 0:
        input_warnings.append("Zero transactions recorded. Verify if this deployment occurred during a scheduled maintenance quiet period.")
    if release.get("latency_change_percent") is not None and release.get("latency_change_percent") < -20:
        input_warnings.append(f"Significant latency improvement ({release.get('latency_change_percent')}%) detected (e.g. cache warm-up or indexing gain).")

    for rule in rules:
        if not rule.get("enabled", True):
            continue
            
        metric = rule.get("metric")
        threshold = rule.get("threshold")
        weight = int(rule.get("weight", 0))
        operator = rule.get("operator", ">")
        
        val = release.get(metric)
        if val is None:
            continue
            
        is_triggered = False
        try:
            if operator == ">":
                if float(val) > float(threshold):
                    is_triggered = True
            elif operator == "<":
                if float(val) < float(threshold):
                    is_triggered = True
            elif operator == ">=":
                if float(val) >= float(threshold):
                    is_triggered = True
            elif operator == "<=":
                if float(val) <= float(threshold):
                    is_triggered = True
            elif operator == "==":
                if str(val).strip().upper() == str(threshold).strip().upper():
                    is_triggered = True
        except (ValueError, TypeError):
            continue
            
        if is_triggered:
            score += weight
            triggered_rules.append({
                "rule_id": rule.get("rule_id", "R?"),
                "name": rule.get("name", "Rule"),
                "description": rule.get("description", ""),
                "weight": weight,
                "metric": metric,
                "value": val,
                "threshold": threshold
            })
            
    # Clamp score to 0-100
    score = min(100, max(0, score))
    
    # Recommendation logic based on Feature 7:
    # 0–29: LOW RISK -> CONTINUE
    # 30–59: MEDIUM RISK -> HUMAN REVIEW
    # 60–79: HIGH RISK -> ROLLBACK RECOMMENDED
    # 80–100: CRITICAL RISK -> ROLLBACK RECOMMENDED + HIGH IMPACT CONFIRMATION REQUIRED
    if score < 30:
        risk_level = "LOW"
        recommendation = "CONTINUE"
    elif score < 60:
        risk_level = "MEDIUM"
        recommendation = "HUMAN REVIEW"
    elif score < 80:
        risk_level = "HIGH"
        recommendation = "ROLLBACK RECOMMENDED"
    else:
        risk_level = "CRITICAL"
        recommendation = "ROLLBACK RECOMMENDED (HIGH IMPACT CONFIRMATION REQUIRED)"
        
    # Build human readable explainability
    narrative_points = []
    if not triggered_rules:
        narrative_points.append("All technical and clinical impact signals remain well within acceptable operational baseline envelopes.")
    else:
        for t in triggered_rules:
            if t["metric"] == "error_rate_percent":
                narrative_points.append(f"Error rate reached {t['value']}%, surpassing configured safety threshold of {t['threshold']}%.")
            elif t["metric"] == "latency_change_percent":
                narrative_points.append(f"Service latency increased by {t['value']}% over baseline (threshold: {t['threshold']}%).")
            elif t["metric"] == "transaction_drop_percent":
                narrative_points.append(f"Transaction throughput dropped by {t['value']}% compared to historical baseline (threshold: {t['threshold']}%).")
            elif t["metric"] == "customer_impact_level":
                narrative_points.append(f"Clinical customer impact classified as {t['value']} affecting patient-care workflows.")
            elif t["metric"] == "service_availability_percent":
                narrative_points.append(f"Service availability degraded to {t['value']}% (below required {t['threshold']}% SLA).")
            else:
                narrative_points.append(f"Condition '{t['name']}' triggered with value {t['value']} against threshold {t['threshold']}.")
                
    summary_text = ""
    if risk_level == "LOW":
        summary_text = "Release demonstrates healthy technical telemetry and minimal patient-care risk. Proceed with standard monitoring."
    elif risk_level == "MEDIUM":
        summary_text = "Anomalies detected in technical or business signals that warrant human engineer review before authorizing promotion."
    elif risk_level == "HIGH":
        summary_text = "Multiple critical risk thresholds have been exceeded. A release rollback is strongly recommended to preserve hospital operations."
    else:
        summary_text = "Critical operational degradation or high-severity workflow impact detected. Rollback recommended immediately with mandatory senior confirmation."

    explanation = {
        "summary": summary_text,
        "narrative_points": narrative_points,
        "warnings": input_warnings,
        "evidence": {
            "error_rate": {
                "value": f"{release.get('error_rate_percent', 'N/A')}%",
                "baseline": f"{release.get('error_baseline_percent', 'N/A')}%",
                "threshold": "5.0%"
            },
            "latency": {
                "value": f"{release.get('latency_ms', 'N/A')} ms",
                "baseline": f"{release.get('latency_baseline_ms', 'N/A')} ms",
                "change": f"{release.get('latency_change_percent', 'N/A')}%"
            },
            "transactions": {
                "value": str(release.get("transaction_count", "N/A")),
                "baseline": str(release.get("baseline_transaction_count", "N/A")),
                "drop": f"{release.get('transaction_drop_percent', 'N/A')}%"
            },
            "customer_impact": release.get("customer_impact_level", "UNKNOWN"),
            "affected_workflows": release.get("affected_workflows", [])
        }
    }
    
    return score, risk_level, recommendation, triggered_rules, explanation
