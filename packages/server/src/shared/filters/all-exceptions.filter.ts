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
import { AppErrorCode } from '../exceptions/AppErrorCode.js';
import { AppError } from '../exceptions/AppError.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (Sentry.isInitialized()) {
      Sentry.captureException(exception);
      await Sentry.flush(2000);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = AppErrorCode.UNKNOWN_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof AppError) {
      status = exception.statusCode;
      errorCode = exception.errorCode;
      message = exception.message;
      this.logger.warn(
        `Handled known application error: ${errorCode} for path: ${request.url}`,
        exception.message,
      );
    } else if (exception instanceof ZodError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = AppErrorCode.VALIDATION_FAILED;

      const validationErrors = exception.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      message = 'Internal data validation failed.';

      this.logger.error(
        `Caught a ZodError for path: ${request.url}`,
        JSON.stringify(validationErrors),
      );
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse &&
        typeof exceptionResponse.message === 'string'
      ) {
        message = exceptionResponse.message;
      } else {
        message = JSON.stringify(exceptionResponse);
      }

      this.logger.error(
        `Caught an unhandled HttpException for path: ${request.url}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Caught a generic unhandled exception for path: ${request.url}`,
        (exception as Error).stack,
      );

      if (
        process.env['NODE_ENV'] !== 'production' &&
        exception instanceof Error
      ) {
        message = exception.message;
      }
    }

    response.status(status).json({
      statusCode: status,
      errorCode: errorCode,
      message: message,
    });
  }
}
