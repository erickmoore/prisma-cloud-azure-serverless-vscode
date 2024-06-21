import * as vscode from 'vscode';
import { installServerlessDefender } from './install-defender';
import { createEnvironmentVariable } from './create-environment-variable';

export async function completeInstall(context: vscode.ExtensionContext) {
    const options = await vscode.window.showQuickPick(
        [
            { 
                label: 'Install Defender', 
                picked: true, 
                iconPath: new vscode.ThemeIcon('file-binary'), 
                detail: 'Download packages and update selected .csproj file'
            },
            { 
                label: 'Generate App Service Variable', 
                picked: true, 
                iconPath: new vscode.ThemeIcon('variable') ,
                detail: 'Generate Defender private key for App Service variable'
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

    if (actions.includes('Generate App Service Variable')) {
        await createEnvironmentVariable(context);
    }
}