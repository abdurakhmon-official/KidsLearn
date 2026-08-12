import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type {
  ListQuery,
  Paged,
  PhraseAudio,
  PhraseAudioFilters,
  UpsertPhraseAudioInput,
} from "@/types/api";

export const audioApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    phraseAudioPaginated: build.query<Paged<PhraseAudio>, ListQuery & PhraseAudioFilters>({
      query: (params) => ({ url: "/audio/phrases/list", params: buildListParams(params) }),
      providesTags: ["PhraseAudio"],
    }),

    upsertPhraseAudio: build.mutation<PhraseAudio, UpsertPhraseAudioInput>({
      query: (data) => ({ url: "/audio/phrases", method: "PUT", data }),
      invalidatesTags: ["PhraseAudio"],
    }),

    removePhraseAudio: build.mutation<{ key: string }, string>({
      query: (id) => ({ url: `/audio/phrases/${id}`, method: "DELETE" }),
      invalidatesTags: ["PhraseAudio"],
    }),
  }),
});

export const {
  usePhraseAudioPaginatedQuery,
  useUpsertPhraseAudioMutation,
  useRemovePhraseAudioMutation,
} = audioApi;
