import { baseApi } from "./base-api";
import { buildListParams } from "@/lib/query-params";
import type {
  GameDetail,
  GameFilters,
  GameForChild,
  GameItem,
  GameListItem,
  ListQuery,
  Paged,
  PlayRound,
  SubmitGameResult,
} from "@/types/api";
import type { CreateGameInput } from "@/types/input/CreateGameInput";
import type { UpdateGameInput } from "@/types/input/UpdateGameInput";
import type { GameItemInput } from "@/types/input/GameItemInput";
import type { SubmitGameInput } from "@/types/input/SubmitGameInput";

type ForChildResponse = { items: GameForChild[]; count: number; ageGroup: string };

export const gameApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    gamesPaginated: build.query<Paged<GameListItem>, ListQuery & GameFilters>({
      query: (params) => ({ url: "/games/paginated", params: buildListParams(params) }),
      providesTags: ["Game"],
    }),

    gamesForChild: build.query<ForChildResponse, void>({
      query: () => ({ url: "/games/for-me" }),
      providesTags: ["Game", "Progress"],
    }),

    game: build.query<GameDetail, string>({
      query: (id) => ({ url: `/games/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Game", id }],
    }),

    playGame: build.query<PlayRound, string>({
      query: (id) => ({ url: `/games/${id}/play` }),
      keepUnusedDataFor: 0,
    }),

    submitGame: build.mutation<SubmitGameResult, { id: string; data: SubmitGameInput }>({
      query: ({ id, data }) => ({ url: `/games/${id}/submit`, method: "POST", data }),
      invalidatesTags: ["Progress", "Game", "Award", "Dashboard", "Leaderboard"],
    }),

    createGame: build.mutation<GameDetail, CreateGameInput>({
      query: (data) => ({ url: "/games", method: "POST", data }),
      invalidatesTags: ["Game", "Dashboard"],
    }),

    updateGame: build.mutation<GameDetail, { id: string; data: UpdateGameInput }>({
      query: ({ id, data }) => ({ url: `/games/${id}`, method: "PUT", data }),
      invalidatesTags: ["Game", "GameItem"],
    }),

    deleteGame: build.mutation<void, string>({
      query: (id) => ({ url: `/games/${id}`, method: "DELETE" }),
      invalidatesTags: ["Game", "Dashboard"],
    }),

    gameItems: build.query<{ items: GameItem[]; count: number }, string>({
      query: (id) => ({ url: `/games/${id}/items` }),
      providesTags: ["GameItem"],
    }),

    addGameItem: build.mutation<GameItem, { id: string; data: GameItemInput }>({
      query: ({ id, data }) => ({ url: `/games/${id}/items`, method: "POST", data }),
      invalidatesTags: ["GameItem", "Game"],
    }),

    updateGameItem: build.mutation<GameItem, { id: string; itemId: string; data: GameItemInput }>({
      query: ({ id, itemId, data }) => ({ url: `/games/${id}/items/${itemId}`, method: "PUT", data }),
      invalidatesTags: ["GameItem", "Game"],
    }),

    deleteGameItem: build.mutation<void, { id: string; itemId: string }>({
      query: ({ id, itemId }) => ({ url: `/games/${id}/items/${itemId}`, method: "DELETE" }),
      invalidatesTags: ["GameItem", "Game"],
    }),
  }),
});

export const {
  useGamesPaginatedQuery,
  useGamesForChildQuery,
  useGameQuery,
  usePlayGameQuery,
  useSubmitGameMutation,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useGameItemsQuery,
  useAddGameItemMutation,
  useUpdateGameItemMutation,
  useDeleteGameItemMutation,
} = gameApi;
