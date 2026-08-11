import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type { ListQuery, Paged, UserDetail, UserFilters, UserListItem } from "@/types/api";
import type { CreateUserInput } from "@/types/input/CreateUserInput";
import type { UpdateUserInput } from "@/types/input/UpdateUserInput";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    usersPaginated: build.query<Paged<UserListItem>, ListQuery & UserFilters>({
      query: (params) => ({ url: "/users/paginated", params: buildListParams(params) }),
      providesTags: ["User"],
    }),

    user: build.query<UserDetail, string>({
      query: (id) => ({ url: `/users/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    createUser: build.mutation<UserListItem, CreateUserInput>({
      query: (data) => ({ url: "/users", method: "POST", data }),
      invalidatesTags: ["User", "Dashboard"],
    }),

    updateUser: build.mutation<UserListItem, { id: string; data: UpdateUserInput }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: "PUT", data }),
      invalidatesTags: ["User"],
    }),

    updateUserStatus: build.mutation<UserListItem, { id: string; active: boolean }>({
      query: ({ id, active }) => ({ url: `/users/${id}/status`, method: "PUT", data: { active } }),
      invalidatesTags: ["User"],
    }),

    deleteUser: build.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User", "Dashboard"],
    }),
  }),
});

export const {
  useUsersPaginatedQuery,
  useUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = userApi;
