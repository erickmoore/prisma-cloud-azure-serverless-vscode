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

    const selection = await vscode.window.showInformationMessage('Variable created and copied to clipboard.', 'Continue');

    if (selection === 'Continue') {
        await vscode.env.clipboard.writeText('TW_POLICY');
        //await context.workspaceState.get('TW_POLICY');
    // };
    };

    // if (selection === 'Copy Value') {
    //     await context.workspaceState.get('TW_POLICY');
    // };

}