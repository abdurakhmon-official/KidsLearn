import { baseApi } from "./base-api";
import type { Category } from "@/types/api";
import type { CreateCategoryInput } from "@/types/input/CreateCategoryInput";
import type { UpdateCategoryInput } from "@/types/input/UpdateCategoryInput";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    categories: build.query<Category[], { all?: boolean } | void>({
      query: (params) => ({
        url: "/categories",
        params: params?.all ? { all: "true" } : undefined,
      }),
      providesTags: ["Category"],
    }),

    createCategory: build.mutation<Category, CreateCategoryInput>({
      query: (data) => ({ url: "/categories", method: "POST", data }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: build.mutation<Category, { id: string; data: UpdateCategoryInput }>({
      query: ({ id, data }) => ({ url: `/categories/${id}`, method: "PUT", data }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: build.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
