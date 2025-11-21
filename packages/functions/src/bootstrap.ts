import * as Sentry from "@sentry/node";
import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";

const dsn = defineSecret("SENTRY_DSN");

export function initializeSentry() {
  const dsnValue = dsn.value();
  if (dsnValue && !Sentry.isInitialized()) {
    Sentry.init({
      dsn: dsnValue,
      environment: process.env.NODE_ENV || "production",
      tracesSampleRate: 1.0,
    });
  }
}

admin.initializeApp();
