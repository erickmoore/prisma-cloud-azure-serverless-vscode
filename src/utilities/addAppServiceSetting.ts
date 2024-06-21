const vscode = require('vscode');

export async function callAzureFunctionsAddAppSettings() {
    try {
        await vscode.commands.executeCommand('azureFunctions.appSettings.add');

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to add Azure Functions app settings`);
    }
};