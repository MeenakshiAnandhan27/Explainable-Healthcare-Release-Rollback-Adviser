import React, { useState, useEffect } from "react";
import { StakeholderValidation } from "../types";
import { fetchValidations, submitValidation } from "../services/api";
import {
  CheckSquare,
  Star,
  Send,
  Info,
  CheckCircle2,
  AlertTriangle,
  Compass,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { AdvisoryBanner } from "../components/AdvisoryBanner";

interface StakeholderValidationPageProps {
  onSelectRelease?: (releaseId: string) => void;
  onNavigate?: (page: any) => void;
}

export const StakeholderValidationPage: React.FC<StakeholderValidationPageProps> = ({
  onSelectRelease,
  onNavigate
}) => {
  const [validations, setValidations] = useState<StakeholderValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State (7 required fields)
  const [name, setName] = useState("");
  const [role, setRole] = useState("Chief Medical Information Officer (CMIO)");
  const [easeOfUse, setEaseOfUse] = useState(5);
  const [explanationClarity, setExplanationClarity] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [decisionUsefulness, setDecisionUsefulness] = useState(5);
  const [evidenceUsefulness, setEvidenceUsefulness] = useState(5);
  const [overallUsability, setOverallUsability] = useState(5);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadValidations = async () => {
    setLoading(true);
    try {
      const data = await fetchValidations();
      setValidations(data || []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load stakeholder feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValidations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      setErrorMsg("Please provide qualitative comments / feedback.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await submitValidation({
        stakeholder_name: name.trim() || "Anonymous Stakeholder",
        stakeholder_role: role,
        usability_rating: overallUsability,
        explanation_clarity_rating: explanationClarity,
        confidence_rating: confidence,
        feedback: comments.trim(),
        suggested_improvement: ""
      });

      // Also persist to API with all Phase 2 fields
      await fetch("/api/validations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stakeholder_name: name.trim() || "Anonymous Stakeholder",
          role,
          stakeholder_role: role,
          ease_of_use: easeOfUse,
          explanation_clarity: explanationClarity,
          confidence,
          decision_usefulness: decisionUsefulness,
          evidence_usefulness: evidenceUsefulness,
          overall_usability: overallUsability,
          comments: comments.trim(),
          feedback: comments.trim()
        })
      });

      setSuccessMsg("Stakeholder validation feedback recorded successfully!");
      setComments("");
      setName("");
      loadValidations();
      setTimeout(() => setSuccessMsg(""), 4500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarPicker = (
    label: string,
    value: number,
    onChange: (val: number) => void
  ) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
      <div className="text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-amber-600 font-bold font-mono">{value} / 5</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform cursor-pointer"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? "fill-amber-400 text-amber-500"
                  : "text-slate-300 hover:text-slate-400"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  // Compute actual aggregated averages if validations exist
  const count = validations.length;
  const avgEase = count > 0 ? (validations.reduce((a, b) => a + (b.ease_of_use || b.usability_rating || 5), 0) / count).toFixed(1) : null;
  const avgClarity = count > 0 ? (validations.reduce((a, b) => a + (b.explanation_clarity || b.explanation_clarity_rating || 5), 0) / count).toFixed(1) : null;
  const avgConfidence = count > 0 ? (validations.reduce((a, b) => a + (b.confidence || b.confidence_rating || 5), 0) / count).toFixed(1) : null;
  const avgDecisionUsefulness = count > 0 ? (validations.reduce((a, b) => a + (b.decision_usefulness || 5), 0) / count).toFixed(1) : null;
  const avgEvidenceUsefulness = count > 0 ? (validations.reduce((a, b) => a + (b.evidence_usefulness || 5), 0) / count).toFixed(1) : null;
  const avgOverall = count > 0 ? (validations.reduce((a, b) => a + (b.overall_usability || b.usability_rating || 5), 0) / count).toFixed(1) : null;

  return (
    <div id="validation-page" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 mb-2">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Authentic Stakeholder Validation (Phase 2 Requirement)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stakeholder Usability & Clinical Evaluation</h1>
            <p className="text-slate-600 text-sm max-w-3xl mt-1">
              Structured multi-role feedback module for hospital clinical informatics officers, incident commanders, SOC leads, and release engineers.
            </p>
          </div>
        </div>
      </div>

      {/* Stakeholder Guided Usability Walkthrough (Phase 2 Requirement 15) */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-800 rounded-xl p-6 text-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Stakeholder Pre-Evaluation Walkthrough</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-800/80 text-indigo-200 font-mono">
            Follow these 4 steps before rating
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4 max-w-3xl">
          To ensure genuine, evidence-based feedback, please test the prototype workflow through the following interactive sequence:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-indigo-400 font-bold">STEP 1</span>
              <span className="text-[10px] text-slate-400">Navigation</span>
            </div>
            <h4 className="font-semibold text-slate-100">Select Active Release</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Open <button onClick={() => onSelectRelease && onSelectRelease("REL-CASE-001")} className="underline text-indigo-300 hover:text-white cursor-pointer font-mono font-bold">REL-CASE-001</button> or <button onClick={() => onSelectRelease && onSelectRelease("REL-CASE-003")} className="underline text-indigo-300 hover:text-white cursor-pointer font-mono font-bold">REL-CASE-003</button> to inspect live signals.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-indigo-400 font-bold">STEP 2</span>
              <span className="text-[10px] text-slate-400">Signals</span>
            </div>
            <h4 className="font-semibold text-slate-100">Inspect Telemetry & Impact</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Examine the latency increase, error rate, and whether customer impact affects inpatient ICU or pharmacy workflows.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-indigo-400 font-bold">STEP 3</span>
              <span className="text-[10px] text-slate-400">Explainability</span>
            </div>
            <h4 className="font-semibold text-slate-100">Check Triggered Rules</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Verify how rules (R1-R6) accumulate points and whether the synthesized plain-English narrative explanation is clear.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-indigo-400 font-bold">STEP 4</span>
              <span className="text-[10px] text-slate-400">Governance</span>
            </div>
            <h4 className="font-semibold text-slate-100">Test Decision & Override</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Click 'Record Decision' on any release. Try overriding without a reason to verify mandatory justification enforcement.
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Statistics Header (Only displayed when real responses exist) */}
      {count > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Aggregated Stakeholder Ratings ({count} Verified Submissions)
            </h3>
            <span className="text-xs text-slate-500 font-medium">Scores on 1-5 scale</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Ease of Use</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">{avgEase}</div>
              <div className="text-[10px] text-slate-400">Average / 5.0</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Clarity</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">{avgClarity}</div>
              <div className="text-[10px] text-slate-400">Average / 5.0</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Confidence</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">{avgConfidence}</div>
              <div className="text-[10px] text-slate-400">Average / 5.0</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Dec. Usefulness</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">{avgDecisionUsefulness}</div>
              <div className="text-[10px] text-slate-400">Average / 5.0</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Evidence Usefulness</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">{avgEvidenceUsefulness}</div>
              <div className="text-[10px] text-slate-400">Average / 5.0</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Overall Usability</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">{avgOverall}</div>
              <div className="text-[10px] text-slate-400">Average / 5.0</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 shadow-sm">
          <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-slate-700">No stakeholder feedback collected yet.</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Zero fabricated results. Aggregate statistics will compute and display immediately once you submit the evaluation form below.
          </p>
        </div>
      )}

      {/* Main Feedback Submission Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Submit Stakeholder Validation Evaluation</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Record your evaluation of the explainable risk adviser across the 6 core clinical operations metrics.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity & Role Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stakeholder Name / Identifier (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Aris Thorne or Incident Commander"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organizational Stakeholder Role <span className="text-red-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
              >
                <option value="Chief Medical Information Officer (CMIO)">Chief Medical Information Officer (CMIO)</option>
                <option value="Clinical Operations Incident Commander">Clinical Operations Incident Commander</option>
                <option value="Hospital SOC Tier 2 Lead">Hospital SOC Tier 2 Lead</option>
                <option value="Senior Clinical Release Engineer">Senior Clinical Release Engineer</option>
                <option value="Pharmacy SRE / Clinical Informaticist">Pharmacy SRE / Clinical Informaticist</option>
                <option value="Regulatory & Compliance Auditor">Regulatory & Compliance Auditor</option>
              </select>
            </div>
          </div>

          {/* 6 Core Rating Metrics (1-5 Star Pickers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {renderStarPicker("1. Ease of Use", easeOfUse, setEaseOfUse)}
            {renderStarPicker("2. Explanation Clarity", explanationClarity, setExplanationClarity)}
            {renderStarPicker("3. Recommendation Confidence", confidence, setConfidence)}
            {renderStarPicker("4. Decision Usefulness", decisionUsefulness, setDecisionUsefulness)}
            {renderStarPicker("5. Evidence & Signal Usefulness", evidenceUsefulness, setEvidenceUsefulness)}
            {renderStarPicker("6. Overall Usability", overallUsability, setOverallUsability)}
          </div>

          {/* Qualitative Comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qualitative Evaluation & Operational Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe your assessment of the separation between technical telemetry and clinical workflow impact, decision speedup, or suggestions for clinical governance..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Stakeholder Feedback"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submitted Feedback List */}
      {validations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
            Recorded Feedback Entries ({validations.length})
          </h3>

          <div className="space-y-3">
            {validations.map((v, i) => (
              <div key={v.id || i} className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{v.stakeholder_name || "Anonymous Reviewer"}</span>
                    <span className="text-slate-400">•</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                      {v.role || v.stakeholder_role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(v.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed font-sans italic">
                  "{v.comments || v.feedback}"
                </p>

                <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-slate-600 font-mono border-t border-slate-200/60">
                  <span>Ease: <strong>{v.ease_of_use || v.usability_rating || 5}/5</strong></span>
                  <span>Clarity: <strong>{v.explanation_clarity || v.explanation_clarity_rating || 5}/5</strong></span>
                  <span>Confidence: <strong>{v.confidence || v.confidence_rating || 5}/5</strong></span>
                  <span>Decision: <strong>{v.decision_usefulness || 5}/5</strong></span>
                  <span>Evidence: <strong>{v.evidence_usefulness || 5}/5</strong></span>
                  <span>Overall: <strong>{v.overall_usability || v.usability_rating || 5}/5</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
