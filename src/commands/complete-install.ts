import * as vscode from 'vscode';
import { downloadDefender } from './download-defender';
import { createEnvironmentVariable } from './create-environment-variable';
import { initializeDefender } from './initialize-defender';
import { createSampleFunction } from './create-sample-functions';

export async function completeInstall(context: vscode.ExtensionContext) {
    const createAppServiceVariable = await checkAzureServerlessExtension('ms-azuretools.vscode-azurefunctions');
    if (createAppServiceVariable === undefined) { return; }

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
                detail: 'Use Microsoft Azure Function Extension to create environment variable'
            },
            { 
                label: 'Create Sample Functions', 
                picked: false, 
                iconPath: new vscode.ThemeIcon('file-code'), 
                detail: 'Create sample functions in project to test Defender'
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
        await downloadDefender(context);
    }

    if (actions.includes('Initialize Functions')) {
        await initializeDefender();
    }

    if (actions.includes('Generate Defender Key')) {
        await createEnvironmentVariable(context);
    }

    if (actions.includes('Create App Service Variable')) {
        if (createAppServiceVariable) {
            await vscode.commands.executeCommand('azureFunctions.appSettings.add');
         }
    }

    if (actions.includes('Create Sample Functions')) {
        await createSampleFunction(context);
    }

}

async function checkAzureServerlessExtension(extensionId: string): Promise<boolean | undefined> {
    const extensionCheck = vscode.extensions.getExtension(extensionId);

    if (!extensionCheck) {
        const install = await vscode.window.showWarningMessage(
            'Azure Functions extension not detected. You can continue but will need to manually add an App Service variable to complete the installation.',
            'Continue',
            'Install Function Extension',
            'Cancel'
        );

        if (install === 'Install Function Extension') {
            vscode.commands.executeCommand('workbench.extensions.search', 'ms-azuretools.vscode-azurefunctions');
            return;
        }

        if (install === 'Continue') {
            return false;
        }

        if (install === 'Cancel') {
            return;
        }
    };

    return true;
};