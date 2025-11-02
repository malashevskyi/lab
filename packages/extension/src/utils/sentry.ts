import {
  MessageType,
  type SentryCaptureMessage,
} from '../types/sentry-messages';
import { AxiosError } from 'axios';

export function captureError(error: unknown, extra?: Record<string, any>) {
  let errorMessage: string;
  let errorStack: string | undefined;
  let errorExtra = extra || {};

  if (error instanceof AxiosError) {
    errorMessage = `AxiosError: ${error.message}`;
    errorStack = error.stack;
    errorExtra = {
      ...errorExtra,
      axiosCode: error.code,
      axiosStatus: error.response?.status,
      axiosData: error.response?.data,
      axiosUrl: error.config?.url,
      axiosMethod: error.config?.method,
    };
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack;
    errorExtra = {
      ...errorExtra,
      errorName: error.name,
    };
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
    errorExtra = {
      ...errorExtra,
      rawError: String(error),
    };
  }

  const message: SentryCaptureMessage = {
    type: MessageType.SENTRY_CAPTURE,
    error: errorMessage,
    stack: errorStack,
    extra: errorExtra,
  };

  try {
    chrome.runtime.sendMessage(message, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to send to Sentry:', chrome.runtime.lastError);
      }
    });
  } catch (e) {
    console.error('Exception sending to Sentry:', e);
  }
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  extra?: Record<string, any>
) {
  try {
    chrome.runtime.sendMessage(
      {
        type: MessageType.SENTRY_MESSAGE,
        message,
        level,
        extra,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            'Failed to send message to Sentry:',
            chrome.runtime.lastError
          );
        }
      }
    );
  } catch (e) {
    console.error('Exception sending message to Sentry:', e);
  }
}
