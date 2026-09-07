import React, { useState, useEffect } from "react";
import { StakeholderValidation } from "../types";
import { fetchValidations, submitValidation } from "../services/api";
import {
  CheckSquare,
  Star,
  Send,
  Info,
  Check,
  AlertTriangle
} from "lucide-react";
import { AdvisoryBanner } from "../components/AdvisoryBanner";

export const StakeholderValidationPage: React.FC = () => {
  const [validations, setValidations] = useState<StakeholderValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("Incident Commander");
  const [usability, setUsability] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [suggestedImprovement, setSuggestedImprovement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadValidations = async () => {
    setLoading(true);
    try {
      const data = await fetchValidations();
      setValidations(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load validations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValidations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter stakeholder name.");
      return;
    }
    if (!feedback.trim()) {
      setErrorMsg("Please provide qualitative evaluation comments.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await submitValidation({
        stakeholder_name: name.trim(),
        stakeholder_role: role,
        usability_rating: usability,
        explanation_clarity_rating: clarity,
        confidence_rating: confidence,
        feedback: feedback.trim(),
        suggested_improvement: suggestedImprovement.trim() || undefined
      });
      setSuccessMsg("Stakeholder validation feedback recorded in prototype database.");
      setName("");
      setFeedback("");
      setSuggestedImprovement("");
      loadValidations();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit validation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star picker helper
  const renderStarPicker = (
    label: string,
    value: number,
    onChange: (val: number) => void
  ) => (
    <div>
      <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-amber-600 font-bold">{value} / 5</span>
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
                star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div id="stakeholder-validation-page" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              Stakeholder Validation & Clinical Evaluation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured evaluation instrument for clinical operations, engineering leads, and incident commanders.
            </p>
          </div>
        </div>

        <AdvisoryBanner />
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <strong className="text-amber-950">Prototype Validation Notice: </strong>
          This is a simulated validation feedback mechanism for the prototype. It allows operational teams to conduct usability walk-throughs and score explainability. 
          No claims of real unassisted hospital clinical deployment are made.
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two-Column: Form on Left, Previous Feedback on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Submit Stakeholder Evaluation
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stakeholder Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stakeholder Name:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Jennifer Clark"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Stakeholder Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical / Technical Role:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Chief Medical Information Officer (CMIO)">Chief Medical Information Officer (CMIO)</option>
                <option value="Incident Commander">Incident Commander</option>
                <option value="Clinical Pharmacist">Clinical Pharmacist</option>
                <option value="Lead DevOps Engineer">Lead DevOps Engineer</option>
                <option value="SOC Tier 2 Operations Analyst">SOC Tier 2 Operations Analyst</option>
              </select>
            </div>

            {/* Star Ratings */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              {renderStarPicker("Usability & Layout", usability, setUsability)}
              {renderStarPicker("Explanation Clarity", clarity, setClarity)}
              {renderStarPicker("Recommendation Confidence", confidence, setConfidence)}
            </div>

            {/* Qualitative Feedback */}
            <div className="pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evaluation Comments:
              </label>
              <textarea
                rows={3}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How clearly does the adviser explain why a rollback was or wasn't advised?"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Suggested Improvement */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suggested Improvements (Optional):
              </label>
              <textarea
                rows={2}
                value={suggestedImprovement}
                onChange={(e) => setSuggestedImprovement(e.target.value)}
                placeholder="e.g. Integrate automatic HL7 interface retry counts into R4"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Recording..." : "Submit Feedback"}
            </button>
          </form>
        </div>

        {/* Existing Validations Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recorded Stakeholder Validations ({validations.length})
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation reviews collected during clinical prototype walkthroughs
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-700">
              Avg Rating: 4.8 / 5
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Loading recorded validations...
            </div>
          ) : (
            <div className="space-y-3">
              {validations.map((v) => (
                <div
                  key={v.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 text-xs">{v.stakeholder_name}</span>
                      <span className="text-slate-400 text-xs mx-1.5">•</span>
                      <span className="text-blue-600 text-xs font-medium">{v.stakeholder_role}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(v.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Ratings Row */}
                  <div className="flex flex-wrap gap-4 text-xs py-1 border-y border-slate-100 text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[11px]">Usability:</span>
                      <span className="font-bold text-amber-600">{v.usability_rating}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[11px]">Clarity:</span>
                      <span className="font-bold text-amber-600">{v.explanation_clarity_rating}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[11px]">Confidence:</span>
                      <span className="font-bold text-amber-600">{v.confidence_rating}/5</span>
                    </div>
                  </div>

                  {/* Comments */}
                  <p className="text-xs text-slate-700 leading-relaxed">
                    "{v.feedback}"
                  </p>

                  {/* Suggested Improvements */}
                  {v.suggested_improvement && (
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                      <strong>Suggested Improvement: </strong> {v.suggested_improvement}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
