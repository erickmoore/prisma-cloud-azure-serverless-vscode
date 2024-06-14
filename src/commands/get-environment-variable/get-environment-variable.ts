import * as vscode from 'vscode';
import { authenticate } from '../../utilities/getAuthToken';
import { getConfig } from '../../utilities/getConfig';

export async function getEnvironmentVariable(functionName: string, context: vscode.ExtensionContext) {

    const config = await getConfig();
    if (!config) { return; };
    const token = await authenticate(config.consolePath, config.identity, config.secret);
    const consolePath = config.consolePath;

    const variableEndpoint = `${consolePath}/api/v1/policies/runtime/serverless/encode`;
    const consoleUrl = new URL(consolePath).hostname;
    const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
    const functionInfo = {
        consoleAddr: consoleUrl,
        function: functionName,
        provider: 'azure'
    };

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

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.get-environment-variable', async () => {
            const twPolicy = context.workspaceState.get('TW_POLICY');
            if (twPolicy) {
                await vscode.env.clipboard.writeText(twPolicy as string);
                vscode.window.showInformationMessage('TW_POLICY variable value copied to clipboard.');
            } else {
                vscode.window.showErrorMessage('TW_POLICY value not found.');
            }
        })
    );

}

export function deactivate() {}