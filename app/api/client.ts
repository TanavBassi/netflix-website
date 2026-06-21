import axios from "axios";
import { getBackendUrl } from "@/app/config/backend";

// Create custom axios instance
const api = axios.create({
  // Since baseURL needs to be dynamic based on the active mode (local/dev),
  // we use a request interceptor to dynamically rewrite the baseURL before sending the request.
});

// Request interceptor to set dynamic baseURL and add Bearer Token
api.interceptors.request.use(
  (config) => {
    // Dynamically retrieve the current baseURL based on mode
    config.baseURL = getBackendUrl();

    // Check if running on the client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper methods for GET and POST
export const apiGet = async <T = any>(url: string, params?: any): Promise<T> => {
  const response = await api.get<T>(url, { params });
  return response.data;
};

export const apiPost = async <T = any>(url: string, data?: any): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

export default api;
