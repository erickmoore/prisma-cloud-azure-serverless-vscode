import * as vscode from 'vscode';
import { installServerlessDefender } from './install-defender';
import { createEnvironmentVariable } from './create-environment-variable';
import { initializeDefender } from './initialize-defender';

export async function completeInstall(context: vscode.ExtensionContext) {
    const azureFunctionsExtensionId = vscode.extensions.getExtension('ms-azuretools.vscode-azurefunctions');

    let createAppServiceVariable = true;
    if (!azureFunctionsExtensionId) {
        const install = await vscode.window.showWarningMessage(
            'Azure Functions extension not detected. You can continue but will need to manually add an App Service variable to complete the installation.',
            'Continue',
            'Install',
            'Cancel'
        );

        if (install === 'Continue') {
            createAppServiceVariable = false;
        }

        if (install === 'Install') {
            vscode.commands.executeCommand('workbench.extensions.search', azureFunctionsExtensionId);
        }

        if (install === 'Cancel') {
            return;
        }
    };

    const options = await vscode.window.showQuickPick(
        [
            { 
                label: 'Install Defender', 
                picked: true, 
                iconPath: new vscode.ThemeIcon('desktop-download'), 
                detail: 'Download packages and update file imports'
            },
            { 
                label: 'Initialize Functions', 
                picked: true, 
                iconPath: new vscode.ThemeIcon('zap'), 
                detail: 'Choose functions to initialize with Defender'
            },            
            { 
                label: 'Generate Defender Key', 
                picked: true, 
                iconPath: new vscode.ThemeIcon('key') ,
                detail: 'Generate private key for App Service variable'
            },
            { 
                label: 'Create App Service Variable', 
                picked: createAppServiceVariable, 
                iconPath: new vscode.ThemeIcon('variable') ,
                detail: 'Note: Requires Azure Function Extension from Microsoft'
            }
        ],
        {
            canPickMany: true,
            placeHolder: 'Select actions to perform'
        }
    );

    if (!options) { return; }

    const actions = options.map(option => option.label);

    // Perform actions based on user selection
    if (actions.includes('Install Defender')) {
        await installServerlessDefender(context);
    }

    if (actions.includes('Initialize Functions')) {
        await initializeDefender();
    }

    if (actions.includes('Generate Defender Key')) {
        await createEnvironmentVariable(context);
    }

    if (actions.includes('Create App Service Variable')) {
        await vscode.commands.executeCommand('azureFunctions.appSettings.add');
    }
}