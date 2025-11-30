import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';
import { FlashcardViewProvider } from './flashcardViewProvider';
import { Highlighter } from './highlighter';
import { LoginViewProvider } from './loginViewProvider';
import { StateManager } from './stateManager';
import { SupabaseAuthManager } from './supabaseAuthManager';
import { createSupabaseClient } from './supabaseClient';
import { FlashcardPayload, SupabaseService } from './supabaseService';
import { CodeSnippet, StackType } from './types';
import { formatSnippetsAsMarkdown } from './utils/formatSnippetsAsMarkdown';

// This will be our URI handler for the OAuth callback
class UriHandler
  extends vscode.EventEmitter<vscode.Uri>
  implements vscode.UriHandler
{
  public handleUri(uri: vscode.Uri) {
    this.fire(uri);
  }
}

// Helper function to set the authentication context for VS Code UI
function setAuthenticatedContext(value: boolean) {
  vscode.commands.executeCommand(
    'setContext',
    'code-flashcards.isAuthenticated',
    value
  );
}

export async function activate(context: vscode.ExtensionContext) {
  const stateManager = new StateManager(context);
  const highlighter = new Highlighter();

  const supabaseClient = createSupabaseClient();

  if (!supabaseClient) return;

  let stacks: StackType[] = [];

  const authManager = new SupabaseAuthManager(context, supabaseClient);
  const supabaseService = new SupabaseService(authManager);

  const initialSession = await authManager.getSession();
  setAuthenticatedContext(!!initialSession);

  const { data: stacksData } = await supabaseService.getStacks();
  if (stacksData) stacks = stacksData;

  const flashcardProvider = new FlashcardViewProvider(
    context.extensionUri,
    stateManager,
    stacks.map((item: StackType) => item.id)
  );
  const loginProvider = new LoginViewProvider();

  // --- REGISTER ALL PROVIDERS AND VIEWS ---
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      FlashcardViewProvider.viewType,
      flashcardProvider
    ),
    vscode.window.registerTreeDataProvider(
      'code-flashcards.loginView',
      loginProvider
    ),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor)
        highlighter.updateDecorations(editor, stateManager.getSnippets());
    })
  );

  const uriHandler = new UriHandler();
  context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));

  // Check if session is expired on startup and clear it if necessary

  const loginCommand = vscode.commands.registerCommand(
    'code-flashcards.login',
    async () => {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `vscode://${context.extension.id}/callback` },
      });
      if (data.url) {
        vscode.env.openExternal(vscode.Uri.parse(data.url));
      } else if (error) {
        vscode.window.showErrorMessage(
          `Error during login attempt: ${error.message}`
        );
      }
      const codeExchangePromise = new Promise<void>((resolve, reject) => {
        const disposable = uriHandler.event(async (uri) => {
          try {
            const hash = new URLSearchParams(uri.fragment);
            const accessToken = hash.get('access_token');
            const refreshToken = hash.get('refresh_token');
            if (accessToken && refreshToken) {
              const {
                data: { session },
              } = await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (session) {
                await authManager.handleLogin(session);
                setAuthenticatedContext(true);
                disposable.dispose();
                resolve();
              } else {
                reject(new Error('Could not retrieve session after login.'));
              }
            } else {
              reject(
                new Error('Redirect URI did not contain expected tokens.')
              );
            }
          } catch (e: any) {
            reject(e);
          }
        });
      });
      try {
        await codeExchangePromise;
      } catch (err: any) {
        vscode.window.showErrorMessage(`Login failed: ${err.message}`);
      }
    }
  );
  context.subscriptions.push(loginCommand);

  const logoutCommand = vscode.commands.registerCommand(
    'code-flashcards.logout',
    async () => {
      await authManager.clearSession();
      setAuthenticatedContext(false);
      vscode.window.showInformationMessage('Successfully logged out.');
    }
  );
  context.subscriptions.push(logoutCommand);

  const toggleHighlightCommand = vscode.commands.registerCommand(
    'code-flashcards.toggleHighlight',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) return;
      const currentSelection = editor.selection;
      const documentUri = editor.document.uri.toString();
      const allSnippets = stateManager.getSnippets();
      const snippetsInOtherFiles = allSnippets.filter(
        (s) => s.uri !== documentUri
      );
      const snippetsInThisFile = allSnippets.filter(
        (s) => s.uri === documentUri
      );
      let snippetsToKeep: CodeSnippet[] = [];
      let wasIntersectionFound = false;
      for (const snippet of snippetsInThisFile) {
        const existingVscodeRange = new vscode.Range(
          new vscode.Position(snippet.range.startLine, 0),
          new vscode.Position(snippet.range.endLine, 999)
        );
        if (currentSelection.intersection(existingVscodeRange))
          wasIntersectionFound = true;
        else snippetsToKeep.push(snippet);
      }
      if (!wasIntersectionFound) {
        const startLine = currentSelection.start.line;
        const endLine = currentSelection.end.line;
        const fullLineRange = new vscode.Range(
          new vscode.Position(startLine, 0),
          new vscode.Position(
            endLine,
            editor.document.lineAt(endLine).text.length
          )
        );
        snippetsToKeep.push({
          id: uuidv4(),
          content: editor.document.getText(fullLineRange),
          fileName: path.basename(editor.document.fileName),
          range: { startLine, endLine },
          uri: documentUri,
        });
      }
      const finalSnippets = [...snippetsInOtherFiles, ...snippetsToKeep];
      await stateManager.setSnippets(finalSnippets);
      const selectedTechnology = stateManager.getSelectedTechnology();
      highlighter.updateDecorations(editor, finalSnippets);
      flashcardProvider.update(finalSnippets, selectedTechnology);
    }
  );
  context.subscriptions.push(toggleHighlightCommand);

  flashcardProvider.onDidReceiveMessage(async (message) => {
    switch (message.command) {
      case 'selectTechnology':
        await stateManager.setSelectedTechnology(message.technology);
        return;
      case 'clearAllSnippets':
        try {
          console.log(
            '[Code Flashcards] Received "clearAllSnippets" command from Webview.'
          );
          const emptySnippets: CodeSnippet[] = [];
          await stateManager.setSnippets(emptySnippets);
          const selectedTech = stateManager.getSelectedTechnology();
          flashcardProvider.update(emptySnippets, selectedTech);
          vscode.window.visibleTextEditors.forEach((editor) =>
            highlighter.updateDecorations(editor, [])
          );
          vscode.window.showInformationMessage('All snippets cleared.');
        } catch (error: any) {
          vscode.window.showErrorMessage(
            `Failed to clear snippets: ${error.message}`
          );
        }
        return;
      case 'createFlashcard':
        try {
          console.log(
            '[Code Flashcards] Received "createFlashcard" command from Webview.'
          );
          const answer = formatSnippetsAsMarkdown(message.snippets);

          const payload: FlashcardPayload = {
            question: message.question,
            answer: answer,
            context: message.technology,
            level: '-',
            source_url: 'https://vs-code',
            next_review_date: new Date().toISOString(),
          };
          const { error } = await supabaseService.insertFlashcard(payload);
          if (!error) {
            vscode.window.showInformationMessage(
              'Flashcard created successfully!'
            );
            const emptySnippets: CodeSnippet[] = [];
            await stateManager.setSnippets(emptySnippets);
            const selectedTech = stateManager.getSelectedTechnology();
            flashcardProvider.update(emptySnippets, selectedTech);
            vscode.window.visibleTextEditors.forEach((editor) =>
              highlighter.updateDecorations(editor, [])
            );
          }
        } finally {
          flashcardProvider.signalOperationComplete();
        }
        return;
      case 'showError':
        vscode.window.showErrorMessage(message.text);
        return;
    }
  });

  if (vscode.window.activeTextEditor) {
    const savedSnippets = stateManager.getSnippets();
    highlighter.updateDecorations(
      vscode.window.activeTextEditor,
      savedSnippets
    );
  }
}

export function deactivate() {}
