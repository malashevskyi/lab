import * as vscode from 'vscode';
import { CodeSnippet } from './types';

const SNIPPETS_STORAGE_KEY = 'code-flashcards.snippets';
const SELECTED_TECHNOLOGY_KEY = 'code-flashcards.selectedTechnology';

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

  public getSelectedTechnology(): string {
    return this.context.globalState.get<string>(
      SELECTED_TECHNOLOGY_KEY,
      'Node.js'
    );
  }

  public async setSelectedTechnology(technology: string): Promise<void> {
    await this.context.globalState.update(SELECTED_TECHNOLOGY_KEY, technology);
  }
}
