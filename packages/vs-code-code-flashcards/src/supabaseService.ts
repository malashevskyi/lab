import * as vscode from 'vscode';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

export interface FlashcardPayload {
  question: string;
  answer: string;
  context: string;
  level: string;
  source_url: string;
  next_review_date: string;
}

const SUPABASE_SESSION_KEY = 'supabase_session';

export class SupabaseService {
  private client: SupabaseClient | null = null;

  // We pass the context here to get access to SecretStorage
  constructor(private readonly context: vscode.ExtensionContext) {
    this.initializeClient();
  }

  private initializeClient() {
    const config = vscode.workspace.getConfiguration(
      'code-flashcards.supabase'
    );
    const url = config.get<string>('url');
    const anonKey = config.get<string>('anonKey');

    if (url && anonKey) {
      this.client = createClient(url, anonKey);
    }
  }

  public getSupabaseClient(): SupabaseClient | null {
    return this.client;
  }

  // Securely store the session
  public async setSession(session: Session): Promise<void> {
    await this.context.secrets.store(
      SUPABASE_SESSION_KEY,
      JSON.stringify(session)
    );
  }

  // Securely retrieve the session
  public async getSession(): Promise<Session | null> {
    const sessionStr = await this.context.secrets.get(SUPABASE_SESSION_KEY);
    if (sessionStr) {
      return JSON.parse(sessionStr);
    }
    return null;
  }

  // Clear session on logout
  public async clearSession(): Promise<void> {
    await this.context.secrets.delete(SUPABASE_SESSION_KEY);
  }

  public async insertFlashcard(
    payload: FlashcardPayload
  ): Promise<{ error: any }> {
    if (!this.client) {
      const message = 'Supabase client is not initialized.';
      vscode.window.showErrorMessage(message);
      return { error: new Error(message) };
    }

    // Get the current session to authenticate the request
    const session = await this.getSession();
    if (!session) {
      vscode.window.showErrorMessage(
        'You are not logged in. Please log in to create a flashcard.'
      );
      return { error: new Error('User not authenticated') };
    }

    // Set the session for this specific request
    this.client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    const { error } = await this.client.from('flashcards').insert([payload]);

    if (error) {
      vscode.window.showErrorMessage(`Supabase Error: ${error.message}`);
    }

    return { error };
  }
}
