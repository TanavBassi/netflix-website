"use client";
import React from "react";
import { RefreshCw } from "lucide-react";

interface AuditItem {
  id: number | string;
  action: string;
  details: string;
  time: string;
  user: string;
}

interface LogsProps {
  audits: AuditItem[];
  onResetLogs: () => void;
}

export default function Logs({ audits, onResetLogs }: LogsProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Diagnostic Audit Logging</h2>
          <p className="text-xs text-slate-400">Security audits, subscription alterations, and admin activity monitoring.</p>
        </div>
        <button 
          onClick={onResetLogs}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 text-xs font-bold hover:bg-white/5 transition-all text-slate-300"
        >
          <RefreshCw size={12} /> Reset Log View
        </button>
      </div>

      <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-900/10">
        <div className="divide-y divide-white/5">
          {audits.map((audit) => (
            <div key={audit.id} className="p-4 hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded font-extrabold text-[8px] uppercase tracking-wider bg-slate-800 text-slate-300">
                    {audit.action}
                  </span>
                  <span className="text-[10px] text-slate-500">{audit.time}</span>
                </div>
                <p className="text-xs font-medium text-slate-200">{audit.details}</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-950/40 px-2.5 py-1 rounded-md border border-white/5">
                {audit.user}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
