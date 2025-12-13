import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { ZodError } from 'zod';
import { serializeError } from 'serialize-error';
import ensureError from 'ensure-error';
import { AppErrorCode } from '../exceptions/AppErrorCode.js';
import { AppException } from '../exceptions/AppException.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const normalizedError = ensureError(exception);
    const serializedError = serializeError(exception) as {
      name?: string;
      message?: string;
      stack?: string;
      [key: string]: unknown;
    };

    if (Sentry.isInitialized()) {
      Sentry.captureException(normalizedError, {
        contexts: {
          request: {
            url: request.url,
            method: request.method,
          },
        },
      });
      await Sentry.flush(2000);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = AppErrorCode.UNKNOWN_ERROR;
    let message = 'Internal Server Error';
    let details: unknown = undefined;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      errorCode = exception.errorCode;
      message = exception.message;
      details = exception.details;

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `[${errorCode}] ${message}`,
          serializedError.stack ?? '',
          {
            path: request.url,
            method: request.method,
            details,
          },
        );
      } else {
        this.logger.warn(
          `[${errorCode}] ${message} - ${request.method} ${request.url}`,
        );
      }
    } else if (exception instanceof ZodError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = AppErrorCode.VALIDATION_FAILED;

      const validationErrors = exception.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      message = 'Internal data validation failed';
      details = validationErrors;

      this.logger.error(
        `[${errorCode}] Zod validation failed for ${request.method} ${request.url}`,
        JSON.stringify(validationErrors, null, 2),
      );
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const responseMessage = exceptionResponse.message;

        if (typeof responseMessage === 'string') {
          message = responseMessage;
        } else if (Array.isArray(responseMessage)) {
          message = responseMessage.join(', ');
        } else {
          message = JSON.stringify(responseMessage);
        }

        if ('error' in exceptionResponse) {
          details = exceptionResponse;
        }
      }

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `Unhandled HttpException: ${message}`,
          serializedError.stack ?? '',
          {
            path: request.url,
            method: request.method,
            status,
          },
        );
      }
    } else {
      message = normalizedError.message || 'Unknown error occurred';

      this.logger.error(
        `Unhandled exception for ${request.method} ${request.url}`,
        serializedError.stack ?? '',
        {
          errorType: normalizedError.name,
          serialized: serializedError,
        },
      );

      if (process.env['NODE_ENV'] === 'development') {
        details = serializedError;
      } else {
        message = 'Internal Server Error';
      }
    }

    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (
      details &&
      (process.env['NODE_ENV'] === 'development' ||
        status < HttpStatus.INTERNAL_SERVER_ERROR)
    ) {
      errorResponse.details = details;
    }

    response.status(status).json(errorResponse);
  }
}
