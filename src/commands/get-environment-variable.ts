import * as vscode from 'vscode';

export async function copyEnvironmentVariable(context: vscode.ExtensionContext) {
    const twPolicy = context.workspaceState.get('TW_POLICY');
    if (twPolicy) {
        await vscode.env.clipboard.writeText(twPolicy as string);
        vscode.window.showInformationMessage('TW_POLICY variable value copied to clipboard.', 'OK');
    } else {
        vscode.window.showErrorMessage('TW_POLICY value not found. Create the variable using Prisma Cloud ');
    }
}