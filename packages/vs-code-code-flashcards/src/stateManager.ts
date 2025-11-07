import * as vscode from 'vscode';
import { CodeSnippet } from './types';

const SNIPPETS_STORAGE_KEY = 'code-flashcards.snippets';

export class StateManager {
  constructor(private context: vscode.ExtensionContext) {}

  public getSnippets(): CodeSnippet[] {
    return this.context.globalState.get<CodeSnippet[]>(
      SNIPPETS_STORAGE_KEY,
      []
    );
  }

  public async setSnippets(snippets: CodeSnippet[]): Promise<void> {
    await this.context.globalState.update(SNIPPETS_STORAGE_KEY, snippets);
  }

  public async addSnippet(snippet: CodeSnippet): Promise<void> {
    const snippets = this.getSnippets();
    const updatedSnippets = [...snippets, snippet];
    await this.setSnippets(updatedSnippets);
  }

  public async removeSnippet(snippetId: string): Promise<void> {
    const snippets = this.getSnippets();
    const updatedSnippets = snippets.filter((s) => s.id !== snippetId);
    await this.setSnippets(updatedSnippets);
  }
}
