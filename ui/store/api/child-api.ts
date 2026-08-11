import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type {
  AwardsResponse,
  ChildFilters,
  ChildWithParent,
  ChildWithStats,
  ListQuery,
  Paged,
  ProgressSummary,
} from "@/types/api";
import type { CreateChildInput } from "@/types/input/CreateChildInput";
import type { UpdateChildInput } from "@/types/input/UpdateChildInput";

export type CreateChildPayload = Omit<CreateChildInput, "birthDate"> & { birthDate: string };
export type UpdateChildPayload = Omit<UpdateChildInput, "birthDate"> & { birthDate?: string };

export const childApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listChildren: build.query<ChildWithStats[], void>({
      query: () => ({ url: "/children" }),
      providesTags: ["Child"],
    }),

    childrenPaginated: build.query<Paged<ChildWithParent>, ListQuery & ChildFilters>({
      query: (params) => ({ url: "/children/paginated", params: buildListParams(params) }),
      providesTags: ["Child"],
    }),

    getChild: build.query<ChildWithParent, string>({
      query: (id) => ({ url: `/children/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Child", id }],
    }),

    childProgress: build.query<ProgressSummary, string>({
      query: (id) => ({ url: `/children/${id}/progress` }),
      providesTags: ["Progress"],
    }),

    childAwards: build.query<AwardsResponse, string>({
      query: (id) => ({ url: `/children/${id}/awards` }),
      providesTags: ["Award"],
    }),

    createChild: build.mutation<ChildWithStats, CreateChildPayload>({
      query: (data) => ({ url: "/children", method: "POST", data }),
      invalidatesTags: ["Child", "Auth", "Dashboard"],
    }),

    updateChild: build.mutation<ChildWithStats, { id: string; data: UpdateChildPayload }>({
      query: ({ id, data }) => ({ url: `/children/${id}`, method: "PUT", data }),
      invalidatesTags: ["Child", "Auth"],
    }),

    deleteChild: build.mutation<void, string>({
      query: (id) => ({ url: `/children/${id}`, method: "DELETE" }),
      invalidatesTags: ["Child", "Auth", "Dashboard"],
    }),
  }),
});

export const {
  useListChildrenQuery,
  useChildrenPaginatedQuery,
  useGetChildQuery,
  useChildProgressQuery,
  useChildAwardsQuery,
  useCreateChildMutation,
  useUpdateChildMutation,
  useDeleteChildMutation,
} = childApi;
