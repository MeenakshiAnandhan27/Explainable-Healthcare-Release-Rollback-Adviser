"""
SQLite database management for Explainable Healthcare Release Rollback Adviser.
Handles releases, configurable rules, decisions audit log, and stakeholder feedback.
"""

import json
import os
import sqlite3
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "rollback_adviser.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_all_rules() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM rules ORDER BY rule_id ASC")
    rows = cur.fetchall()
    conn.close()
    
    rules = []
    for r in rows:
        thresh = r["threshold"]
        try:
            thresh_val = float(thresh)
        except ValueError:
            thresh_val = thresh
        rules.append({
            "rule_id": r["rule_id"],
            "name": r["name"],
            "metric": r["metric"],
            "operator": r["operator"],
            "threshold": thresh_val,
            "weight": r["weight"],
            "enabled": bool(r["enabled"]),
            "category": r["category"],
            "description": r["description"]
        })
    return rules

def update_rule(rule_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    fields = []
    params = []
    for k, v in updates.items():
        if k in ["threshold", "weight", "enabled", "description", "name"]:
            if k == "enabled":
                v = 1 if v else 0
            elif k == "threshold":
                v = str(v)
            fields.append(f"{k} = ?")
            params.append(v)
            
    if not fields:
        conn.close()
        return None
        
    params.append(rule_id)
    sql = f"UPDATE rules SET {', '.join(fields)} WHERE rule_id = ?"
    cur.execute(sql, params)
    conn.commit()
    conn.close()
    
    # Return updated rule
    all_r = get_all_rules()
    for r in all_r:
        if r["rule_id"] == rule_id:
            return r
    return None

def get_releases(hospital_id: Optional[str] = None,
                 risk_level: Optional[str] = None,
                 search: Optional[str] = None,
                 limit: int = 100,
                 offset: int = 0) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    where = []
    params = []
    
    if hospital_id and hospital_id != "ALL":
        where.append("hospital_id = ?")
        params.append(hospital_id)
    if risk_level and risk_level != "ALL":
        where.append("risk_level = ?")
        params.append(risk_level)
    if search:
        where.append("(release_id LIKE ? OR application_name LIKE ? OR version LIKE ? OR engineer LIKE ?)")
        s_term = f"%{search}%"
        params.extend([s_term, s_term, s_term, s_term])
        
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    
    count_cur = conn.cursor()
    count_cur.execute(f"SELECT COUNT(*) FROM releases {where_sql}", params)
    total_count = count_cur.fetchone()[0]
    
    query = f"SELECT * FROM releases {where_sql} ORDER BY deployment_time DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    
    releases = []
    for row in rows:
        r_dict = dict(row)
        r_dict["affected_workflows"] = json.loads(r_dict.get("affected_workflows_json") or "[]")
        r_dict["triggered_rules"] = json.loads(r_dict.get("triggered_rules_json") or "[]")
        releases.append(r_dict)
        
    return {
        "total": total_count,
        "items": releases
    }

def get_release_by_id(release_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM releases WHERE release_id = ?", (release_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    r_dict = dict(row)
    r_dict["affected_workflows"] = json.loads(r_dict.get("affected_workflows_json") or "[]")
    r_dict["triggered_rules"] = json.loads(r_dict.get("triggered_rules_json") or "[]")
    return r_dict

def insert_decision(decision_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
    INSERT INTO decisions (timestamp, release_id, hospital_name, application_name, recommendation, final_decision, is_override, override_reason, decision_maker, role, risk_score, triggered_rules_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        decision_data["timestamp"],
        decision_data["release_id"],
        decision_data.get("hospital_name", ""),
        decision_data.get("application_name", ""),
        decision_data.get("recommendation", ""),
        decision_data["final_decision"],
        1 if decision_data.get("is_override") else 0,
        decision_data.get("override_reason", ""),
        decision_data["decision_maker"],
        decision_data["role"],
        decision_data.get("risk_score", 0),
        decision_data.get("triggered_rules_summary", "")
    ))
    decision_id = cur.lastrowid
    
    # Also update release status
    new_status = "ROLLED_BACK" if decision_data["final_decision"] == "ROLLBACK" else ("CONTINUED" if decision_data["final_decision"] == "CONTINUE" else "PENDING_REVIEW")
    cur.execute("UPDATE releases SET deployment_status = ? WHERE release_id = ?", (new_status, decision_data["release_id"]))
    
    conn.commit()
    conn.close()
    decision_data["id"] = decision_id
    return decision_data

def get_decisions(hospital: Optional[str] = None,
                  role: Optional[str] = None,
                  decision: Optional[str] = None,
                  limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    where = []
    params = []
    if hospital and hospital != "ALL":
        where.append("hospital_name = ?")
        params.append(hospital)
    if role and role != "ALL":
        where.append("role = ?")
        params.append(role)
    if decision and decision != "ALL":
        where.append("final_decision = ?")
        params.append(decision)
        
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    query = f"SELECT * FROM decisions {where_sql} ORDER BY id DESC LIMIT ?"
    params.append(limit)
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    
    decisions = []
    for r in rows:
        d = dict(r)
        d["is_override"] = bool(d["is_override"])
        decisions.append(d)
    return decisions

def insert_validation(feedback_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
    INSERT INTO stakeholder_validations (timestamp, stakeholder_name, stakeholder_role, usability_rating, explanation_clarity_rating, confidence_rating, feedback, suggested_improvement, is_prototype)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    ''', (
        feedback_data["timestamp"],
        feedback_data["stakeholder_name"],
        feedback_data["stakeholder_role"],
        feedback_data["usability_rating"],
        feedback_data["explanation_clarity_rating"],
        feedback_data["confidence_rating"],
        feedback_data["feedback"],
        feedback_data.get("suggested_improvement", "")
    ))
    v_id = cur.lastrowid
    conn.commit()
    conn.close()
    feedback_data["id"] = v_id
    return feedback_data

def get_validations() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM stakeholder_validations ORDER BY id DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
