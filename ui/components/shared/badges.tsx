"use client";

import { LockIcon, StarIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { AgeGroup, MedalType } from "@/types/api";

/**
 * `/15` fon + to'liq rang matn + `/30` halqa — bu naqsh ikkala temada ham
 * kontrastni saqlaydi, chunki uchala qiymat bitta token'dan chiqadi.
 */
const AGE_STYLES: Record<AgeGroup, string> = {
  AGE_1_2: "bg-age-1-2/15 text-age-1-2 ring-age-1-2/30",
  AGE_3_4: "bg-age-3-4/15 text-age-3-4 ring-age-3-4/30",
  AGE_5_7: "bg-age-5-7/15 text-age-5-7 ring-age-5-7/30",
};

export function AgeGroupBadge({ ageGroup, className }: { ageGroup: AgeGroup; className?: string }) {
  const t = useT();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        AGE_STYLES[ageGroup],
        className,
      )}
    >
      {t(`ageGroup.${ageGroup}`)}
    </span>
  );
}

const MEDAL_STYLES: Record<MedalType, string> = {
  BRONZE: "bg-medal-bronze/15 text-medal-bronze ring-medal-bronze/30",
  SILVER: "bg-medal-silver/15 text-medal-silver ring-medal-silver/30",
  GOLD: "bg-medal-gold/15 text-medal-gold ring-medal-gold/30",
  DIAMOND: "bg-medal-diamond/15 text-medal-diamond ring-medal-diamond/30",
};

export function MedalBadge({ medal, className }: { medal: MedalType; className?: string }) {
  const t = useT();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        MEDAL_STYLES[medal],
        className,
      )}
    >
      {t(`medal.${medal}`)}
    </span>
  );
}

/**
 * Medal doirasi. `icon` — API'dan keladigan emoji (`🎓`, `🏆`, `💎`);
 * rang esa token'dan, halqa va yorug'lik sifatida.
 *
 * Qulflangani o'chirilmaydi — bola nimaga intilishini ko'rishi kerak.
 */
export function MedalCoin({
  medal,
  icon,
  locked = false,
  size = "md",
  className,
}: {
  medal: MedalType;
  icon?: string | null;
  locked?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimensions = { sm: "size-10 text-lg", md: "size-14 text-2xl", lg: "size-20 text-4xl" }[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full ring-2",
        dimensions,
        MEDAL_STYLES[medal],
        locked && "grayscale opacity-40",
        className,
      )}
    >
      <span aria-hidden>{icon ?? "🏅"}</span>
      {locked && (
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-muted ring-1 ring-border">
          <LockIcon className="size-3 text-muted-foreground" />
        </span>
      )}
    </div>
  );
}

/** 0–3 yulduz. Rang faqat yagona signal bo'lmasin deb son ham beriladi. */
export function Stars({
  value,
  max = 3,
  size = "md",
  className,
}: {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimension = { sm: "size-3.5", md: "size-5", lg: "size-8" }[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`${value} / ${max} yulduz`}>
      {Array.from({ length: max }).map((_, index) => (
        <StarIcon
          key={index}
          aria-hidden
          className={cn(
            dimension,
            index < value ? "fill-medal-gold text-medal-gold" : "fill-muted text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}
