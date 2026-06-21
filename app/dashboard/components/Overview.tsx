"use client";
import React from "react";
import { Users, CheckCircle, Globe, Activity } from "lucide-react";
import { themeColors } from "@/app/theme/colors";

interface OverviewProps {
  stats: {
    totalUsers: number;
    activeSubscribers: number;
    freeUsers: number;
    liveSessions: number;
  };
  audits: Array<{
    id: number | string;
    action: string;
    details: string;
    time: string;
    user: string;
  }>;
}

export default function Overview({ stats, audits }: OverviewProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          className="p-6 rounded-2xl border bg-slate-900/30"
          style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><Users size={22} /></span>
            <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full font-bold">Total</span>
          </div>
          <h3 className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Registered User Nodes</p>
        </div>

        <div 
          className="p-6 rounded-2xl border bg-slate-900/30"
          style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><CheckCircle size={22} /></span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Paid</span>
          </div>
          <h3 className="text-3xl font-bold">{stats.activeSubscribers.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Active Premium Subscribers</p>
        </div>

        <div 
          className="p-6 rounded-2xl border bg-slate-900/30"
          style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><Globe size={22} /></span>
            <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-bold">Free</span>
          </div>
          <h3 className="text-3xl font-bold">{stats.freeUsers.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Tier-0 Free Accounts</p>
        </div>

        <div 
          className="p-6 rounded-2xl border bg-slate-900/30"
          style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Activity size={22} /></span>
            <span className="text-[10px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-bold">Live</span>
          </div>
          <h3 className="text-3xl font-bold">{stats.liveSessions.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Logged In Active Sessions</p>
        </div>
      </div>

      {/* Quick Analytics & Integration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Media Hub Summary */}
        <div 
          className="p-6 rounded-2xl border bg-slate-900/20 space-y-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
        >
          <h2 className="text-lg font-bold text-white">Active Media Pipelines</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center font-bold text-xs">T</span>
                <div>
                  <p className="text-xs font-bold text-slate-200">TMDB (Movies Meta API)</p>
                  <p className="text-[10px] text-slate-400">Endpoint Status: Healthy</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">CONNECTED</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs">J</span>
                <div>
                  <p className="text-xs font-bold text-slate-200">JioSaavn API Gateway</p>
                  <p className="text-[10px] text-slate-400">Endpoint Status: Operational</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Logs quick panel */}
        <div 
          className="p-6 rounded-2xl border bg-slate-900/20 space-y-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
        >
          <h2 className="text-lg font-bold text-white">Recent Audit Logs</h2>
          <div className="space-y-2.5">
            {audits && audits.length > 0 ? (
              audits.slice(0, 3).map(audit => (
                <div key={audit.id} className="text-xs flex justify-between items-center border-b border-white/5 pb-2">
                  <div>
                    <span className="text-cyan-400 font-semibold uppercase text-[10px] block">{audit.action}</span>
                    <span className="text-slate-300">{audit.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{audit.time}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No recent logs recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
