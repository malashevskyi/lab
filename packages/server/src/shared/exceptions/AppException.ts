import { HttpException, HttpStatus } from '@nestjs/common';
import { AppErrorCode } from './AppErrorCode.js';

export class AppException extends HttpException {
  constructor(
    public readonly errorCode: AppErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: unknown,
  ) {
    super(
      {
        errorCode,
        message,
        statusCode,
        ...(details ? { details } : {}),
      },
      statusCode,
    );
  }

  static create(
    errorCode: AppErrorCode,
    message: string,
    details?: unknown,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): AppException {
    return new AppException(errorCode, message, statusCode, details);
  }

  /**
   * NOT_FOUND (404)
   */
  static notFound(message: string, details?: unknown): AppException {
    return new AppException(
      AppErrorCode.NOT_FOUND,
      message,
      HttpStatus.NOT_FOUND,
      details,
    );
  }

  /**
   * VALIDATION (400)
   */
  static validation(message: string, details?: unknown): AppException {
    return new AppException(
      AppErrorCode.VALIDATION_FAILED,
      message,
      HttpStatus.BAD_REQUEST,
      details,
    );
  }

  /**
   * CONFLICT (409)
   */
  static conflict(message: string, details?: unknown): AppException {
    return new AppException(
      AppErrorCode.CONFLICT_EXCEPTION,
      message,
      HttpStatus.CONFLICT,
      details,
    );
  }

  /**
   * UNKNOWN_ERROR (500)
   */
  static unknown(message: string, details?: unknown): AppException {
    return new AppException(
      AppErrorCode.UNKNOWN_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      details,
    );
  }

  /**
   * AI_RESPONSE_INVALID
   */
  static aiResponseInvalid(reason: string, details?: unknown): AppException {
    return new AppException(
      AppErrorCode.AI_RESPONSE_INVALID,
      `AI response invalid: ${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      details,
    );
  }
}
