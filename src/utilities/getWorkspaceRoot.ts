import * as vscode from 'vscode';

export default async function getWorkspaceRoot() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Error: No workspace folder is open.');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    return workspaceRoot;
}