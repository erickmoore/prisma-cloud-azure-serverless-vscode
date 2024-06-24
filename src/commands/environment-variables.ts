import * as vscode from 'vscode';
import { PrismaCloudAPI, ApiConfig } from '../services/PrismaCloudClient';

// Main Function:      [ createEnvironmentVariable ]
// Private Functions:  [ storeEnvironmentVariable  ]
// Exported Functions: [ createEnvironmentVariable, resetWorkspaceVariable, statusBarMessages, copyEnvironmentVariable ]
//

interface EnvironmentConfig {
    context: vscode.ExtensionContext;
    variableValue: string;
}

export async function createEnvironmentVariable(context: vscode.ExtensionContext) {
    const prismaCloud = PrismaCloudAPI.getInstance();
    const consolePath = await prismaCloud.getConsolePath() as string;

    const functionName = await vscode.window.showInputBox({
        prompt: 'Enter function hostname (first word after https://)',
        placeHolder: 'myFunctionName',
        title: 'Generate Serverless Defender App Service Variable',
        ignoreFocusOut: true
    }); if (!functionName) { return; };

    const createDefenderVariable: ApiConfig = {
        apiEndpoint: '/api/v1/policies/runtime/serverless/encode',
        isFile: false,
        headers: { 
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: {
            'consoleAddr': new URL(consolePath).hostname,
            'function': functionName,
            'provider': 'azure'
        }
    };

    const variableValue = await prismaCloud.makeApiCall(createDefenderVariable) as string; 
    if (!variableValue) { return; };

    const environmentConfig: EnvironmentConfig = {
        context: context,
        variableValue: variableValue
    };

    storeEnvironmentVariable(environmentConfig);
}

// Function:    storeEnvironmentVariable
// Parameters:  [ context: vscode.ExtensionContext, variableValue: string ]
// Calls:       statusBarMessages
// Returns:     none
// Purpose:     Stores variable in vs code workspace as {TW_POLICY: [ varibleValue: string ]} 
//
function storeEnvironmentVariable(config: EnvironmentConfig){
    const { context: context, variableValue: variableValue } = config;

    if (!variableValue) {
        vscode.window.showErrorMessage('Error: Failed to retrieve variable value.');
        return;
    } 

    vscode.env.clipboard.writeText(variableValue);
    context.workspaceState.update('TW_POLICY', variableValue);

    statusBarMessages(context);
}

export function resetWorkspaceVariable(context: vscode.ExtensionContext){
    context.workspaceState.update('TW_POLICY', undefined);
    vscode.window.showInformationMessage('TW_POLICY value removed from workspace', 'OK');
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

export async function copyEnvironmentVariable(context: vscode.ExtensionContext) {
    const twPolicy = context.workspaceState.get('TW_POLICY');

    if (!twPolicy) { 
        const selection = await vscode.window.showErrorMessage('TW_POLICY value not found.', 'Create', 'Cancel');

        if (selection === 'Create') { await vscode.commands.executeCommand('extension.create-environment-variable'); };
    };

    await vscode.env.clipboard.writeText(twPolicy as string);
    statusBarMessages(context);
}