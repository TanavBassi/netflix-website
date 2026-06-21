"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBackendMode, setBackendMode, getBackendUrl, BackendMode } from "@/app/config/backend";
import { apiPost } from "@/app/api/client";
import { themeColors } from "@/app/theme/colors";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<BackendMode>("dev");

  // Load initial mode on component mount (client-only)
  useEffect(() => {
    setMode(getBackendMode());
  }, []);

  const handleModeChange = (newMode: BackendMode) => {
    setBackendMode(newMode);
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Use the helper apiPost which uses axios with dynamic backend URL
      const data = await apiPost("/auth/login", { email, password });
      
      // Store token
      if (data && data.token) {
        localStorage.setItem("admin_token", data.token);
      } else if (data && data.accessToken) {
        localStorage.setItem("admin_token", data.accessToken);
      } else {
        // Fallback if token is nested or key is different
        localStorage.setItem("admin_token", JSON.stringify(data));
      }
      
      router.push("/dashboard");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Login failed";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{ backgroundColor: themeColors.neutral.DEFAULT }}
    >
      {/* Mode Selector Tab Group */}
      <div 
        className="mb-6 flex rounded-lg p-1 border"
        style={{ 
          backgroundColor: themeColors.tertiary.DEFAULT,
          borderColor: themeColors.secondary.DEFAULT
        }}
      >
        <button
          type="button"
          onClick={() => handleModeChange("dev")}
          className="rounded px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
          style={{
            backgroundColor: mode === "dev" ? themeColors.primary.DEFAULT : "transparent",
            color: mode === "dev" ? themeColors.neutral.DEFAULT : themeColors.text.secondary,
          }}
        >
          Dev Server
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("local")}
          className="rounded px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
          style={{
            backgroundColor: mode === "local" ? themeColors.primary.DEFAULT : "transparent",
            color: mode === "local" ? themeColors.neutral.DEFAULT : themeColors.text.secondary,
          }}
        >
          Local Host
        </button>
      </div>

      <div 
        className="w-full max-w-md rounded-2xl p-8 border shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-cyan-500/10"
        style={{ 
          backgroundColor: themeColors.secondary.DEFAULT,
          borderColor: "rgba(0, 191, 255, 0.15)"
        }}
      >
        {/* Decorative Top Accent Line using the Primary cyan color */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: themeColors.primary.DEFAULT }}
        />

        <div className="mb-6 text-center">
          <h1 
            className="text-3xl font-extrabold tracking-tight mb-2"
            style={{ color: themeColors.text.primary }}
          >
            Cinematic Executive
          </h1>
          <p 
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: themeColors.primary.DEFAULT }}
          >
            Admin Panel Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label 
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: themeColors.text.secondary }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@netflix.com"
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-all duration-200 border bg-slate-900/50"
              style={{ 
                color: themeColors.text.primary,
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label 
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: themeColors.text.secondary }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-all duration-200 border bg-slate-900/50 pr-12"
                style={{ 
                  color: themeColors.text.primary,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-lg transition-colors hover:text-white"
                style={{ color: themeColors.text.secondary }}
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-950/40 border border-red-500/20 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{
              backgroundColor: themeColors.primary.DEFAULT,
              color: themeColors.neutral.DEFAULT,
            }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] uppercase tracking-wider" style={{ color: themeColors.text.muted }}>
          Connected to: <span className="font-semibold" style={{ color: themeColors.primary.DEFAULT }}>{getBackendUrl()}</span>
        </div>
      </div>
    </section>
  );
}
