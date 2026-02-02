import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";

// Constants
const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const API_TIMEOUT = 10000;
const LOGIN_PATH = "/login";

// API Base URL Configuration
const getApiBaseUrl = (): string => {
  const useMSW = process.env.NEXT_PUBLIC_USE_MSW === "true";
  
  if (useMSW) {
    return typeof window === "undefined"
      ? "http://localhost:3000/api" // Server Side: absolute path required for MSW
      : "/api"; // Client Side: relative path
  }
  
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
};

// Get access token from session
const getAccessToken = async (): Promise<string | undefined> => {
  if (typeof window === "undefined") {
    // Server Side: dynamic import to avoid circular dependency
    const { auth } = await import("../auth");
    const session = await auth();
    return session?.user?.accessToken;
  }
  
  // Client Side: get session from next-auth/react
  const session = await getSession();
  return session?.user?.accessToken;
};

// Request Interceptor: Add authentication token
const setupRequestInterceptor = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Skip if token already exists in headers (e.g., manual injection for login)
      if (config.headers?.Authorization) {
        return config;
      }

      const token = await getAccessToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: unknown) => Promise.reject(error)
  );
};

// Response Interceptor: Handle errors
const setupResponseInterceptor = (client: AxiosInstance): void => {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      const status = error.response?.status;

      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          if (typeof window !== "undefined") {
            await signOut({ redirectTo: LOGIN_PATH });
          }
          break;

        case HTTP_STATUS.FORBIDDEN:
          console.error("Access denied");
          break;

        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          console.error("Server error");
          break;
      }

      return Promise.reject(error);
    }
  );
};

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Setup interceptors
setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient);

// API methods
export const api = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient.get<T>(url, config).then((response) => response.data);
  },

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient
      .post<T>(url, data, config)
      .then((response) => response.data);
  },

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient
      .put<T>(url, data, config)
      .then((response) => response.data);
  },

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient
      .patch<T>(url, data, config)
      .then((response) => response.data);
  },

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient.delete<T>(url, config).then((response) => response.data);
  },
};

export default apiClient;