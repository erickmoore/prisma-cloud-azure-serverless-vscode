import * as vscode from 'vscode';

export async function copyEnvironmentVariable(context: vscode.ExtensionContext) {
    const twPolicy = context.workspaceState.get('TW_POLICY');

    if (!twPolicy) { 
        const selection = await vscode.window.showErrorMessage('TW_POLICY value not found.', 'Create', 'Cancel');

        if (selection === 'Create') { await vscode.commands.executeCommand('extension.create-environment-variable'); };
    };

    await vscode.env.clipboard.writeText(twPolicy as string);
    statusBarMessages(context);
}

export async function statusBarMessages(context: vscode.ExtensionContext){
    const selection = await vscode.window.showInformationMessage('TW_POLICY variable', 'Copy Key', 'Copy Value');

    if (selection === 'Copy Key') {
        await vscode.env.clipboard.writeText('TW_POLICY');
    };

    if (selection === 'Copy Value') {
        const variableValue = await context.workspaceState.get('TW_POLICY');
        await vscode.env.clipboard.writeText(variableValue as string);
    };

};