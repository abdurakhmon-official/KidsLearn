import { STAR_THRESHOLDS } from '@/utils/constants';

export const starsFor = (percent: number): number => {
  return STAR_THRESHOLDS.find(threshold => percent >= threshold.percent)?.stars ?? 0;
}
