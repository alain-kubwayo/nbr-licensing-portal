import { AxiosError } from "axios";

type ErrorFormat = {
  message?: string | string[];
  error?: string;
};

export function getApiErrorMessage(
  caught: unknown,
  defaultMessage = "Something went wrong",
): string {
  if (caught instanceof AxiosError) {
    const serverData = caught.response?.data;

    if (typeof serverData === "string" && serverData.trim()) {
      return serverData.trim();
    }

    if (serverData && typeof serverData === "object") {
      const err = serverData as ErrorFormat;

      if (typeof err.message === "string" && err.message.trim()) {
        return err.message.trim();
      }

      if (Array.isArray(err.message) && err.message.length > 0) {
        return err.message
          .filter((line): line is string => typeof line === "string")
          .join(". ");
      }

      if (typeof err.error === "string" && err.error.trim()) {
        return err.error.trim();
      }
    }

    if (caught.message) return caught.message;
  }

  if (caught instanceof Error && caught.message) {
    return caught.message;
  }

  return defaultMessage;
}
