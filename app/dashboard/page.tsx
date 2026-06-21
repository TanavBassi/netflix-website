"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { themeColors } from "@/app/theme/colors";
import { getBackendUrl } from "@/app/config/backend";
import { apiGet, apiPost } from "@/app/api/client";
import axios from "axios";

// Import modular components
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Subscriptions from "./components/Subscriptions";
import Media from "./components/Media";
import Logs from "./components/Logs";
import Player from "./components/Player";

// Typings
interface User {
  id: string;
  email: string;
  role: string;
  isBlocked?: boolean;
  name?: string;
  createdAt?: string;
}

interface AuditItem {
  id: number | string;
  action: string;
  details: string;
  time: string;
  user: string;
}

interface CatalogItem {
  id: string;
  title: string;
  type: string;
  genre: string;
  description?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  mediaUrl?: string;
  duration?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
}



export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions" | "media" | "audits" | "player">("overview");
  const [backendUrl, setBackendUrl] = useState("");

  // States
  const [users, setUsers] = useState<User[]>([]);
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [importedContent, setImportedContent] = useState<CatalogItem[]>([]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    freeUsers: 0,
    liveSessions: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    // Fetch URL from configuration helper
    setBackendUrl(getBackendUrl());

    // Fetch initial metrics & data from backend API
    fetchData();
  }, [router]);

  const fetchData = async () => {
    // 1. Get stats / admin analytics
    try {
      const analytics = await apiGet("/admin/analytics");
      if (analytics) {
        setStats({
          totalUsers: analytics.totalUsers ?? 0,
          activeSubscribers: analytics.activeSubscribers ?? analytics.subscriberCount ?? 0,
          freeUsers: analytics.freeUsers ?? ((analytics.totalUsers ?? 0) - (analytics.activeSubscribers ?? 0)),
          liveSessions: analytics.liveSessions ?? analytics.activeSessions ?? 0
        });
      }
    } catch (err) {
      console.log("[Dashboard API] Error fetching metrics (backend /admin/analytics is offline)");
    }

    // 2. Get user list
    try {
      const usersData = await apiGet("/admin/users");
      if (usersData && Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.log("[Dashboard API] Error fetching users list");
      setUsers([]);
    }

    // 3. Get log records
    try {
      const logsData = await apiGet("/notifications/admin/logs");
      if (logsData && Array.isArray(logsData)) {
        setAudits(normalizeLogs(logsData));
      } else {
        setAudits([]);
      }
    } catch (err) {
      console.log("[Dashboard API] Error fetching system logs");
      setAudits([]);
    }

    // 4. Get active database content
    try {
      const contentData = await apiGet("/admin/content");
      if (contentData && Array.isArray(contentData)) {
        setImportedContent(contentData);
      } else {
        setImportedContent([]);
      }
    } catch (err) {
      console.log("[Dashboard API] Error fetching catalog content");
      setImportedContent([]);
    }
  };

  const normalizeLogs = (logs: any[]): AuditItem[] => {
    return logs.map((log, idx) => ({
      id: log.id || idx,
      action: log.action || log.type || "AUDIT",
      details: log.details || log.message || JSON.stringify(log),
      time: log.time || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : "Recent"),
      user: log.user || log.adminEmail || "Admin"
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  // 1. Toggle user block status
  const handleToggleBlock = async (id: string, isCurrentlyBlocked: boolean) => {
    const endpoint = isCurrentlyBlocked 
      ? `/admin/users/${id}/unblock` 
      : `/admin/users/${id}/block`;

    try {
      await apiPost(endpoint);
      setUsers(prev => prev.map(user => {
        if (user.id === id) {
          return { ...user, isBlocked: !isCurrentlyBlocked };
        }
        return user;
      }));

      // Post audit activity
      logLocalAudit(
        "BLOCK_TOGGLE", 
        `${isCurrentlyBlocked ? "Unblocked" : "Blocked"} user node ID: ${id}`
      );
    } catch (err: any) {
      console.log("[Dashboard API] Block action failed. Simulating offline block change.");
      setUsers(prev => prev.map(user => {
        if (user.id === id) {
          return { ...user, isBlocked: !isCurrentlyBlocked };
        }
        return user;
      }));
    }
  };

  // 2. Change user role
  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      // Axios request to PATCH /admin/users/:id/role with payload { role }
      const activeBackend = getBackendUrl();
      const token = localStorage.getItem("admin_token");
      await axios.patch(`${activeBackend}/admin/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(prev => prev.map(user => {
        if (user.id === id) {
          return { ...user, role: newRole };
        }
        return user;
      }));

      logLocalAudit("ROLE_CHANGE", `Updated user ID: ${id} role to ${newRole}`);
    } catch (err) {
      console.log("[Dashboard API] Role patch failed. Simulating offline update.");
      setUsers(prev => prev.map(user => {
        if (user.id === id) {
          return { ...user, role: newRole };
        }
        return user;
      }));
    }
  };

  // 3. Search Movies on TMDB via backend
  const handleSearchTMDB = async (query: string): Promise<any[]> => {
    try {
      // GET /media/movies/search?query=...
      const data = await apiGet("/media/movies/search", { query });
      if (data && data.success && data.data && Array.isArray(data.data.results)) {
        return data.data.results;
      }
      if (data && data.data && Array.isArray(data.data.results)) {
        return data.data.results;
      }
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
      if (data && Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.log("[Dashboard API] Live TMDB search failed.");
      return [];
    }
  };

  // 4. Search Songs on JioSaavn via backend
  const handleSearchJioSaavn = async (query: string): Promise<any[]> => {
    try {
      // GET /media/songs/search?query=...
      const data = await apiGet("/media/songs/search", { query });
      if (data && data.success && data.data && Array.isArray(data.data.results)) {
        return data.data.results;
      }
      if (data && data.data && Array.isArray(data.data.results)) {
        return data.data.results;
      }
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
      if (data && Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.log("[Dashboard API] Live JioSaavn search failed.");
      return [];
    }
  };

  // 5. Import content to Database
  const handleImportContent = async (payload: any) => {
    try {
      // POST /admin/content
      const result = await apiPost("/admin/content", payload);
      setImportedContent(prev => [result || payload, ...prev]);
      logLocalAudit("CONTENT_IMPORT", `Imported content to catalog: "${payload.title}"`);
    } catch (err) {
      console.log("[Dashboard API] Content import failed. Simulating offline entry.");
      const mockResult = { id: "c-" + Date.now(), ...payload };
      setImportedContent(prev => [mockResult, ...prev]);
    }
  };

  // 5.5. Upload custom movie / song file & register content
  const handleUploadContent = async (formData: FormData) => {
    try {
      // POST /admin/content/upload
      const result = await apiPost("/admin/content/upload", formData);
      setImportedContent(prev => [result || {
        id: "c-" + Date.now(),
        title: formData.get("title") as string,
        type: formData.get("type") as string,
        genre: formData.get("genre") as string,
        description: formData.get("description") as string,
        duration: parseInt(formData.get("duration") as string || "0", 10),
      }, ...prev]);
      logLocalAudit("CONTENT_UPLOAD", `Uploaded custom content: "${formData.get("title")}"`);
      return result;
    } catch (err) {
      console.log("[Dashboard API] Content upload failed. Simulating offline upload entry.");
      const mockResult = {
        id: "c-" + Date.now(),
        title: (formData.get("title") as string) || "Uploaded Content",
        type: (formData.get("type") as string) || "MOVIE",
        genre: (formData.get("genre") as string) || "Other",
        description: (formData.get("description") as string) || "",
        duration: parseInt((formData.get("duration") as string) || "0", 10),
        isFeatured: formData.get("isFeatured") === "true",
        isPublished: formData.get("isPublished") !== "false",
      };
      setImportedContent(prev => [mockResult, ...prev]);
      logLocalAudit("CONTENT_UPLOAD_OFFLINE", `Simulated content upload for: "${mockResult.title}"`);
      return mockResult;
    }
  };

  // 6. Delete Content item
  const handleDeleteContent = async (id: string) => {
    try {
      // DELETE /admin/content/:id
      const activeBackend = getBackendUrl();
      const token = localStorage.getItem("admin_token");
      await axios.delete(`${activeBackend}/admin/content/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setImportedContent(prev => prev.filter(c => c.id !== id));
      logLocalAudit("CONTENT_DELETE", `Removed content node ID: ${id}`);
    } catch (err) {
      console.log("[Dashboard API] Delete content call failed. Simulating offline removal.");
      setImportedContent(prev => prev.filter(c => c.id !== id));
    }
  };

  const logLocalAudit = (action: string, details: string) => {
    const newAudit = {
      id: Date.now(),
      action,
      details,
      time: "Just Now",
      user: "Admin (System)"
    };
    setAudits(prev => [newAudit, ...prev]);
  };

  const handleResetLogs = () => {
    setAudits([]);
  };

  return (
    <section 
      className="flex min-h-screen text-white font-sans"
      style={{ backgroundColor: themeColors.neutral.DEFAULT }}
    >
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
        backendUrl={backendUrl}
      />

      {/* Main Content Pane */}
      <main className="flex-1 p-8 overflow-y-auto space-y-8 animate-fadeIn">
        {/* Header bar */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">System Management</h1>
            <p className="text-xs text-slate-400">Control Netflix Media, Subscriptions, and API gateways.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/40 p-2.5 border border-white/5 rounded-xl text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway: <strong className="text-white uppercase font-bold">{backendUrl.includes("localhost") ? "Local Engine" : "Cloud Production"}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab contents */}
        {activeTab === "overview" && (
          <Overview stats={stats} audits={audits} />
        )}

        {activeTab === "subscriptions" && (
          <Subscriptions 
            users={users}
            onToggleBlock={handleToggleBlock}
            onChangeRole={handleChangeRole}
          />
        )}

        {activeTab === "media" && (
          <Media 
            importedContent={importedContent}
            onImportContent={handleImportContent}
            onDeleteContent={handleDeleteContent}
            onSearchTMDB={handleSearchTMDB}
            onSearchJioSaavn={handleSearchJioSaavn}
            onUploadContent={handleUploadContent}
          />
        )}

        {activeTab === "audits" && (
          <Logs audits={audits} onResetLogs={handleResetLogs} />
        )}

        {activeTab === "player" && (
          <Player importedContent={importedContent} onSearchTMDB={handleSearchTMDB} />
        )}
      </main>
    </section>
  );
}
