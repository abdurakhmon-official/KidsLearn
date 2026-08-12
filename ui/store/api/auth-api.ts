import { baseApi } from "./base-api";
import type {
  AccessToken,
  AuthMe,
  AuthUser,
  SelectChildResponse,
} from "@/types/api";
import type { LoginInput } from "@/types/input/LoginInput";
import type { RegisterInput } from "@/types/input/RegisterInput";
import type { UpdateProfileInput } from "@/types/input/UpdateProfileInput";
import type { UpdatePasswordInput } from "@/types/input/UpdatePasswordInput";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AccessToken, LoginInput>({
      query: (data) => ({ url: "/auth/login", method: "POST", data }),
    }),

    register: build.mutation<AccessToken, RegisterInput>({
      query: (data) => ({ url: "/auth/register", method: "POST", data }),
    }),

    me: build.query<AuthMe, void>({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["Auth"],
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST", silent: true }),
    }),

    selectChild: build.mutation<SelectChildResponse, string>({
      query: (childId) => ({ url: `/auth/children/${childId}/select`, method: "POST" }),
    }),

    updateProfile: build.mutation<AuthUser, UpdateProfileInput>({
      query: (data) => ({ url: "/auth/profile", method: "PUT", data }),
      invalidatesTags: ["Auth"],
    }),

    updatePassword: build.mutation<void, UpdatePasswordInput>({
      query: (data) => ({ url: "/auth/password", method: "PUT", data }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useLazyMeQuery,
  useLogoutMutation,
  useSelectChildMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
} = authApi;
