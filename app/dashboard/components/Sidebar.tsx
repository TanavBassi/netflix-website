"use client";
import React from "react";
import { LogOut, Activity, CreditCard, Film, ShieldAlert, PlayCircle } from "lucide-react";
import { themeColors } from "@/app/theme/colors";

interface SidebarProps {
  activeTab: "overview" | "subscriptions" | "media" | "audits" | "player";
  setActiveTab: (tab: "overview" | "subscriptions" | "media" | "audits" | "player") => void;
  handleLogout: () => void;
  backendUrl: string;
}

export default function Sidebar({ activeTab, setActiveTab, handleLogout, backendUrl }: SidebarProps) {
  return (
    <aside 
      className="w-64 border-r flex flex-col justify-between p-6 shrink-0"
      style={{ 
        backgroundColor: themeColors.tertiary.DEFAULT,
        borderColor: "rgba(0, 191, 255, 0.08)"
      }}
    >
      <div className="space-y-8">
        {/* Logo Heading */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/20"
            style={{ backgroundColor: themeColors.primary.DEFAULT, color: themeColors.neutral.DEFAULT }}
          >
            N
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider leading-none">MINI NETFLIX</h2>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">Super Admin</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
              activeTab === "overview" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity size={18} />
            Overview Stats
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
              activeTab === "subscriptions" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard size={18} />
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
              activeTab === "media" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <Film size={18} />
            Media Imports
          </button>
          <button
            onClick={() => setActiveTab("audits")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
              activeTab === "audits" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert size={18} />
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab("player")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
              activeTab === "player" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <PlayCircle size={18} />
            Stream Player
          </button>
        </nav>
      </div>

      {/* User profile / Logout */}
      <div className="pt-4 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs border border-white/10">SA</div>
          <div>
            <p className="text-xs font-bold">Root Admin</p>
            <p className="text-[10px] text-slate-500 truncate max-w-[130px]">{backendUrl}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all"
        >
          <LogOut size={14} />
          Logout System
        </button>
      </div>
    </aside>
  );
}
