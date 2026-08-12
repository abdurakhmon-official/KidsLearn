import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type { ListQuery, MediaAsset, MediaFilters, Paged, RemoveMediaResult, UploadFolder } from "@/types/api";
import type { RegisterMediaInput } from "@/types/input/RegisterMediaInput";

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    mediaPaginated: build.query<Paged<MediaAsset>, ListQuery & MediaFilters>({
      query: (params) => ({ url: "/media/paginated", params: buildListParams(params) }),
      providesTags: ["Media"],
    }),

    uploadMedia: build.mutation<MediaAsset, { folder: UploadFolder; file: File }>({
      query: ({ folder, file }) => {
        const data = new FormData();
        data.append("file", file);

        return { url: `/s3/${folder}/upload`, method: "POST", data };
      },
      invalidatesTags: ["Media", "Dashboard"],
    }),

    registerMedia: build.mutation<MediaAsset, RegisterMediaInput>({
      query: (data) => ({ url: "/media", method: "POST", data }),
      invalidatesTags: ["Media", "Dashboard"],
    }),

    removeMedia: build.mutation<RemoveMediaResult, string>({
      query: (id) => ({ url: `/media/${id}`, method: "DELETE" }),
      invalidatesTags: ["Media", "Dashboard"],
    }),
  }),
});

export const {
  useMediaPaginatedQuery,
  useUploadMediaMutation,
  useRegisterMediaMutation,
  useRemoveMediaMutation,
} = mediaApi;
