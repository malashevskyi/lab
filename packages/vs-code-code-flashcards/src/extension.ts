import * as vscode from 'vscode';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StateManager } from './stateManager';
import { Highlighter } from './highlighter';
import { CodeSnippetsProvider } from './codeSnippetsProvider';
import { OpenAIService } from './openAIService';
import { CodeSnippet } from './types';

export function activate(context: vscode.ExtensionContext) {
  const stateManager = new StateManager(context);
  const highlighter = new Highlighter();
  const openAIService = new OpenAIService();
  const snippetsProvider = new CodeSnippetsProvider(stateManager);

  vscode.window.registerTreeDataProvider(
    'code-flashcards-snippets',
    snippetsProvider
  );

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      highlighter.updateDecorations(editor, stateManager.getSnippets());
    }
  });

  if (vscode.window.activeTextEditor) {
    highlighter.updateDecorations(
      vscode.window.activeTextEditor,
      stateManager.getSnippets()
    );
  }

  const toggleHighlightCommand = vscode.commands.registerCommand(
    'code-flashcards.toggleHighlight',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        return;
      }

      const currentSelection = editor.selection;
      const documentUri = editor.document.uri.toString();

      const allSnippets = stateManager.getSnippets();
      const snippetsInOtherFiles = allSnippets.filter(
        (s) => s.uri !== documentUri
      );
      const snippetsInThisFile = allSnippets.filter(
        (s) => s.uri === documentUri
      );

      const snippetsToKeep: CodeSnippet[] = [];
      let wasIntersectionFound = false;

      for (const snippet of snippetsInThisFile) {
        const existingVscodeRange = new vscode.Range(
          new vscode.Position(snippet.range.startLine, 0),
          new vscode.Position(snippet.range.endLine, 999)
        );

        if (currentSelection.intersection(existingVscodeRange)) {
          wasIntersectionFound = true;
        } else {
          snippetsToKeep.push(snippet);
        }
      }

      if (!wasIntersectionFound) {
        const newSnippet: CodeSnippet = {
          id: uuidv4(),
          content: editor.document.getText(currentSelection),
          fileName: path.basename(editor.document.fileName),
          range: {
            startLine: currentSelection.start.line,
            endLine: currentSelection.end.line,
          },
          uri: documentUri,
        };
        snippetsToKeep.push(newSnippet);
      }

      const finalSnippets = [...snippetsInOtherFiles, ...snippetsToKeep];

      await stateManager.setSnippets(finalSnippets);

      highlighter.updateDecorations(editor, stateManager.getSnippets());
      snippetsProvider.refresh();
    }
  );

  const generateFlashcardCommand = vscode.commands.registerCommand(
    'code-flashcards.generateFlashcard',
    async (snippet: CodeSnippet) => {
      if (!snippet) {
        vscode.window.showWarningMessage(
          'Please select a snippet from the sidebar first.'
        );
        return;
      }
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating Flashcard...',
          cancellable: false,
        },
        async () => {
          const question = await openAIService.generateFlashcard(snippet);
          vscode.window.showInformationMessage(`Question: ${question}`);
        }
      );
    }
  );

  context.subscriptions.push(
    toggleHighlightCommand,
    generateFlashcardCommand,
    highlighter
  );
}

export function deactivate() {}
