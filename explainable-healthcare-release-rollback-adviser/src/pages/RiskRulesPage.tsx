import React, { useState, useEffect } from "react";
import { Rule, UserSession } from "../types";
import { fetchRules, updateRule } from "../services/api";
import {
  Sliders,
  ShieldCheck,
  Lock,
  Edit2,
  Check,
  X,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { AdvisoryBanner } from "../components/AdvisoryBanner";

interface RiskRulesPageProps {
  user: UserSession;
  onSwitchRole: () => void;
}

export const RiskRulesPage: React.FC<RiskRulesPageProps> = ({ user, onSwitchRole }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Rule>>({});
  const [saveSuccess, setSaveSuccess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const isManager = user.role === "Release Manager";

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await fetchRules();
      setRules(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load risk rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleStartEdit = (rule: Rule) => {
    if (!isManager) return;
    setEditingRuleId(rule.rule_id);
    setEditForm({
      threshold: rule.threshold,
      weight: rule.weight,
      enabled: rule.enabled,
      description: rule.description,
      name: rule.name
    });
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (ruleId: string) => {
    if (!isManager) return;
    setErrorMsg("");
    setSaveSuccess("");
    try {
      const updated = await updateRule(ruleId, editForm);
      setRules((prev) => prev.map((r) => (r.rule_id === ruleId ? updated : r)));
      setEditingRuleId(null);
      setSaveSuccess(`Rule ${ruleId} successfully updated. Live scoring recalibrated without code changes.`);
      setTimeout(() => setSaveSuccess(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update rule");
    }
  };

  const handleToggleEnabled = async (rule: Rule) => {
    if (!isManager) return;
    try {
      const updated = await updateRule(rule.rule_id, { enabled: !rule.enabled });
      setRules((prev) => prev.map((r) => (r.rule_id === rule.rule_id ? updated : r)));
      setSaveSuccess(`Rule ${rule.rule_id} ${!rule.enabled ? "enabled" : "disabled"}.`);
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to toggle rule");
    }
  };

  return (
    <div id="risk-rules-page" className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            Configurable Risk Rules Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic threshold & risk points weighting table. Changes recalibrate risk scores in real-time.
          </p>
        </div>

        {/* Role Access Indicator */}
        <div className="flex items-center gap-2.5">
          {isManager ? (
            <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-800 border border-green-200 rounded flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              Release Manager: Editing Authorized
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                View-Only (Analyst Role)
              </span>
              <button
                onClick={onSwitchRole}
                className="text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition-colors shadow-xs"
              >
                Switch to Manager
              </button>
            </div>
          )}
        </div>
      </div>

      <AdvisoryBanner />

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Risk Engine Scoring Guide */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Risk Score Tiers & Advisory Mappings
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-green-50/70 border border-green-200 rounded-lg">
            <div className="font-bold text-green-800">Score 0–29: LOW RISK</div>
            <div className="text-green-700 text-[11px] mt-0.5">Recommendation: <strong>CONTINUE</strong></div>
            <div className="text-slate-500 text-[10px] mt-0.5">Normal operational telemetry</div>
          </div>
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="font-bold text-amber-800">Score 30–59: MEDIUM RISK</div>
            <div className="text-amber-700 text-[11px] mt-0.5">Recommendation: <strong>HUMAN REVIEW</strong></div>
            <div className="text-slate-500 text-[10px] mt-0.5">Telemetry anomalies detected</div>
          </div>
          <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-lg">
            <div className="font-bold text-orange-800">Score 60–79: HIGH RISK</div>
            <div className="text-orange-700 text-[11px] mt-0.5">Recommendation: <strong>ROLLBACK RECOMMENDED</strong></div>
            <div className="text-slate-500 text-[10px] mt-0.5">Significant service degradation</div>
          </div>
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg border-l-4 border-l-red-500">
            <div className="font-bold text-red-800">Score 80–100: CRITICAL RISK</div>
            <div className="text-red-700 text-[11px] mt-0.5">Recommendation: <strong>ROLLBACK + CONFIRMATION</strong></div>
            <div className="text-slate-500 text-[10px] mt-0.5">Severe patient care hazard</div>
          </div>
        </div>
      </div>

      {/* Rules Table in Technical Data Grid format */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Configurable Rules (R1–R6)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify thresholds and weights in real-time. Changes immediately impact all risk calculations.
            </p>
          </div>
          <button
            onClick={loadRules}
            className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Loading configurable rules...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Rule ID</th>
                  <th className="px-4 py-2.5">Rule Name & Description</th>
                  <th className="px-4 py-2.5">Telemetry Metric</th>
                  <th className="px-4 py-2.5">Operator</th>
                  <th className="px-4 py-2.5">Threshold</th>
                  <th className="px-4 py-2.5">Risk Weight</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => {
                  const isEditing = editingRuleId === rule.rule_id;

                  return (
                    <tr key={rule.rule_id} className="hover:bg-blue-50/40 transition-colors border-b border-slate-100">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 text-sm">
                        {rule.rule_id}
                      </td>

                      {/* Name & Description */}
                      <td className="px-4 py-3 max-w-xs">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editForm.name ?? rule.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full text-xs p-1 border border-slate-300 rounded"
                            />
                            <textarea
                              rows={2}
                              value={editForm.description ?? rule.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full text-[11px] p-1 border border-slate-300 rounded"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-slate-900">{rule.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{rule.description}</div>
                          </div>
                        )}
                      </td>

                      {/* Metric */}
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {rule.metric}
                      </td>

                      {/* Operator */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">
                        {rule.operator}
                      </td>

                      {/* Threshold */}
                      <td className="px-4 py-3 font-mono">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.threshold ?? rule.threshold}
                            onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })}
                            className="w-20 text-xs p-1 border border-slate-300 rounded font-mono"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{String(rule.threshold)}</span>
                        )}
                      </td>

                      {/* Weight */}
                      <td className="px-4 py-3 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={editForm.weight ?? rule.weight}
                            onChange={(e) => setEditForm({ ...editForm, weight: parseInt(e.target.value) || 0 })}
                            className="w-16 text-xs p-1 border border-slate-300 rounded font-mono"
                          />
                        ) : (
                          <span className="font-bold text-red-600">+{rule.weight} pts</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          disabled={!isManager}
                          onClick={() => handleToggleEnabled(rule)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer uppercase ${
                            rule.enabled
                              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                              : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                          } disabled:cursor-not-allowed`}
                        >
                          {rule.enabled ? "ENABLED" : "DISABLED"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(rule.rule_id)}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={!isManager}
                            onClick={() => handleStartEdit(rule)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 ml-auto cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
