import { z } from 'zod';

/**
 * Defines the schema for a typical Google Cloud Service Account JSON key file.
 */
export const googleServiceAccountSchema = z.object({
  /**
   * The type of credential, which must be 'service_account' for a key file.
   */
  type: z.literal('service_account'),

  /**
   * Google Cloud project ID.
   */
  project_id: z.string().min(1),

  /**
   * A unique identifier for the private key (usually a 40-character hex string).
   */
  private_key_id: z
    .string()
    .min(1)
    .regex(
      /^[a-f0-9]{40}$/i,
      'Invalid private key ID format (expected 40 hex chars)',
    ),

  /**
   * The private key in PEM format. Must start with the PEM header.
   */
  private_key: z.string().min(1).startsWith('-----BEGIN'),

  /**
   * The service account's email address (client identifier).
   */
  client_email: z.string().email(),

  /**
   * The unique client ID (a long numeric string).
   */
  client_id: z
    .string()
    .min(1)
    .regex(/^[0-9]+$/, 'Client ID must be a numeric string'),

  /**
   * The URI for the authorization server.
   */
  auth_uri: z.string().url(),

  /**
   * The URI for token exchange.
   */
  token_uri: z.string().url(),

  /**
   * The URI for the certificate provider.
   */
  auth_provider_x509_cert_url: z.string().url(),

  /**
   * The URI for the client's certificate.
   */
  client_x509_cert_url: z.string().url(),

  /**
   * The domain for the service account, typically used in Google Workspace (optional).
   */
  universe_domain: z.string().optional(),
});

/**
 * TypeScript type inferred from the Zod schema.
 */
export type GoogleCredentials = z.infer<typeof googleServiceAccountSchema>;
