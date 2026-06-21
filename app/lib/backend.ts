export const getBackendUrl = (): string => {
  const mode = (process.env.NEXT_PUBLIC_BACKEND_MODE ?? "dev").toLowerCase();
  if (mode === "local") {
    return process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL ?? "";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL_DEV ?? "";
};
