import * as fs from 'fs';
import MarkdownIt from 'markdown-it';
import mdhljs from 'markdown-it-highlightjs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CodeSnippet } from './types';

import hljs from 'highlight.js/lib/core';
import { StateManager } from './stateManager';

import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
// import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import sql from 'highlight.js/lib/languages/sql';
// import javahtml from 'highlight.js/lib/languages/xml'; // for HTML
import json from 'highlight.js/lib/languages/json';
import { formatSnippetsAsMarkdown } from './utils/formatSnippetsAsMarkdown';
import { TECHNOLOGIES } from './constants';
// import rust from 'highlight.js/lib/languages/rust';
// import go from 'highlight.js/lib/languages/go';
// import java from 'highlight.js/lib/languages/java';
// import php from 'highlight.js/lib/languages/php';
// import ruby from 'highlight.js/lib/languages/ruby';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
// hljs.registerLanguage('python', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
// hljs.registerLanguage('html', javahtml);
hljs.registerLanguage('json', json);
// hljs.registerLanguage('rust', rust);
// hljs.registerLanguage('go', go);
// hljs.registerLanguage('java', java);
// hljs.registerLanguage('php', php);
// hljs.registerLanguage('ruby', ruby);
// For TSX/JSX, typescript and javascript highlighters are often sufficient
hljs.registerLanguage('tsx', typescript);
hljs.registerLanguage('jsx', javascript);

export class FlashcardViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'code-flashcards.flashcardView';

  private _view?: vscode.WebviewView;
  private md = new MarkdownIt({ html: true }).use(mdhljs, { hljs });

  private readonly _onDidReceiveMessage = new vscode.EventEmitter<any>();
  public readonly onDidReceiveMessage: vscode.Event<any> =
    this._onDidReceiveMessage.event;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly stateManager: StateManager
  ) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')],
    };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // This runs when the view is actually created
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === 'webviewReady') {
        this.updateWithCurrentState();
        return;
      }
      // Forward the message to our event emitter
      this._onDidReceiveMessage.fire(message);
    });

    // Update view when it becomes visible, to reflect current state
    // otherwise selected snippets are not shown
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.updateWithCurrentState();
      }
    });
  }

  private updateWithCurrentState() {
    const snippets = this.stateManager.getSnippets();
    const selectedTechnology = this.stateManager.getSelectedTechnology();
    this.update(snippets, selectedTechnology, TECHNOLOGIES);
  }

  public getView(): vscode.WebviewView | undefined {
    return this._view;
  }

  public signalOperationComplete() {
    if (this._view) {
      this._view.webview.postMessage({ command: 'operationComplete' });
    }
  }

  public update(
    snippets: CodeSnippet[],
    selectedTechnology?: string,
    technologies?: string[]
  ) {
    if (this._view) {
      this._view.show?.(true);
      const markdownString = formatSnippetsAsMarkdown(snippets);
      const snippetsHtml = this.md.render(markdownString);
      this._view.webview.postMessage({
        command: 'updateSnippets',
        snippets: snippets,
        snippetsHtml: snippetsHtml,
        selectedTechnology: selectedTechnology,
        allTechnologies: technologies,
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
    const hljsThemeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'hljs-theme.css')
    );

    html = html.replaceAll('{{cspSource}}', webview.cspSource);
    html = html.replaceAll('{{styleUri}}', styleUri.toString());
    html = html.replaceAll('{{scriptUri}}', scriptUri.toString());
    html = html.replaceAll('{{hljsThemeUri}}', hljsThemeUri.toString());
    return html;
  }
}
