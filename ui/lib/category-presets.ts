export type CategoryPreset = {
  icon: string;
  color: string;
};

export const CATEGORY_PRESETS: CategoryPreset[] = [
  { icon: "📚", color: "#6d51ec" },
  { icon: "🎨", color: "#ef4444" },
  { icon: "🐻", color: "#f59e0b" },
  { icon: "🍎", color: "#84cc16" },
  { icon: "🔤", color: "#06b6d4" },
  { icon: "🔢", color: "#3b82f6" },
  { icon: "🔷", color: "#8b5cf6" },
  { icon: "➕", color: "#14b8a6" },
  { icon: "🧩", color: "#f97316" },
  { icon: "🎵", color: "#ec4899" },
  { icon: "🚗", color: "#0ea5e9" },
  { icon: "🌳", color: "#22c55e" },
  { icon: "⚽", color: "#eab308" },
  { icon: "🪐", color: "#a855f7" },
  { icon: "🧪", color: "#10b981" },
  { icon: "🏠", color: "#f43f5e" },
];

export const DEFAULT_CATEGORY_PRESET = CATEGORY_PRESETS[0];

export function nextCategoryPreset(usedIcons: Array<string | null | undefined>): CategoryPreset {
  const used = new Set(usedIcons.filter(Boolean) as string[]);

  return CATEGORY_PRESETS.find((preset) => !used.has(preset.icon)) ?? DEFAULT_CATEGORY_PRESET;
}
