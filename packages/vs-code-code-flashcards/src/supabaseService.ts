import * as vscode from 'vscode';
import { SupabaseAuthManager } from './supabaseAuthManager';

export interface FlashcardPayload {
  question: string;
  answer: string;
  context: string;
  level: string;
  source_url: string;
  next_review_date: string;
}

/**
 * Handles data operations with the Supabase 'flashcards' table.
 */
export class SupabaseService {
  constructor(private readonly authManager: SupabaseAuthManager) {}

  public async insertFlashcard(
    payload: FlashcardPayload
  ): Promise<{ error: any }> {
    const client = await this.authManager.getAuthenticatedClient();

    if (!client) {
      const message = 'Authentication failed. Please log in again.';
      vscode.window.showErrorMessage(message);
      return { error: new Error(message) };
    }

    const { error } = await client.from('flashcards').insert([payload]);

    if (error) {
      vscode.window.showErrorMessage(`Supabase Error: ${error.message}`);
    }

    return { error };
  }
}
