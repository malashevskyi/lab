import * as vscode from 'vscode';
import OpenAI from 'openai';
import { CodeSnippet } from './types';

export class OpenAIService {
  private openai: OpenAI | null = null;

  constructor() {
    this.initialize();
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('code-flashcards.openai.apiKey')) {
        this.initialize();
      }
    });
  }

  private initialize() {
    const apiKey = vscode.workspace
      .getConfiguration('code-flashcards.openai')
      .get<string>('apiKey');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.openai = null;
    }
  }

  public async generateFlashcard(snippet: CodeSnippet): Promise<string> {
    if (!this.openai) {
      vscode.window.showErrorMessage(
        'OpenAI API key is not set. Please set it in the settings.'
      );
      return 'Error: API key not set.';
    }

    const model = vscode.workspace
      .getConfiguration('code-flashcards.openai')
      .get<string>('model', 'gpt-3.5-turbo');

    const prompt = `
      Based on the following code snippet from the file "${snippet.fileName}", generate a question for a flashcard.
      The question should make me think about how to write this specific code.
      The answer should be the code snippet itself.
      
      Code:
      \`\`\`
      ${snippet.content}
      \`\`\`
      
      Generate only the question. For example: "How do you implement a function that toggles a decoration in a VS Code extension?".
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      });

      return (
        response.choices[0]?.message?.content?.trim() ??
        'Could not generate a question.'
      );
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage(`Error generating flashcard: ${error}`);
      return 'Error during generation.';
    }
  }
}
