import * as vscode from 'vscode';

export class LoginViewProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const loginItem = new vscode.TreeItem('Login to Supabase to get started');
    loginItem.command = {
      command: 'code-flashcards.login',
      title: 'Login to Supabase',
      tooltip: 'Login to your Supabase account',
    };
    loginItem.iconPath = new vscode.ThemeIcon('sign-in');

    return Promise.resolve([loginItem]);
  }
}
