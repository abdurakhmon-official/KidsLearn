import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./base-query";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Auth",
    "Child",
    "Category",
    "Lesson",
    "Game",
    "GameItem",
    "Progress",
    "Award",
    "Notification",
    "Media",
    "User",
    "Dashboard",
    "Leaderboard",
  ],
  endpoints: () => ({}),
});
