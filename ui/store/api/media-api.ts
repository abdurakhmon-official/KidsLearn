import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type { ListQuery, MediaAsset, MediaFilters, Paged, RemoveMediaResult } from "@/types/api";
import type { RegisterMediaInput } from "@/types/input/RegisterMediaInput";

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    mediaPaginated: build.query<Paged<MediaAsset>, ListQuery & MediaFilters>({
      query: (params) => ({ url: "/media/paginated", params: buildListParams(params) }),
      providesTags: ["Media"],
    }),

    /** S3 ga yuklash tugagach registrga yozadi. */
    registerMedia: build.mutation<MediaAsset, RegisterMediaInput>({
      query: (data) => ({ url: "/media", method: "POST", data }),
      invalidatesTags: ["Media", "Dashboard"],
    }),

    /** Registrdan o'chiradi va S3 obyekt kalitini qaytaradi. */
    removeMedia: build.mutation<RemoveMediaResult, string>({
      query: (id) => ({ url: `/media/${id}`, method: "DELETE" }),
      invalidatesTags: ["Media", "Dashboard"],
    }),
  }),
});

export const { useMediaPaginatedQuery, useRegisterMediaMutation, useRemoveMediaMutation } = mediaApi;
