import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { translateServerMessage } from "@/lib/server-messages";
import type { ApiError } from "@/types/api";

export const toApiError = (error: unknown): ApiError | null => {
  if (error && typeof error === "object" && "_message" in error) {
    return error as ApiError;
  }

  return null;
}

export const applyServerErrors = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean => {
  const apiError = toApiError(error);

  if (!apiError?.errors?.length) return false;

  for (const detail of apiError.errors) {
    setError(detail.field as Path<T>, {
      type: "server",
      message: translateServerMessage(detail.message),
    });
  }

  return true;
}
