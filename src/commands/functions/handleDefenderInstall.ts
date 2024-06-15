import * as vscode from 'vscode';
import { getConfig } from '../../utilities/getConfig';
import { authenticate } from '../../utilities/getAuthToken';
import { installDefender, InstallDefenderConfig } from './installDefender';

export async function handleDefenderInstall(context: vscode.ExtensionContext) {
    const config = await getConfig();
    if (!config) { return; }

    const token = await authenticate(config.consolePath, config.identity, config.secret);
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Error: No workspace folder is open.');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    const installDefenderConfig: InstallDefenderConfig = {
        consolePath: config.consolePath,
        token,
        context,
        workspaceRoot
    };

    const version = await installDefender(installDefenderConfig);
    if (version) {
        vscode.window.showInformationMessage(`Defender installed successfully. Version: ${version}`);
    }
}
