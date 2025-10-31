import { AxiosError, isAxiosError } from 'axios';
import { safeGetNumber, safeGetString } from '../types/utils';
import { captureError } from '../utils/sentry';
import z from 'zod';
import { toast } from 'sonner';

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  originalError: unknown;
  clientMessage?: string;
  details?: Record<string, unknown> | null;

  private constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    originalError?: unknown,
    clientMessage?: string,
    details?: Record<string, unknown> | null
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.originalError = originalError;
    this.clientMessage = clientMessage;
    this.details = details;
  }

  notify() {
    toast.error(this.clientMessage ?? this.message);
    return this;
  }

  static fromAxiosError(error: AxiosError, clientMessage?: string): ApiError {
    const statusCode = error.response?.status ?? 500;
    const data = error.response?.data;

    captureError(error, {
      context: 'ApiError.fromAxiosError',
      statusCode,
      data,
    });

    const message =
      safeGetString(data, 'message') ??
      error.message ??
      'Something went wrong with the request';
    const errorCode = safeGetString(data, 'errorCode') ?? 'axios_error';

    return new ApiError(message, statusCode, errorCode, error, clientMessage);
  }

  static fromZodError(error: z.ZodError, clientMessage?: string): ApiError {
    const issues: z.core.$ZodIssue[] = error.issues;

    const formatted = issues
      .map((issue) => `• ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    captureError(error, {
      context: 'ApiError.fromZodError',
      details: formatted,
    });

    const defaultMessage = 'Something went wrong!';

    return new ApiError(
      defaultMessage,
      500,
      'invalid_response_schema',
      error,
      clientMessage ?? defaultMessage
    );
  }

  static fromUnknown(
    error: unknown,
    extra?: {
      clientMessage?: string;
      details?: Record<string, unknown> | null;
    }
  ): ApiError {
    const { clientMessage, details } = extra || {};
    if (error instanceof ApiError) return error;
    if (isAxiosError(error))
      return ApiError.fromAxiosError(error, clientMessage);
    if (error instanceof z.ZodError)
      return ApiError.fromZodError(error, clientMessage);

    const statusCode = safeGetNumber(error, 'statusCode') ?? 500;
    const errorCode = safeGetString(error, 'errorCode') ?? 'unknown_error';

    captureError(error, {
      context: 'ApiError.fromUnknown',
      statusCode,
      errorCode,
      details,
    });

    return new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      statusCode,
      errorCode,
      error,
      clientMessage,
      details
    );
  }
}
