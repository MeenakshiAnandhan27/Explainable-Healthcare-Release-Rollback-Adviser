import React from "react";
import {
  LayoutDashboard,
  Layers,
  FileText,
  Sliders,
  FlaskConical,
  History,
  CheckSquare,
  BookOpen,
  UserCheck,
  Shield
} from "lucide-react";
import { UserSession } from "../types";

export type NavPage =
  | "dashboard"
  | "releases"
  | "release-detail"
  | "rules"
  | "experiment"
  | "analysis"
  | "decisions"
  | "validation"
  | "docs";

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  user: UserSession;
  onSwitchRole: () => void;
  selectedReleaseId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  user,
  onSwitchRole,
  selectedReleaseId
}) => {
  const mainOperations: Array<{ id: NavPage; label: string; icon: React.ElementType; badge?: string }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "releases", label: "Active Releases", icon: Layers, badge: "512" },
    { id: "release-detail", label: "Advisory Evidence", icon: FileText, badge: selectedReleaseId ? "Active" : undefined },
    { id: "rules", label: "Risk Rule Config", icon: Sliders, badge: user.role === "Release Manager" ? "Edit" : undefined }
  ];

  const analysisItems: Array<{ id: NavPage; label: string; icon: React.ElementType; badge?: string }> = [
    { id: "experiment", label: "A/B Experiments", icon: FlaskConical },
    { id: "decisions", label: "Audit Logs", icon: History },
    { id: "validation", label: "Validation Review", icon: CheckSquare },
    { id: "docs", label: "Architecture Specs", icon: BookOpen }
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-800 text-slate-300 flex flex-col border-r border-slate-700 shrink-0 select-none h-full overflow-hidden"
    >
      {/* Navigation Links */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-2 tracking-wider">
          Main Operations
        </div>
        {mainOperations.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                isActive
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900/60 text-slate-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div
          id="nav-analysis-header"
          onClick={() => onNavigate("experiment")}
          className="pt-4 pb-1 text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 px-3 py-2 tracking-wider cursor-pointer flex items-center justify-between group transition-colors"
          title="Analysis: A/B Experiments, Audit Logs, Validation & Specs"
        >
          <span>Analysis</span>
          <span className="text-[9px] text-slate-600 group-hover:text-slate-400 font-mono">4 views</span>
        </div>
        {analysisItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                isActive
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-900/60 text-slate-400">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operator & System Status matching Design HTML */}
      <div className="p-4 border-t border-slate-700 space-y-3 bg-slate-850">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
            System Status
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Telemetry: Active</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">512 pkts</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 truncate">
              <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate text-[11px] font-medium">{user.role}</span>
            </div>
            <button
              onClick={onSwitchRole}
              aria-label="Switch operator role"
              className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer shrink-0 ml-1"
            >
              Switch
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
