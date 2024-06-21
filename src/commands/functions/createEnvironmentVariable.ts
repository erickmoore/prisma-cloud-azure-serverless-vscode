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

    await statusBarMessages(context);

}

export async function resetWorkspaceVariable(context: vscode.ExtensionContext){
    context.workspaceState.update('TW_POLICY', undefined);
    await vscode.window.showInformationMessage('TW_POLICY value removed from workspace', 'OK');
};

export async function statusBarMessages(context: vscode.ExtensionContext){

    const selection = await vscode.window.showInformationMessage('Variable created and copied to clipboard.', 'Copy Key', 'Copy Value');

    if (selection === 'Copy Key') {
        await vscode.env.clipboard.writeText('TW_POLICY');
    };

    if (selection === 'Copy Value') {
        const variableValue = await context.workspaceState.get('TW_POLICY');
        await vscode.env.clipboard.writeText(variableValue as string);
    };

};