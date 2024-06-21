import * as vscode from 'vscode';

export interface EnvironmentConfig {
    context: vscode.ExtensionContext;
    variableValue: any;
}

export async function storeEnvironmentVariable(config: EnvironmentConfig){
    const { context: context, variableValue: variableValue } = config;

    if (!variableValue) {
        vscode.window.showErrorMessage('Error: Failed to retrieve variable value.');
        return;
    } 

    await vscode.env.clipboard.writeText(variableValue);
    context.workspaceState.update('TW_POLICY', variableValue);
    vscode.window.showInformationMessage('TW_POLICY variable value copied to clipboard.', 'OK');
}