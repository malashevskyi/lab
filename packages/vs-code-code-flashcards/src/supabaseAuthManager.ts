import * as vscode from 'vscode';
import { SupabaseClient, Session } from '@supabase/supabase-js';

const SUPABASE_SESSION_KEY = 'supabase_session';

/**
 * Manages Supabase authentication, session storage, and token refreshing.
 */
export class SupabaseAuthManager {
  private client: SupabaseClient;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly initialClient: SupabaseClient
  ) {
    this.client = initialClient;

    this.client.auth.onAuthStateChange((event, session) => {
      console.log(`[AuthManager] Auth state changed: ${event}`);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          this.setSession(session);
        }
      } else if (event === 'SIGNED_OUT') {
        this.clearSession();
      }
    });
  }

  private ongoingRefreshPromise: Promise<Session | null> | null = null;

  private async setSession(session: Session): Promise<void> {
    await this.context.secrets.store(
      SUPABASE_SESSION_KEY,
      JSON.stringify(session)
    );
  }

  public async getSession(): Promise<Session | null> {
    const sessionStr = await this.context.secrets.get(SUPABASE_SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }

  public async clearSession(): Promise<void> {
    await this.context.secrets.delete(SUPABASE_SESSION_KEY);
  }

  public async getAuthenticatedClient(): Promise<SupabaseClient | null> {
    const session = await this.getSession();
    if (session) {
      await this.client.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      return this.client;
    }
    return null;
  }

  /**
   * Handles the OAuth callback and stores the new session.
   */
  public async handleLogin(session: Session): Promise<void> {
    await this.setSession(session);
    vscode.window.showInformationMessage('Successfully logged in to Supabase!');
  }
}
