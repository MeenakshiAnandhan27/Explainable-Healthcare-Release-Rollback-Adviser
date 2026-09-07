import React from "react";
import { ShieldAlert } from "lucide-react";

interface AdvisoryBannerProps {
  compact?: boolean;
}

export const AdvisoryBanner: React.FC<AdvisoryBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div
        id="advisory-banner-compact"
        className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg"
      >
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
        <span>Advisory system — no automatic production rollback. Human confirmation required.</span>
      </div>
    );
  }

  return (
    <div
      id="advisory-banner-full"
      className="bg-amber-50/80 border border-amber-200 border-l-4 border-l-amber-500 p-4 rounded-xl shadow-2xs mb-5 flex items-start gap-3"
    >
      <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
      <div className="text-sm">
        <h4 className="font-semibold text-amber-900 tracking-tight flex items-center gap-2">
          Safety Notice: Advisory System Only
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-200/70 text-amber-800 rounded-md">
            Healthcare Standard
          </span>
        </h4>
        <p className="text-amber-800 text-xs mt-1 leading-relaxed">
          This system continuously quantifies release risk and provides explainable recommendations, but <strong>never executes an automated production rollback</strong>. 
          All high-impact actions require explicit human review and senior authorization. Synthetic simulation prototype.
        </p>
      </div>
    </div>
  );
};
