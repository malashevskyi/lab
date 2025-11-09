import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import MarkdownIt from 'markdown-it';
import { CodeSnippet } from './types';

export class FlashcardViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'code-flashcards.flashcardView';

  private _view?: vscode.WebviewView;
  private md = new MarkdownIt({ html: true });

  private readonly _onDidReceiveMessage = new vscode.EventEmitter<any>();
  public readonly onDidReceiveMessage: vscode.Event<any> =
    this._onDidReceiveMessage.event;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')],
    };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // This runs when the view is actually created
    webviewView.webview.onDidReceiveMessage((message) => {
      // Forward the message to our event emitter
      this._onDidReceiveMessage.fire(message);
    });

    this.update([], '');
  }

  public getView(): vscode.WebviewView | undefined {
    return this._view;
  }

  public update(snippets: CodeSnippet[], language: string) {
    if (this._view) {
      this._view.show?.(true);
      const markdownString = snippets
        .map((s) => {
          const lang = path.extname(s.fileName).slice(1) || 'text';
          return `**${s.fileName} (Lines: ${s.range.startLine + 1}-${
            s.range.endLine + 1
          })**\n\`\`\`${lang}\n${s.content}\n\`\`\``;
        })
        .join('\n\n---\n\n');
      const snippetsHtml = this.md.render(markdownString);
      this._view.webview.postMessage({
        command: 'updateSnippets',
        snippets: snippets,
        language: language,
        snippetsHtml: snippetsHtml,
      });
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const templatePath = path.join(
      this._extensionUri.fsPath,
      'media',
      'flashcardView.html'
    );
    let html = fs.readFileSync(templatePath, 'utf8');
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );
    html = html.replaceAll('{{cspSource}}', webview.cspSource);
    html = html.replaceAll('{{styleUri}}', styleUri.toString());
    html = html.replaceAll('{{scriptUri}}', scriptUri.toString());
    return html;
  }
}
