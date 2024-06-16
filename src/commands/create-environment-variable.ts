import * as vscode from 'vscode';
import { authenticate, AuthenticateConfig } from '../utilities/getAuthToken';
import { getExtensionSettings } from '../utilities/getExtensionSettings';

export async function createEnvironmentVariable(context: vscode.ExtensionContext) {
    const prismaCloud = await getExtensionSettings(); if (!prismaCloud) { return; };
    const { consolePath, identity, secret } = prismaCloud;

    const authConfig: AuthenticateConfig = {
        consolePath: consolePath,
        identity: identity,
        secret: secret
    };

    const appServiceVariableGenerator = `${consolePath}/api/v1/policies/runtime/serverless/encode`;
    const consoleUrl = new URL(consolePath).hostname;
    const headers = { 'Content-Type': 'application/json; charset=UTF-8' };

    const functionName = await vscode.window.showInputBox({ 
        prompt: 'Enter function name:', 
        placeHolder: 'myFunction123', 
        ignoreFocusOut: true, 
        title: 'Generate App Service Environment Variable' 
    }); if (!functionName) { return; }

    const functionInfo = {
        consoleAddr: consoleUrl,
        function: functionName,
        provider: 'azure'
    };

    const token = await authenticate(authConfig);

    const variableResponse = await fetch(appServiceVariableGenerator, {
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
    vscode.window.showInformationMessage('TW_POLICY variable value copied to clipboard.');
}