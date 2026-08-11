/**
 * Bolaning bir martalik faolligi. Dars va o'yin servislari shu shaklda
 * `ActivityService.record()` ga uzatadi.
 */
export type ActivityInput = {
  points?: number;
  stars?: number;
  gamesPlayed?: number;
  lessonsCompleted?: number;
  activeSeconds?: number;
  /** O'yin bitta ham xatosiz yakunlangan bo'lsa — `PERFECT_GAME` medali uchun. */
  perfectGame?: boolean;
};
