"use client";
import React, { useState } from "react";
import { UserCheck, UserX, Shield } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  isBlocked?: boolean;
  name?: string;
  createdAt?: string;
}

interface SubscriptionsProps {
  users: User[];
  onToggleBlock: (id: string, isCurrentlyBlocked: boolean) => void;
  onChangeRole: (id: string, newRole: string) => void;
}

export default function Subscriptions({ users, onToggleBlock, onChangeRole }: SubscriptionsProps) {
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter(user => {
    if (roleFilter === "all") return true;
    return user.role.toLowerCase() === roleFilter.toLowerCase();
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Filters and Search Bar */}
      <div className="flex justify-between items-center bg-slate-900/30 p-4 border border-white/5 rounded-2xl">
        <h2 className="text-lg font-bold text-white">Users & Subscription Tiers</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold uppercase">Filter Role:</label>
          <select
            className="rounded-lg p-2 bg-slate-950 border border-white/10 text-xs focus:outline-none text-slate-300"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="SUBSCRIBER">Subscribers</option>
            <option value="ADMIN">Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-900/10">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 border-b border-white/5 font-semibold">
              <th className="p-4">User</th>
              <th className="p-4">Role Tier</th>
              <th className="p-4">Account Status</th>
              <th className="p-4">Change Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{user.name || user.email.split("@")[0]}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Shield size={12} className={user.role === "SUPER_ADMIN" ? "text-cyan-400" : user.role === "ADMIN" ? "text-indigo-400" : "text-slate-400"} />
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                      user.isBlocked ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      className="rounded p-1 bg-slate-950 border border-white/5 text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500/50"
                      value={user.role}
                      onChange={e => onChangeRole(user.id, e.target.value)}
                    >
                      <option value="SUBSCRIBER">Subscriber Plan</option>
                      <option value="ADMIN">Admin Panel</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onToggleBlock(user.id, !!user.isBlocked)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-[10px] uppercase transition-all ${
                        user.isBlocked 
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {user.isBlocked ? <UserCheck size={12} /> : <UserX size={12} />}
                      {user.isBlocked ? "Unblock" : "Block User"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No registered users match selected role filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
