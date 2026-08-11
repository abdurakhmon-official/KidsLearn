import { baseApi } from "./base-api";
import type { AwardsResponse, ProgressSummary } from "@/types/api";

export const progressApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    myProgress: build.query<ProgressSummary, void>({
      query: () => ({ url: "/progress/me" }),
      providesTags: ["Progress"],
    }),

    myAwards: build.query<AwardsResponse, void>({
      query: () => ({ url: "/progress/me/awards" }),
      providesTags: ["Award"],
    }),
  }),
});

export const { useMyProgressQuery, useMyAwardsQuery } = progressApi;
