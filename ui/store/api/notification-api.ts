import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type { ListQuery, Notification, NotificationFilters, NotificationPage } from "@/types/api";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    notifications: build.query<NotificationPage, ListQuery & NotificationFilters>({
      query: (params) => ({ url: "/notifications/paginated", params: buildListParams(params) }),
      providesTags: ["Notification"],
    }),

    markNotificationRead: build.mutation<Notification, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PUT" }),
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: build.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "PUT" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
