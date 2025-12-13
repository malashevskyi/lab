import { AxiosError, isAxiosError } from "axios";
import { safeGetNumber, safeGetString } from "../types/utils";
import { captureError } from "../utils/sentry";
import z from "zod";
import { toast } from "sonner";

export function setupErrorInterceptor(apiInstance: any) {
  apiInstance.interceptors.response.use(
    (res: any) => res,
    (error: AxiosError) => {
      captureError(error, {
        context: "axios.interceptor",
        statusCode: error.response?.status ?? 500,
        url: error.config?.url,
        data: error.response?.data,
      });

      return Promise.reject(error);
    }
  );
}

function fromZodError(error: z.ZodError): void {
  const issues: z.core.$ZodIssue[] = error.issues;

  const formatted = issues
    .map((issue) => `• ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  captureError(error, {
    context: "zod-error",
    details: formatted,
  });
}

export function notify(errorString: string): void {
  toast.error(errorString);
}

export function notifyAndCapture(
  errorString: string,
  details?: Record<string, unknown>
): void {
  if (details) {
    captureError(new Error(errorString), {
      context: "notify",
      details,
    });
  }

  toast.error(errorString);
}

export function fromUnknown(
  error: unknown,
  extra?: {
    clientMessage?: string;
    details?: Record<string, unknown> | string | null;
    notify?: boolean;
    context?: string;
  }
): void {
  const { clientMessage, details, context, notify: shouldNotify } = extra || {};

  if (shouldNotify) toast.error(clientMessage || "Something went wrong!");

  if (isAxiosError(error)) {
    // handled by interceptor
    return;
  }
  if (error instanceof z.ZodError) {
    fromZodError(error);
    return;
  }

  const statusCode = safeGetNumber(error, "statusCode") ?? 500;
  const errorCode = safeGetString(error, "errorCode") ?? "unknown_error";

  captureError(error, {
    context: context || "fromUnknown",
    statusCode,
    errorCode,
    details,
  });
}
