import * as vscode from 'vscode';
import { authenticate } from '../utilities/getAuthToken';
import { getConfig } from '../utilities/getConfig';

export async function createEnvironmentVariable(context: vscode.ExtensionContext) {
    const config = await getConfig(); if (!config) { return; }
    const consolePath = config.consolePath;
    const variableEndpoint = `${consolePath}/api/v1/policies/runtime/serverless/encode`;
    const consoleUrl = new URL(consolePath).hostname;
    const headers = { 'Content-Type': 'application/json; charset=UTF-8' };

    const functionName = await vscode.window.showInputBox({ 
        prompt: 'Enter function name:', 
        placeHolder: 'myFunction123', 
        ignoreFocusOut: true, 
        title: 'Step 1 of 2' 
    }); if (!functionName) { return; }

    const functionInfo = {
        consoleAddr: consoleUrl,
        function: functionName,
        provider: 'azure'
    };

    const token = await authenticate(config.consolePath, config.identity, config.secret);
    const variableResponse = await fetch(variableEndpoint, {
        method: 'POST',
        headers: { ...headers, authorization: `Bearer ${token}` },
        body: JSON.stringify(functionInfo)
    });

    const variableData = await variableResponse.json() as { data: string };
    const variableValue = variableData.data;

    if (!variableValue) {
        vscode.window.showErrorMessage('Error: Failed to retrieve variable value.');
        return;
    } 

    await vscode.env.clipboard.writeText(variableValue);
    context.workspaceState.update('TW_POLICY', variableValue);
    vscode.window.showInformationMessage('TW_POLICY variable value is copied to the clipboard.');
}