import * as vscode from 'vscode';
import { CodeSnippet } from './types';
import { StateManager } from './stateManager';

export class CodeSnippetsProvider
  implements vscode.TreeDataProvider<CodeSnippet>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    CodeSnippet | undefined | null | void
  > = new vscode.EventEmitter<CodeSnippet | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CodeSnippet | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private stateManager: StateManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CodeSnippet): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      element.fileName,
      vscode.TreeItemCollapsibleState.Collapsed
    );
    treeItem.description = `Lines ${element.range.startLine + 1}-${
      element.range.endLine + 1
    }`;
    treeItem.id = element.id;
    treeItem.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [
        vscode.Uri.parse(element.uri),
        {
          selection: new vscode.Range(
            element.range.startLine,
            0,
            element.range.endLine,
            0
          ),
        },
      ],
    };
    return treeItem;
  }

  getChildren(element?: CodeSnippet): Thenable<CodeSnippet[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.stateManager.getSnippets());
    }
  }
}
