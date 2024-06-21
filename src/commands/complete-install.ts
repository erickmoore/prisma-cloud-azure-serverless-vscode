import * as vscode from 'vscode';
import { installServerlessDefender } from './install-defender';
import { createEnvironmentVariable } from './create-environment-variable';

export async function completeInstall(context: vscode.ExtensionContext) {
    const options = await vscode.window.showQuickPick(
        [
            { 
                label: 'Install Defender', 
                picked: true, 
                iconPath: new vscode.ThemeIcon('desktop-download'), 
                detail: 'Download packages and update file imports'
            },
            { 
                label: 'Generate Defender Key', 
                picked: true, 
                iconPath: new vscode.ThemeIcon('zap') ,
                detail: 'Generate private key for App Service variable'
            },
            { 
                label: 'Create App Service Variable', 
                picked: true, 
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

    if (actions.includes('Generate Defender Key')) {
        await createEnvironmentVariable(context);
    }

    if (actions.includes('Create App Service Variable')) {
        await vscode.commands.executeCommand('azureFunctions.appSettings.add');
    }
}

// await vscode.commands.executeCommand('azureFunctions.appSettings.add');