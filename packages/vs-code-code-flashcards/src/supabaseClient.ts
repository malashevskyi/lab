import * as vscode from 'vscode';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates and configures a Supabase client based on VS Code settings.
 * @returns A SupabaseClient instance or null if configuration is missing.
 */
export function createSupabaseClient(): SupabaseClient | null {
  const config = vscode.workspace.getConfiguration('code-flashcards.supabase');
  const url = config.get<string>('url');
  const anonKey = config.get<string>('anonKey');

  if (!url || !anonKey) {
    vscode.window.showErrorMessage(
      'Supabase URL and Anon Key are not configured. Please add them to your settings.'
    );
    return null;
  }

  return createClient(url, anonKey);
}
