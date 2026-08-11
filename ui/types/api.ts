export type ApiResponse<T> = {
  success: true;
  _message?: string;
  data: T;
};

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiError = {
  success: false;
  _message: string;
  errors?: ApiFieldError[];
  requestId?: string;
};

export type Paged<T> = {
  items: T[];
  count: number;
};

export type UserRole = "ADMIN" | "PARENT";
export type AuthRole = UserRole | "CHILD";
export type AgeGroup = "AGE_1_2" | "AGE_3_4" | "AGE_5_7";

export type GameType =
  | "COLOR_MATCH"
  | "ANIMAL_SOUND"
  | "LETTER_MATCH"
  | "NUMBER_MATCH"
  | "PUZZLE"
  | "MEMORY";

export type MedalType = "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";
export type MediaType = "IMAGE" | "VIDEO" | "AUDIO";
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type NotificationType = "NO_ACTIVITY_TODAY" | "NEW_LESSON" | "AWARD_EARNED";

export const AGE_GROUPS: AgeGroup[] = ["AGE_1_2", "AGE_3_4", "AGE_5_7"];
export const GAME_TYPES: GameType[] = [
  "COLOR_MATCH",
  "ANIMAL_SOUND",
  "LETTER_MATCH",
  "NUMBER_MATCH",
  "PUZZLE",
  "MEMORY",
];
export const MEDIA_TYPES: MediaType[] = ["IMAGE", "VIDEO", "AUDIO"];
export const MEDAL_TYPES: MedalType[] = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];

export type AccessToken = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChildProfile = {
  id: string;
  parentId: string;
  fullName: string;
  birthDate: string;
  avatar: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  age: number;
  ageGroup: AgeGroup;
};

export type ChildStats = {
  childId: string;
  totalPoints: number;
  totalStars: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  streakDays: number;
  longestStreak: number;
  lastActivityAt: string | null;
  updatedAt: string;
};

export type ChildWithStats = ChildProfile & {
  stats: ChildStats | null;
};

export type ParentBrief = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
};

export type ChildWithParent = ChildWithStats & {
  parent: ParentBrief;
};

export type SelectChildResponse = AccessToken & {
  child: ChildProfile;
};

export type AuthMeParent = AuthUser & {
  isAdmin: boolean;
  children: ChildProfile[];
};

export type AuthMeChild = {
  role: "CHILD";
  child: ChildProfile;
  parent: AuthUser;
};

export type AuthMe = AuthMeParent | AuthMeChild;

export const isChildSession = (me: AuthMe): me is AuthMeChild => {
  return "role" in me && me.role === "CHILD";
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { lessons: number; games: number };
};

export type CategoryBrief = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
};

export type LessonMedia = {
  id: string;
  lessonId: string;
  type: MediaType;
  url: string;
  caption: string | null;
  order: number;
  createdAt: string;
};

export type LessonProgressBrief = {
  status: ProgressStatus;
  progressPercent: number;
  completedAt: string | null;
};

export type LessonProgressDetail = LessonProgressBrief & {
  watchedSeconds: number;
};

export type LessonProgress = {
  id: string;
  childId: string;
  lessonId: string;
  status: ProgressStatus;
  progressPercent: number;
  watchedSeconds: number;
  pointsEarned: number;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
};

export type LessonListItem = {
  id: string;
  title: string;
  description: string | null;
  ageGroup: AgeGroup;
  coverImage: string | null;
  points: number;
  order: number;
  active: boolean;
  createdAt: string;
  category: CategoryBrief;
  _count: { media: number };
};

export type LessonForChild = LessonListItem & {
  progress: LessonProgressBrief;
};

export type LessonDetail = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  ageGroup: AgeGroup;
  coverImage: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  points: number;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category: CategoryBrief;
  media: LessonMedia[];
  progress?: LessonProgressDetail[];
};

export type SaveLessonProgressResult = {
  progress: LessonProgress;
  pointsEarned: number;
  stats: ChildStats;
  awards: Award[];
};

export type GameOption = {
  value: string;
  label?: string | null;
  image?: string | null;
  audio?: string | null;
  color?: string | null;
};

export type GameConfig = {
  itemsPerRound?: number;
  rows?: number;
  cols?: number;
  pairs?: number;
} & Record<string, unknown>;

export type GameItem = {
  id: string;
  gameId: string;
  promptText: string | null;
  promptImage: string | null;
  promptAudio: string | null;
  correctValue: string;
  options: GameOption[];
  order: number;
  active: boolean;
  createdAt: string;
};

export type GameListItem = {
  id: string;
  code: GameType;
  title: string;
  description: string | null;
  ageGroup: AgeGroup;
  coverImage: string | null;
  pointsPerCorrect: number;
  config: GameConfig | null;
  order: number;
  active: boolean;
  createdAt: string;
  category: CategoryBrief | null;
  _count: { items: number };
};

export type BestSession = {
  stars: number;
  score: number;
  createdAt: string;
};

export type GameForChild = GameListItem & {
  best: BestSession | null;
};

export type GameDetail = {
  id: string;
  code: GameType;
  title: string;
  description: string | null;
  categoryId: string | null;
  ageGroup: AgeGroup;
  coverImage: string | null;
  instructionAudio: string | null;
  pointsPerCorrect: number;
  config: GameConfig | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category: CategoryBrief | null;
  items?: GameItem[];
  _count: { items: number; sessions: number };
};

export type PlayItem = {
  id: string;
  gameId: string;
  promptText: string | null;
  promptImage: string | null;
  promptAudio: string | null;
  options: GameOption[];
  order: number;
  active: boolean;
  createdAt: string;
};

export type PlayRound = {
  game: {
    id: string;
    code: GameType;
    title: string;
    instructionAudio: string | null;
    pointsPerCorrect: number;
    config: GameConfig | null;
  };
  items: PlayItem[];
  count: number;
  child: { id: string; fullName: string };
};

export type GameSession = {
  id: string;
  childId: string;
  gameId: string;
  totalItems: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  stars: number;
  durationSeconds: number | null;
  createdAt: string;
};

export type GameAnswerResult = {
  itemId: string;
  selected: string | null;
  correctValue: string;
  isCorrect: boolean;
};

export type SubmitGameResult = {
  session: GameSession;
  percent: number;
  results: GameAnswerResult[];
  stats: ChildStats;
  awards: Award[];
};

export type GameSessionWithGame = GameSession & {
  game: { id: string; title: string; code: GameType; coverImage: string | null };
};

export type GameSessionMini = GameSession & {
  game: { id: string; title: string; code: GameType };
};

export type Award = {
  id: string;
  childId: string;
  medal: MedalType;
  code: string;
  title: string;
  description: string | null;
  icon: string | null;
  earnedAt: string;
};

export type LockedAward = {
  code: string;
  medal: MedalType;
  title: string;
  description: string;
  icon: string;
};

export type AwardsResponse = {
  earned: Award[];
  locked: LockedAward[];
  count: number;
};

export type ProgressSummary = {
  child: ChildProfile;
  stats: ChildStats | null;
  lessons: {
    completed: number;
    inProgress: number;
    available: number;
    percent: number;
  };
  games: {
    played: number;
    totalScore: number;
    totalStars: number;
    accuracy: number;
  };
  awards: Award[];
  recentSessions: GameSessionWithGame[];
};

export type ChartDay = {
  date: string;
  points: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  activeMinutes: number;
};

export type ChartTotals = Omit<ChartDay, "date">;

export type ActivityChart = {
  days: ChartDay[];
  totals: ChartTotals;
};

export type CategoryPerformance = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  correct: number;
  total: number;
  sessions: number;
  accuracy: number;
};

export type ParentDashboard = {
  child: ChildProfile;
  stats: ChildStats | null;
  today: {
    points: number;
    gamesPlayed: number;
    lessonsCompleted: number;
    activeMinutes: number;
  };
  weekly: ActivityChart;
  monthly: ActivityChart;
  totals: {
    lessonsCompleted: number;
    streakDays: number;
    totalPoints: number;
    totalStars: number;
  };
  bestSubjects: CategoryPerformance[];
  hardSubjects: CategoryPerformance[];
  recentAwards: Award[];
  recentSessions: GameSessionMini[];
};

export type AdminChartDay = {
  date: string;
  points: number;
  gamesPlayed: number;
  lessonsCompleted: number;
};

export type AdminDashboard = {
  totals: {
    parents: number;
    admins: number;
    children: number;
    lessons: number;
    games: number;
    mediaAssets: number;
    gameSessions: number;
    activeChildrenToday: number;
    pointsLast14Days: number;
  };
  childrenByAgeGroup: Record<AgeGroup, number>;
  activityChart: AdminChartDay[];
};

export type LeaderboardRow = {
  rank: number;
  points: number;
  stars: number;
  streakDays: number;
  child: {
    id: string;
    fullName: string;
    avatar: string | null;
    birthDate: string;
    age: number;
    ageGroup: AgeGroup;
  };
};

export type LeaderboardPeriod = "week" | "month" | "all";

export type ChildBrief = {
  id: string;
  fullName: string;
  avatar: string | null;
};

export type Notification = {
  id: string;
  userId: string;
  childId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  child: ChildBrief | null;
};

export type NotificationPage = Paged<Notification> & {
  unread: number;
};

export type UserListItem = AuthUser & {
  _count: { children: number };
};

export type ChildInUser = {
  id: string;
  fullName: string;
  birthDate: string;
  avatar: string | null;
  active: boolean;
};

export type UserDetail = AuthUser & {
  children: ChildInUser[];
};

export type MediaAsset = {
  id: string;
  type: MediaType;
  url: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedById: string | null;
  createdAt: string;
  uploader: { id: string; fullName: string; email: string } | null;
};

export type RemoveMediaResult = { key: string };

export type S3Policy = {
  policy: Record<string, string>;
  removeAuthKey: string;
  region: string;
  url: string;
};

export type SortOrder = "asc" | "desc";

export type Sorting = {
  key: string;
  order?: SortOrder;
};

export type ListQuery = {
  page?: number;
  size?: number;
  search?: string | null;
  sortBy?: Sorting[];
};

export type ChildFilters = {
  age?: number;
  ageGroup?: AgeGroup;
  parentId?: string;
  active?: boolean;
};

export type LessonFilters = {
  ageGroup?: AgeGroup;
  categoryId?: string;
  active?: boolean;
  from?: string;
  to?: string;
};

export type GameFilters = {
  ageGroup?: AgeGroup;
  code?: GameType;
  categoryId?: string;
  active?: boolean;
};

export type UserFilters = {
  role?: UserRole;
  active?: boolean;
};

export type MediaFilters = {
  type?: MediaType;
};

export type NotificationFilters = {
  type?: NotificationType;
  unreadOnly?: boolean;
  childId?: string;
};

export type LeaderboardFilters = {
  ageGroup?: AgeGroup;
  period?: LeaderboardPeriod;
  limit?: number;
};
