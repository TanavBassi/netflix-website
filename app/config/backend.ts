export type BackendMode = "dev" | "local";

// Config state storing the active mode in memory (resets on full reload, but can be updated at runtime)
let activeMode: BackendMode = (process.env.NEXT_PUBLIC_BACKEND_MODE as BackendMode) || "local";

export const getBackendMode = (): BackendMode => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("admin_backend_mode") as BackendMode;
    if (stored === "dev" || stored === "local") {
      activeMode = stored;
    }
  }
  return activeMode;
};

export const setBackendMode = (mode: BackendMode) => {
  activeMode = mode;
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_backend_mode", mode);
    // Log the changed mode and URL to the console
    const newUrl = mode === "local"
      ? (process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL || "http://localhost:5000")
      : (process.env.NEXT_PUBLIC_BACKEND_URL_DEV || "https://netflixbackend-dpoy.onrender.com");
    console.log(`[Backend Configuration] Mode changed to: ${mode.toUpperCase()} | URL: ${newUrl}`);
  }
};

export const getBackendUrl = (): string => {
  const mode = getBackendMode();
  if (mode === "local") {
    return process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL || "http://localhost:5000";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL_DEV || "https://netflixbackend-dpoy.onrender.com";
};
