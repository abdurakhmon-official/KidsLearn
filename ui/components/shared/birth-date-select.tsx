"use client";

import { useEffect, useMemo, useState } from "react";
import { monthNames } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n/provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** `childSchema` sanani shu oraliqda kutadi. */
const MAX_AGE = 18;

type Parts = { day: string; month: string; year: string };

const EMPTY: Parts = { day: "", month: "", year: "" };

const pad = (value: number) => String(value).padStart(2, "0");

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

const toParts = (value: string): Parts => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? { day: match[3], month: match[2], year: match[1] } : EMPTY;
};

/** To'liq to'ldirilmagan sana forma uchun bo'sh hisoblanadi. */
const toValue = ({ day, month, year }: Parts) =>
  day && month && year ? `${year}-${month}-${day}` : "";

/** Oydagi kunlar soni; oy yoki yil tanlanmagan bo'lsa eng uzun oy olinadi. */
const daysInMonth = (year: string, month: string) =>
  year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;

export function BirthDateSelect({
  id,
  value,
  onChange,
  invalid,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const t = useT();
  const { locale } = useLocale();

  const [parts, setParts] = useState<Parts>(() => toParts(value));

  // Forma tashqaridan qayta o'rnatilsa (dialog boshqa bolaga ochilsa) sinxronlaymiz.
  useEffect(() => {
    setParts((current) => (toValue(current) === value ? current : toParts(value)));
  }, [value]);

  const months = useMemo(() => monthNames(locale), [locale]);

  const today = useMemo(() => new Date(), []);
  const thisYear = today.getFullYear();

  const years = useMemo(() => range(thisYear - MAX_AGE, thisYear).reverse(), [thisYear]);

  // Kelajakdagi sana tanlab bo'lmasligi kerak: joriy yilda oylar, joriy oyda kunlar cheklanadi.
  const isThisYear = parts.year === String(thisYear);
  const monthLimit = isThisYear ? today.getMonth() + 1 : 12;
  const dayLimit =
    isThisYear && parts.month === pad(today.getMonth() + 1)
      ? Math.min(today.getDate(), daysInMonth(parts.year, parts.month))
      : daysInMonth(parts.year, parts.month);

  const commit = (next: Parts) => {
    // Yil/oy o'zgarganda oldin tanlangan kun (masalan, 31-fevral) oraliqdan chiqib ketmasligi kerak.
    const month =
      next.month && Number(next.month) > (next.year === String(thisYear) ? today.getMonth() + 1 : 12)
        ? ""
        : next.month;
    const limit =
      next.year === String(thisYear) && month === pad(today.getMonth() + 1)
        ? Math.min(today.getDate(), daysInMonth(next.year, month))
        : daysInMonth(next.year, month);
    const day = next.day && Number(next.day) > limit ? "" : next.day;

    const fixed = { ...next, month, day };
    setParts(fixed);
    onChange(toValue(fixed));
  };

  return (
    <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2">
      <Select
        value={parts.day || null}
        onValueChange={(day: string | null) => commit({ ...parts, day: day ?? "" })}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-label={t("child.day")}>
          <SelectValue placeholder={t("child.day")} />
        </SelectTrigger>
        <SelectContent>
          {range(1, dayLimit).map((day) => (
            <SelectItem key={day} value={pad(day)}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={Object.fromEntries(months.map((name, index) => [pad(index + 1), name]))}
        value={parts.month || null}
        onValueChange={(month: string | null) => commit({ ...parts, month: month ?? "" })}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" aria-invalid={invalid} aria-label={t("child.month")}>
          <SelectValue placeholder={t("child.month")} />
        </SelectTrigger>
        <SelectContent>
          {months.slice(0, monthLimit).map((name, index) => (
            <SelectItem key={name} value={pad(index + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={parts.year || null}
        onValueChange={(year: string | null) => commit({ ...parts, year: year ?? "" })}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" aria-invalid={invalid} aria-label={t("child.year")}>
          <SelectValue placeholder={t("child.year")} />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
