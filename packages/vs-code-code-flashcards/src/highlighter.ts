import * as vscode from 'vscode';
import { CodeSnippet } from './types';

export class Highlighter {
  private decorationType: vscode.TextEditorDecorationType;

  constructor() {
    this.decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(152, 251, 152, 0.25)',
      isWholeLine: true,
    });
  }

  public updateDecorations(editor: vscode.TextEditor, snippets: CodeSnippet[]) {
    const decorations: vscode.Range[] = snippets
      .filter((snippet) => snippet.uri === editor.document.uri.toString())
      .map((snippet) => {
        const start = new vscode.Position(snippet.range.startLine, 0);
        const end = new vscode.Position(
          snippet.range.endLine,
          editor.document.lineAt(snippet.range.endLine).text.length
        );
        return new vscode.Range(start, end);
      });

    editor.setDecorations(this.decorationType, decorations);
  }

  public dispose() {
    this.decorationType.dispose();
  }
}
