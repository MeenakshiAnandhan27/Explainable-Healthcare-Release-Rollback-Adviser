import React from "react";
import { RiskLevel, CustomerImpactLevel } from "../types";

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  size?: "sm" | "md" | "lg";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = "md" }) => {
  const norm = (level || "").toUpperCase();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";

  if (norm === "LOW") {
    colorClasses = "bg-green-100 text-green-700 border-green-200";
    dotColor = "bg-green-500";
  } else if (norm === "MEDIUM") {
    colorClasses = "bg-amber-100 text-amber-700 border-amber-200";
    dotColor = "bg-amber-500";
  } else if (norm === "HIGH") {
    colorClasses = "bg-orange-100 text-orange-700 border-orange-200";
    dotColor = "bg-orange-500";
  } else if (norm === "CRITICAL") {
    colorClasses = "bg-red-100 text-red-700 border-red-200";
    dotColor = "bg-red-500";
  }

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 font-bold",
    md: "text-xs px-2.5 py-1 font-bold",
    lg: "text-xs px-3 py-1.5 font-bold tracking-wide"
  }[size];

  return (
    <span
      id={`risk-badge-${norm.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded border uppercase font-mono tracking-tight whitespace-nowrap shrink-0 ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className="whitespace-nowrap">{norm} RISK</span>
      {score !== undefined && (
        <span className="font-mono text-[10px] opacity-85 whitespace-nowrap">
          ({score}/100)
        </span>
      )}
    </span>
  );
};

export const ImpactBadge: React.FC<{ level: CustomerImpactLevel | string }> = ({ level }) => {
  const norm = (level || "").toUpperCase();
  let bg = "bg-slate-100 text-slate-700 border-slate-200";

  if (norm === "LOW") bg = "bg-blue-50 text-blue-700 border-blue-200";
  else if (norm === "MEDIUM") bg = "bg-amber-50 text-amber-700 border-amber-200";
  else if (norm === "HIGH") bg = "bg-orange-50 text-orange-700 border-orange-200";
  else if (norm === "CRITICAL") bg = "bg-red-50 text-red-700 border-red-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-tight whitespace-nowrap shrink-0 ${bg}`}>
      {norm} IMPACT
    </span>
  );
};

export const RiskProgressBar: React.FC<{ score: number }> = ({ score }) => {
  let barColor = "bg-green-500";
  if (score >= 60) barColor = "bg-red-500";
  else if (score >= 30) barColor = "bg-amber-500";

  return (
    <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
      <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shrink-0">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">{score}/100</span>
    </div>
  );
};
