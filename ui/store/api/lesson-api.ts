import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type {
  LessonDetail,
  LessonFilters,
  LessonForChild,
  LessonListItem,
  LessonMedia,
  ListQuery,
  Paged,
  SaveLessonProgressResult,
} from "@/types/api";
import type { CreateLessonInput } from "@/types/input/CreateLessonInput";
import type { UpdateLessonInput } from "@/types/input/UpdateLessonInput";
import type { LessonMediaInput } from "@/types/input/LessonMediaInput";
import type { LessonProgressInput } from "@/types/input/LessonProgressInput";

type ForChildResponse = { items: LessonForChild[]; count: number; ageGroup: string };

export const lessonApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    lessonsPaginated: build.query<Paged<LessonListItem>, ListQuery & LessonFilters>({
      query: (params) => ({ url: "/lessons/paginated", params: buildListParams(params) }),
      providesTags: ["Lesson"],
    }),

    lessonsForChild: build.query<ForChildResponse, { categoryId?: string } | void>({
      query: (params) => ({ url: "/lessons/for-me", params: buildListParams(params ?? {}) }),
      providesTags: ["Lesson", "Progress"],
    }),

    lesson: build.query<LessonDetail, string>({
      query: (id) => ({ url: `/lessons/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Lesson", id }],
    }),

    createLesson: build.mutation<LessonDetail, CreateLessonInput>({
      query: (data) => ({ url: "/lessons", method: "POST", data }),
      invalidatesTags: ["Lesson", "Dashboard", "Notification"],
    }),

    updateLesson: build.mutation<LessonDetail, { id: string; data: UpdateLessonInput }>({
      query: ({ id, data }) => ({ url: `/lessons/${id}`, method: "PUT", data }),
      invalidatesTags: ["Lesson"],
    }),

    deleteLesson: build.mutation<void, string>({
      query: (id) => ({ url: `/lessons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Lesson", "Dashboard"],
    }),

    addLessonMedia: build.mutation<LessonMedia, { id: string; data: LessonMediaInput }>({
      query: ({ id, data }) => ({ url: `/lessons/${id}/media`, method: "POST", data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Lesson", id }, "Lesson"],
    }),

    removeLessonMedia: build.mutation<void, { id: string; mediaId: string }>({
      query: ({ id, mediaId }) => ({ url: `/lessons/${id}/media/${mediaId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Lesson", id }, "Lesson"],
    }),

    saveLessonProgress: build.mutation<SaveLessonProgressResult, { id: string; data: LessonProgressInput }>({
      query: ({ id, data }) => ({ url: `/lessons/${id}/progress`, method: "POST", data }),
      invalidatesTags: ["Progress", "Lesson", "Award", "Dashboard"],
    }),
  }),
});

export const {
  useLessonsPaginatedQuery,
  useLessonsForChildQuery,
  useLessonQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useAddLessonMediaMutation,
  useRemoveLessonMediaMutation,
  useSaveLessonProgressMutation,
} = lessonApi;
