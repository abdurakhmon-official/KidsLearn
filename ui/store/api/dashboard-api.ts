import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type { AdminDashboard, LeaderboardFilters, LeaderboardRow, ParentDashboard } from "@/types/api";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    parentDashboard: build.query<ParentDashboard, { childId?: string } | void>({
      query: (params) => ({ url: "/dashboard/parent", params: buildListParams(params ?? {}) }),
      providesTags: ["Dashboard"],
    }),

    adminDashboard: build.query<AdminDashboard, void>({
      query: () => ({ url: "/dashboard/admin" }),
      providesTags: ["Dashboard"],
    }),

    leaderboard: build.query<LeaderboardRow[], LeaderboardFilters | void>({
      query: (params) => ({ url: "/dashboard/leaderboard", params: buildListParams(params ?? {}) }),
      providesTags: ["Leaderboard"],
    }),
  }),
});

export const { 
  useParentDashboardQuery, 
  useAdminDashboardQuery, 
  useLeaderboardQuery 
} = dashboardApi;
