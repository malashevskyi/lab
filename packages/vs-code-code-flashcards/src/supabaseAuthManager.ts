import * as vscode from 'vscode';
import { SupabaseClient, Session } from '@supabase/supabase-js';

const SUPABASE_SESSION_KEY = 'supabase_session';

/**
 * Manages Supabase authentication, session storage, and token refreshing.
 */
export class SupabaseAuthManager {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly client: SupabaseClient
  ) {}

  private ongoingRefreshPromise: Promise<Session | null> | null = null;

  private async setSession(session: Session): Promise<void> {
    await this.context.secrets.store(
      SUPABASE_SESSION_KEY,
      JSON.stringify(session)
    );
  }

  private async getSession(): Promise<Session | null> {
    const sessionStr = await this.context.secrets.get(SUPABASE_SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }

  public async clearSession(): Promise<void> {
    await this.context.secrets.delete(SUPABASE_SESSION_KEY);
  }

  private refreshSession(session: Session): Promise<Session | null> {
    // If a refresh process is already running, we don't start a new one.
    // We simply return the promise of the ongoing operation.
    if (this.ongoingRefreshPromise) {
      return this.ongoingRefreshPromise;
    }

    // If no refresh is running, we start one and set the "lock".
    // We explicitly type the Promise here to fix the TypeScript error.
    this.ongoingRefreshPromise = new Promise<Session | null>(
      async (resolve) => {
        console.log('[AuthManager] Session expired. Attempting to refresh...');
        if (!session.refresh_token) {
          console.warn(
            '[AuthManager] No refresh token available to refresh session.'
          );
          resolve(null); // Resolve with null to signal failure.
          return;
        }

        const { data, error } = await this.client.auth.refreshSession({
          refresh_token: session.refresh_token,
        });

        if (error || !data.session) {
          console.error(
            '[AuthManager] Failed to refresh session:',
            error?.message || 'No session data returned.'
          );
          resolve(null); // Resolve with null to signal failure.
          return;
        }

        console.log('[AuthManager] Session refreshed successfully.');
        await this.setSession(data.session);
        resolve(data.session); // Resolve with the new, valid session.
      }
    ).finally(() => {
      // IMPORTANT: Always release the "lock" when the operation is complete
      // (whether it succeeded or failed), allowing future refreshes.
      this.ongoingRefreshPromise = null;
    });

    return this.ongoingRefreshPromise;
  }

  /**
   * The core method of this class. It ensures a valid session exists,
   * refreshing the token if necessary.
   * @returns An authenticated SupabaseClient instance or null if authentication fails.
   */
  public async getAuthenticatedClient(): Promise<SupabaseClient | null> {
    let session = await this.getSession();

    if (!session) {
      console.log('[AuthManager] No session found.');
      return null;
    }

    const isExpired = session.expires_at! * 1000 < Date.now();

    if (isExpired) {
      console.log('[AuthManager] Session expired. Attempting to refresh...');

      session = await this.refreshSession(session);

      if (!session) {
        console.log(
          '[AuthManager] Unable to refresh session. Clearing stored session.'
        );
        await this.clearSession();
        return null;
      }
    }

    await this.client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    return this.client;
  }

  /**
   * Handles the OAuth callback and stores the new session.
   */
  public async handleLogin(session: Session): Promise<void> {
    await this.setSession(session);
    vscode.window.showInformationMessage('Successfully logged in to Supabase!');
  }
}
