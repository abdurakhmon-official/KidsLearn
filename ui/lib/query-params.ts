import type { ListQuery } from "@/types/api";

export const buildListParams = <T extends Record<string, unknown>>(
  query: ListQuery & T = {} as ListQuery & T,
): Record<string, unknown> => {
  const params: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;

    params[key] = value;
  }

  return params;
}
