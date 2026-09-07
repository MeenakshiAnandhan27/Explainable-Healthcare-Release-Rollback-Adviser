import React, { useState } from "react";
import { UserSession } from "../types";
import { loginUser } from "../services/api";
import { ShieldCheck, User, X } from "lucide-react";

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onUserChanged: (user: UserSession) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSelectRole = async (username: string, pass: string) => {
    setLoading(true);
    setError("");
    try {
      const user = await loginUser(username, pass);
      onUserChanged(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to switch role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Switch Operator Persona (RBAC Testing)
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600">
            Select an authorized persona to test role-based permissions:
          </p>

          {/* Option 1: Analyst */}
          <div
            onClick={() => handleSelectRole("analyst", "analyst123")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              currentUser.role === "SOC / Operations Analyst"
                ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-400"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-900">SOC / Operations Analyst</span>
              </div>
              {currentUser.role === "SOC / Operations Analyst" && (
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Authorizes releases, views telemetry evidence, submits audit decisions and overrides. View-only access to risk rules.
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-400">
              Demo login: analyst / analyst123
            </div>
          </div>

          {/* Option 2: Release Manager */}
          <div
            onClick={() => handleSelectRole("manager", "manager123")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              currentUser.role === "Release Manager"
                ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-400"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-slate-900">Release Manager</span>
              </div>
              {currentUser.role === "Release Manager" && (
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Full administrator privileges: edit live risk rules (R1–R6), modify thresholds and weights in-place, and record executive release determinations.
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-400">
              Demo login: manager / manager123
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
