import axios, { AxiosError, CanceledError } from "axios";
import { toast } from "sonner";
import { clearSession, getToken } from "@/lib/session";
import { translateServerMessage } from "@/lib/server-messages";
import type { ApiError } from "@/types/api";

declare module "axios" {
  interface AxiosRequestConfig {
    silent?: boolean;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const PUBLIC_PATHS = ["/login", "/register"];
const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register"];

api.interceptors.request.use((config) => {
  const token = getToken();

  if (!token && !PUBLIC_ENDPOINTS.some((endpoint) => config.url?.startsWith(endpoint))) {
    return Promise.reject(new CanceledError("no session"));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const message = response.data?._message;

    if (message) {
      toast.success(translateServerMessage(message));
    }

    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?._message ?? error.message;
    const silent = Boolean(error.config?.silent);

    if (status === 401) {
      clearSession();

      const onPublicPage = PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));

      if (!onPublicPage) {
        if (!silent) {
          toast.error(translateServerMessage(message));
        }

        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";

        return Promise.reject(error);
      }
    }

    const hasFieldErrors = Boolean(error.response?.data?.errors?.length);

    if (!silent && !hasFieldErrors) {
      toast.error(translateServerMessage(message));
    }

    return Promise.reject(error);
  },
);

export default api;
