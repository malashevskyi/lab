import * as vscode from 'vscode';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StateManager } from './stateManager';
import { Highlighter } from './highlighter';
import { FlashcardViewProvider } from './flashcardViewProvider';
import { SupabaseService, FlashcardPayload } from './supabaseService';
import { LoginViewProvider } from './loginViewProvider';
import { CodeSnippet } from './types';
import { extensionToLanguageMap } from './constants';

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

function determinePrimaryLanguage(snippets: CodeSnippet[]): string {
  if (!snippets || snippets.length === 0) return '';
  const languageCounts: { [key: string]: number } = {};
  for (const snippet of snippets) {
    const ext = path.extname(snippet.fileName).toLowerCase();
    const lang = extensionToLanguageMap[ext];
    if (lang) languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  }
  return Object.keys(languageCounts).reduce(
    (a, b) => (languageCounts[a] > languageCounts[b] ? a : b),
    ''
  );
}

export async function activate(context: vscode.ExtensionContext) {
  // --- INITIALIZATION ---
  const stateManager = new StateManager(context);
  const highlighter = new Highlighter();
  const supabaseService = new SupabaseService(context);
  const flashcardProvider = new FlashcardViewProvider(context.extensionUri);
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

  const initialSession = await supabaseService.getSession();
  setAuthenticatedContext(!!initialSession);

  const loginCommand = vscode.commands.registerCommand(
    'code-flashcards.login',
    async () => {
      const supabaseClient = supabaseService.getSupabaseClient();
      if (!supabaseClient) {
        vscode.window.showErrorMessage(
          'Supabase is not configured. Please check URL and Anon Key in settings.'
        );
        return;
      }
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
              await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              const {
                data: { session },
              } = await supabaseClient.auth.getSession();
              if (session) {
                await supabaseService.setSession(session);
                setAuthenticatedContext(true);
                vscode.window.showInformationMessage(
                  'Successfully logged in to Supabase!'
                );
                disposable.dispose();
                resolve();
              } else
                reject(new Error('Could not retrieve session after login.'));
            } else
              reject(
                new Error('Redirect URI did not contain expected tokens.')
              );
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
      await supabaseService.clearSession();
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
      const primaryLanguage = determinePrimaryLanguage(finalSnippets);
      highlighter.updateDecorations(editor, finalSnippets);
      flashcardProvider.update(finalSnippets, primaryLanguage);
    }
  );
  context.subscriptions.push(toggleHighlightCommand);

  flashcardProvider.onDidReceiveMessage(async (message) => {
    switch (message.command) {
      case 'createFlashcard':
        console.log(
          '[Code Flashcards] Received "createFlashcard" command from Webview.'
        );
        const answer = message.snippets
          .map(
            (s: CodeSnippet) =>
              `\`\`\`${path.extname(s.fileName).slice(1) || 'text'}\n${
                s.content
              }\n\`\`\``
          )
          .join('\n\n');
        const payload: FlashcardPayload = {
          question: message.question,
          answer: answer,
          context: message.language,
          level: 'intermediate',
        };
        const { error } = await supabaseService.insertFlashcard(payload);
        if (!error) {
          vscode.window.showInformationMessage(
            'Flashcard created successfully!'
          );
          const emptySnippets: CodeSnippet[] = [];
          await stateManager.setSnippets(emptySnippets);
          flashcardProvider.update(emptySnippets, '');
          vscode.window.visibleTextEditors.forEach((editor) =>
            highlighter.updateDecorations(editor, [])
          );
        }
        return;
      case 'showError':
        vscode.window.showErrorMessage(message.text);
        return;
    }
  });

  if (vscode.window.activeTextEditor) {
    highlighter.updateDecorations(
      vscode.window.activeTextEditor,
      stateManager.getSnippets()
    );
  }
}

export function deactivate() {}
