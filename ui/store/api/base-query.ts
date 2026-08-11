import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import api from "@/lib/axios";
import type { ApiError, ApiResponse } from "@/types/api";

export type QueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: Record<string, unknown>;
};

export const axiosBaseQuery = (): BaseQueryFn<QueryArgs, unknown, ApiError> => {
  return async ({ url, method = "GET", data, params }) => {
    try {
      const response = await api<ApiResponse<unknown>>({ url, method, data, params });

      // logout / password kabi endpointlar `data` qaytarmaydi — RTK Query
      // `undefined` ni na natija, na xato deb hisoblaydi, shuning uchun `null`.
      return { data: response.data?.data ?? null };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;

      return {
        error: axiosError.response?.data ?? {
          success: false,
          _message: axiosError.message,
        },
      };
    }
  };
};
