// Main Function:      [ createEnvironmentVariable ]
// Private Functions:  [ storeEnvironmentVariable  ]
// Exported Functions: [ createEnvironmentVariable, resetWorkspaceVariable, statusBarMessages, copyEnvironmentVariable ]
//
import * as vscode from 'vscode';
import { PrismaCloudAPI, ApiConfig } from '../services/PrismaCloudClient';
import { error } from 'console';

interface EnvironmentConfig {
    context: vscode.ExtensionContext;
    variableValue: string;
}

// Function:    createEnvironmentVariable
// Parameters:  [ context: vscode.ExtensionContext, variableValue: string ]
// Calls:       statusBarMessages
// Returns:     none
// Purpose:     Stores variable in vs code workspace as {TW_POLICY: [ varibleValue: string ]} 
//
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

    const defenderKey = await prismaCloud.makeApiCall(createDefenderVariable) as string; 
    if (!defenderKey) { return; };

    const environmentConfig: EnvironmentConfig = {
        context: context,
        variableValue: defenderKey
    };

    try{
        await storeEnvironmentVariable(environmentConfig);
    }
    catch{
        console.log(error);
    }
    
}

// Function:    storeEnvironmentVariable
// Parameters:  [ context: vscode.ExtensionContext, variableValue: string ]
// Calls:       statusBarMessages
// Returns:     none
// Purpose:     Stores variable in vs code workspace as {TW_POLICY: [ varibleValue: string ]} 
//
async function storeEnvironmentVariable(config: EnvironmentConfig){
    const { context, variableValue } = config;

    if (!variableValue) {
        vscode.window.showErrorMessage('Error: Failed to retrieve variable value.');
        return;
    } 

    const addDefenderKey = context.workspaceState.update('TW_POLICY', variableValue);

    if (!addDefenderKey) { 
        vscode.window.showErrorMessage('Unable to add TW_POLICY value to VS Code Workspace');
    };

    await statusBarMessages(context);
}

// Function:    resetWorkspaceVariable
// Parameters:  [ context: vscode.ExtensionContext ]
// Calls:       none
// Returns:     none
// Purpose:     Remove stored value in VSCode workspace for {TW_POLICY} 
//
export function resetWorkspaceVariable(context: vscode.ExtensionContext){
    context.workspaceState.update('TW_POLICY', undefined);
    vscode.window.showInformationMessage('TW_POLICY value removed from workspace', 'OK');
};

// Function:    getEnvironmentVariable
// Parameters:  [ context: vscode.ExtensionContext ]
// Calls:       [ statusBarMessages, createEnvironmentVariable ]
// Returns:     none
// Purpose:     Retreives stored value in VSCode workspace for {TW_POLICY} and copies to clipboard
//              If {TW_POLICY} is not set call createEnvironmentVariable to set the value
//
export async function getEnvironmentVariable(context: vscode.ExtensionContext) {
    const twPolicy = context.workspaceState.get('TW_POLICY');
    
    if (!twPolicy) { 
        const selection = await vscode.window.showErrorMessage('TW_POLICY value not found.', 'Create', 'Cancel');
        
        if (selection === 'Create') { createEnvironmentVariable(context); };
        if (selection === 'Cancel') { return; };
    };
    
    vscode.env.clipboard.writeText(twPolicy as string);
    await statusBarMessages(context);
}

// Function:    statusBarMessages
// Parameters:  [ context: vscode.ExtensionContext ]
// Calls:       none
// Returns:     none
// Purpose:     Displays message for variable creation and prompts to Copy Key or Copy Value
//              which will copy the key or value from TW_POLICY to the clipboard
//
export async function statusBarMessages(context: vscode.ExtensionContext){
    const selection = await vscode.window.showInformationMessage('Variable created and copied to clipboard.', 'Copy Key', 'Copy Value');

    try {
        if (selection === 'Copy Key') {
            vscode.env.clipboard.writeText('TW_POLICY');
        };
    
        if (selection === 'Copy Value') {
            const variableValue = await context.workspaceState.get('TW_POLICY');
            vscode.env.clipboard.writeText(variableValue as string);
            return;
        };
    }
    catch {
        console.log(error);
    }
};