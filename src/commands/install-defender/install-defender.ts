import * as vscode from 'vscode';
import { authenticate } from '../../utilities/getAuthToken';
import { selectCsprojFile } from './functions/selectCsprojFile';
import { updateCsprojFile } from './functions/updateCsprojFile';
import { updateNugetConfig } from './functions/updateNugetConfig';
import { getConfig } from '../../utilities/getConfig';
import { installDefender } from './functions/defender';

export async function installServerlessDefender(context: vscode.ExtensionContext) {
    let serverlessDefender = vscode.commands.registerCommand('install-defender', async () => {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBar.show();

        const config = await getConfig();
        if (!config) { return; };

        const functionName = await vscode.window.showInputBox({ 
            prompt: 'Enter function name:', 
            placeHolder: 'myFunction123', 
            ignoreFocusOut: true, 
            title: 'Step 1 of 2' 
        });

        if (!functionName) { return; };

        const selectedCsprojFile = await selectCsprojFile();
        if (!selectedCsprojFile) { return; };

        const token = await authenticate(config.consolePath, config.identity, config.secret);
        const twistlockVersion = await installDefender(config.consolePath, token, context, selectedCsprojFile.workspaceRoot);
        if (!twistlockVersion) { return ;};

        if (selectedCsprojFile) { await updateCsprojFile(selectedCsprojFile.selectedFile, twistlockVersion); };

        await updateNugetConfig(selectedCsprojFile.workspaceRoot);

    });

    context.subscriptions.push(serverlessDefender);
}

export function deactivate() {}