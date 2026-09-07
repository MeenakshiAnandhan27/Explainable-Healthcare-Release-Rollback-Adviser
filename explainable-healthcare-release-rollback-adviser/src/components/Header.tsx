import React from "react";
import { Hospital, Release, UserSession } from "../types";
import {
  Hospital as HospitalIcon,
  Shield,
  Clock,
  Cpu,
  AlertOctagon,
  Sparkles,
  Activity
} from "lucide-react";

interface HeaderProps {
  hospitals: Hospital[];
  selectedHospitalId: string;
  onSelectHospital: (id: string) => void;
  selectedRelease: Release | null;
  user: UserSession;
  onSelectCase: (caseId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  selectedRelease,
  user,
  onSelectCase
}) => {
  const currentCaseId = selectedRelease?.release_id;

  return (
    <div className="flex flex-col shrink-0 z-10 select-none">
      {/* Primary Top Header Bar */}
      <header
        id="app-header"
        className="h-14 flex items-center justify-between px-6 bg-slate-900 text-white border-b border-slate-700/80 shadow-xs"
      >
        {/* Left: Brand Logo + Title + Site Selector */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo icon */}
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs ring-1 ring-blue-400/30">
            R
          </div>

          {/* App Title - single line, never wrapped */}
          <h1 className="text-sm font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Healthcare Release Rollback Adviser
          </h1>

          <div className="h-4 w-px bg-slate-700 shrink-0 mx-1 hidden sm:block" />

          {/* Hospital Site Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <HospitalIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap hidden md:inline">
              Site:
            </span>
            <select
              id="hospital-selector"
              value={selectedHospitalId}
              onChange={(e) => onSelectHospital(e.target.value)}
              aria-label="Filter deployments by hospital"
              className="text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer whitespace-nowrap max-w-[220px] md:max-w-none truncate"
            >
              <option value="ALL">All Partner Hospitals (5 Sites)</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.tier})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Advisory Status, Current User, and Safety Badge */}
        <div className="flex items-center gap-3.5 shrink-0">
          {/* Telemetry Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 shrink-0 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-[11px] font-medium text-slate-300">Advisory Mode Active</span>
          </div>

          <div className="hidden lg:block h-4 w-px bg-slate-700 shrink-0" />

          {/* Current Operator User */}
          <div className="flex items-center gap-1.5 text-xs shrink-0 whitespace-nowrap">
            <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider hidden sm:inline">
              User:
            </span>
            <span className="text-xs font-semibold text-blue-400 whitespace-nowrap">
              {user.role === "Release Manager" ? "Admin (Release Manager)" : user.name}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 shrink-0" />

          {/* Safety: Manual Rollback Only Badge */}
          <div
            id="header-safety-badge"
            className="px-2.5 py-1 bg-red-950/70 border border-red-800/80 rounded text-[10px] text-red-300 uppercase font-bold tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
            Safety: Manual Rollback Only
          </div>
        </div>
      </header>

      {/* Secondary Utility Toolbar: Active Telemetry & Unique Benchmark Scenario Controls */}
      <div
        id="sub-header-toolbar"
        className="h-11 flex items-center justify-between px-6 bg-slate-850 bg-[#0f172a] text-xs text-slate-300 border-b border-slate-800 shrink-0 overflow-x-auto gap-4"
      >
        {/* Left: Active Inspected Release Pill */}
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            <Activity className="w-3 h-3 text-blue-400" />
            <span>Telemetry Inspector:</span>
          </div>

          {selectedRelease ? (
            <div
              id="header-active-release"
              className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-700/90 px-2.5 py-0.5 rounded-md shadow-2xs"
            >
              <span className="font-mono text-xs font-bold text-blue-400 whitespace-nowrap">
                {selectedRelease.release_id}
              </span>
              <span className="text-slate-600 font-light">|</span>
              <span className="text-slate-100 font-semibold whitespace-nowrap">
                {selectedRelease.application_name}
              </span>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 whitespace-nowrap">
                {selectedRelease.version}
              </span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-slate-400 hidden md:inline whitespace-nowrap text-[11px]">
                {selectedRelease.hospital_name}
              </span>
            </div>
          ) : (
            <span className="text-slate-500 italic text-[11px]">None Selected</span>
          )}
        </div>

        {/* Right: Unique Custom Benchmark Test Scenarios (Feature 14) */}
        <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap pl-2">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider hidden lg:flex">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Benchmark Scenarios:</span>
          </div>

          {/* Case 1: Latency Spike - Amber/Orange Capsule */}
          <button
            id="case1-quick-btn"
            onClick={() => onSelectCase("REL-CASE-001")}
            className={`group relative flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer border shadow-xs ${
              currentCaseId === "REL-CASE-001"
                ? "bg-amber-500/15 border-amber-400/90 text-amber-200 ring-1 ring-amber-400/60"
                : "bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-850 hover:border-amber-500/60 hover:text-amber-100"
            }`}
            title="Benchmark 1: High Latency (+65%) with normal error rate (0.35%) - Human Review recommended"
          >
            {/* Number chip */}
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0 transition-colors ${
              currentCaseId === "REL-CASE-001"
                ? "bg-amber-400 text-slate-950"
                : "bg-amber-400/20 text-amber-300 group-hover:bg-amber-400/30"
            }`}>
              1
            </span>

            {/* Icon & Label */}
            <div className="flex items-center gap-1.5 font-medium text-[11px] whitespace-nowrap">
              <Clock className={`w-3.5 h-3.5 ${currentCaseId === "REL-CASE-001" ? "text-amber-300" : "text-amber-400"}`} />
              <span className="font-semibold">Latency Spike</span>
            </div>

            {/* Telemetry Tag */}
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-400/15 text-amber-300 rounded border border-amber-400/30 font-bold whitespace-nowrap">
              +65%
            </span>

            {currentCaseId === "REL-CASE-001" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            )}
          </button>

          {/* Case 2: Tech Errors Only - Indigo/Cyan Capsule */}
          <button
            id="case2-quick-btn"
            onClick={() => onSelectCase("REL-CASE-002")}
            className={`group relative flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer border shadow-xs ${
              currentCaseId === "REL-CASE-002"
                ? "bg-cyan-500/15 border-cyan-400/90 text-cyan-200 ring-1 ring-cyan-400/60"
                : "bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-850 hover:border-cyan-500/60 hover:text-cyan-100"
            }`}
            title="Benchmark 2: High Error Rate (8.4%) with low customer impact - Human Review recommended"
          >
            {/* Number chip */}
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0 transition-colors ${
              currentCaseId === "REL-CASE-002"
                ? "bg-cyan-400 text-slate-950"
                : "bg-cyan-400/20 text-cyan-300 group-hover:bg-cyan-400/30"
            }`}>
              2
            </span>

            {/* Icon & Label */}
            <div className="flex items-center gap-1.5 font-medium text-[11px] whitespace-nowrap">
              <Cpu className={`w-3.5 h-3.5 ${currentCaseId === "REL-CASE-002" ? "text-cyan-300" : "text-cyan-400"}`} />
              <span className="font-semibold">Tech Errors</span>
            </div>

            {/* Telemetry Tag */}
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-400/15 text-cyan-300 rounded border border-cyan-400/30 font-bold whitespace-nowrap">
              8.4% Err
            </span>

            {currentCaseId === "REL-CASE-002" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            )}
          </button>

          {/* Case 3: Critical Clinical Impact - Crimson/Alert Capsule */}
          <button
            id="case3-quick-btn"
            onClick={() => onSelectCase("REL-CASE-003")}
            className={`group relative flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer border shadow-xs ${
              currentCaseId === "REL-CASE-003"
                ? "bg-red-500/25 border-red-400 text-red-100 ring-1 ring-red-400/80 shadow-red-950/50"
                : "bg-red-950/60 border-red-800/80 text-red-200 hover:bg-red-900/70 hover:border-red-600 hover:text-white"
            }`}
            title="Benchmark 3: Low Technical Errors with Critical Customer Impact (-42% medication orders) - ROLLBACK RECOMMENDED"
          >
            {/* Number chip with pulse beacon */}
            <span className="relative w-4 h-4 rounded flex items-center justify-center text-[10px] font-mono font-bold bg-red-500 text-white shrink-0">
              3
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            </span>

            {/* Icon & Label */}
            <div className="flex items-center gap-1.5 font-bold text-[11px] whitespace-nowrap text-red-200 group-hover:text-white">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span>Critical Clinical</span>
            </div>

            {/* Telemetry Tag */}
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-red-500/30 text-red-200 rounded border border-red-400/40 font-bold uppercase tracking-tight whitespace-nowrap">
              Rollback Advised
            </span>

            {currentCaseId === "REL-CASE-003" && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
