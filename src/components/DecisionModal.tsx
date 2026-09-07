import React, { useState } from "react";
import { Release, UserSession } from "../types";
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X
} from "lucide-react";
import { RiskBadge } from "./RiskBadge";

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: Release;
  user: UserSession;
  onSubmitDecision: (decision: "ROLLBACK" | "CONTINUE" | "SEND FOR REVIEW", overrideReason: string) => Promise<void>;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  release,
  user,
  onSubmitDecision
}) => {
  const [selectedDecision, setSelectedDecision] = useState<"ROLLBACK" | "CONTINUE" | "SEND FOR REVIEW" | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [confirmedSafety, setConfirmedSafety] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const rec = release.recommendation || "";
  const isHighOrCritical = release.risk_level === "HIGH" || release.risk_level === "CRITICAL";

  // Check if chosen decision is an override
  const isRollbackRec = rec.includes("ROLLBACK");
  const isContinueRec = rec.includes("CONTINUE");
  const isReviewRec = rec.includes("HUMAN REVIEW");

  let isOverride = false;
  if (selectedDecision) {
    if (isRollbackRec && (selectedDecision === "CONTINUE" || selectedDecision === "SEND FOR REVIEW")) {
      isOverride = true;
    } else if (isContinueRec && (selectedDecision === "ROLLBACK" || selectedDecision === "SEND FOR REVIEW")) {
      isOverride = true;
    } else if (isReviewRec && (selectedDecision === "ROLLBACK" || selectedDecision === "CONTINUE")) {
      isOverride = true;
    }
  }

  const handleSubmit = async () => {
    if (!selectedDecision) {
      setErrorMsg("Please select a decision action.");
      return;
    }

    if (isOverride && !overrideReason.trim()) {
      setErrorMsg("Override reason is mandatory when your decision differs from the adviser recommendation.");
      return;
    }

    if (isHighOrCritical && !confirmedSafety) {
      setErrorMsg("Please confirm that you have reviewed the clinical risk evidence and authorized this action.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await onSubmitDecision(selectedDecision, overrideReason.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="decision-modal-backdrop"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div
        id="decision-modal-container"
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                Human Release Authorization & Confirmation
              </h3>
              <RiskBadge level={release.risk_level} score={release.risk_score} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {release.release_id} • {release.application_name} ({release.version}) • {release.hospital_name}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Advisory Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Advisory system — no automatic production rollback.</span>
              <p className="mt-0.5 text-amber-700">
                The decision chosen here represents the human operator's final recorded determination and will be audited with your credentials.
              </p>
            </div>
          </div>

          {/* Current Recommendation Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Adviser Recommendation
            </div>
            <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span className={
                rec.includes("ROLLBACK")
                  ? "text-red-700"
                  : rec.includes("CONTINUE")
                  ? "text-green-700"
                  : "text-amber-700"
              }>
                {release.recommendation}
              </span>
              <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                Risk Score: {release.risk_score}/100
              </span>
            </div>
            {release.triggered_rules && release.triggered_rules.length > 0 && (
              <div className="mt-2 text-xs text-slate-600">
                <span className="font-medium text-slate-700">Triggered Rules: </span>
                {release.triggered_rules.map((t) => t.name).join("; ")}
              </div>
            )}
          </div>

          {/* Decision Selection Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Final Human Decision:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Rollback */}
              <button
                type="button"
                id="btn-choice-rollback"
                onClick={() => setSelectedDecision("ROLLBACK")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDecision === "ROLLBACK"
                    ? "border-red-500 bg-red-50 ring-2 ring-red-400 text-red-900"
                    : "border-slate-200 hover:border-red-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-red-700 uppercase">
                  <RotateCcw className="w-3.5 h-3.5" />
                  ROLLBACK
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Revert to {release.previous_version || "previous"} immediately
                </div>
              </button>

              {/* Continue */}
              <button
                type="button"
                id="btn-choice-continue"
                onClick={() => setSelectedDecision("CONTINUE")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDecision === "CONTINUE"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-400 text-green-900"
                    : "border-slate-200 hover:border-green-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-green-700 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CONTINUE
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Authorize rollout progression
                </div>
              </button>

              {/* Human Review */}
              <button
                type="button"
                id="btn-choice-review"
                onClick={() => setSelectedDecision("SEND FOR REVIEW")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDecision === "SEND FOR REVIEW"
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-400 text-amber-900"
                    : "border-slate-200 hover:border-amber-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 uppercase">
                  <Clock className="w-3.5 h-3.5" />
                  HOLD REVIEW
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Escalate to clinical engineering
                </div>
              </button>
            </div>
          </div>

          {/* Override Workflow */}
          {isOverride && (
            <div
              id="override-workflow-container"
              className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-2 border-l-4 border-l-red-500"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Adviser Override Detected — Justification Mandatory</span>
              </div>
              <p className="text-[11px] text-red-700 leading-relaxed">
                You selected <strong>{selectedDecision}</strong>, which diverges from the system recommendation (<strong>{release.recommendation}</strong>). 
                An auditable clinical/technical override reason is required.
              </p>
              <textarea
                id="override-reason-input"
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Example: Error spike was caused by a temporary downstream lab gateway timeout during scheduled maintenance and has already recovered."
                className="w-full text-xs p-2.5 bg-white border border-red-300 rounded-md focus:ring-1 focus:ring-red-500 focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </div>
          )}

          {/* Safety Check for High / Critical Risk */}
          {isHighOrCritical && (
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="safety-confirm-checkbox"
                checked={confirmedSafety}
                onChange={(e) => setConfirmedSafety(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="safety-confirm-checkbox" className="text-xs text-slate-700 cursor-pointer">
                I verify that I have evaluated the clinical workflow telemetry, reviewed patient care safety implications, and confirm this authorization on behalf of {user.role}.
              </label>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 bg-red-100 text-red-800 border border-red-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Operator Audit Info */}
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Signing Operator: <strong>{user.name}</strong> ({user.role})</span>
            <span className="font-mono">Timestamp: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="submit-decision-btn"
            disabled={isSubmitting || !selectedDecision}
            onClick={handleSubmit}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md text-white shadow-xs transition-colors cursor-pointer ${
              selectedDecision === "ROLLBACK"
                ? "bg-red-600 hover:bg-red-700"
                : selectedDecision === "CONTINUE"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? "Recording Audit..." : "Submit Human Decision"}
          </button>
        </div>
      </div>
    </div>
  );
};
