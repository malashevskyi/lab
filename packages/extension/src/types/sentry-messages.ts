export const MessageType = {
  SENTRY_CAPTURE: 'SENTRY_CAPTURE',
  SENTRY_MESSAGE: 'SENTRY_MESSAGE',
  AI_CHAT_PROMPT: 'AI_CHAT_PROMPT',
} as const;

export interface SentryCaptureMessage {
  type: typeof MessageType.SENTRY_CAPTURE;
  error: string;
  stack?: string;
  extra?: Record<string, any>;
  tags?: Record<string, string>;
}

export interface SentryLogMessage {
  type: typeof MessageType.SENTRY_MESSAGE;
  message: string;
  level: 'info' | 'warning' | 'error';
  extra?: Record<string, any>;
}

export interface AIChatPromptMessage {
  type: typeof MessageType.AI_CHAT_PROMPT;
  prompt: string;
}

export type ExtensionMessage =
  | SentryCaptureMessage
  | SentryLogMessage
  | AIChatPromptMessage;
