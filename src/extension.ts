import * as vscode from 'vscode';
import { createEnvironmentVariable, resetWorkspaceVariable, copyEnvironmentVariable } from './commands/environment-variables';
import { downloadDefender } from './commands/download-defender';
import { installDefender } from './commands/install-defender';
import { initializeDefender } from './commands/initialize-defender';
import { createSampleFunction } from './commands/create-sample-functions';

export function activate(context: vscode.ExtensionContext): void {

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "Serverless Defender";
    statusBarItem.tooltip = "Prisma Cloud Serverless Defender",
    statusBarItem.command = 'pcasd.get-environment-variable';

    statusBarItem.show();

    context.subscriptions.push(
        vscode.commands.registerCommand('pcasd.install-defender', () => installDefender(context)),
        vscode.commands.registerCommand('pcasd.create-environment-variable', () => createEnvironmentVariable(context)),
        vscode.commands.registerCommand('pcasd.get-environment-variable', () => copyEnvironmentVariable(context)),
        //vscode.commands.registerCommand('pcasd.download-defender', () => downloadDefender(context)),
        vscode.commands.registerCommand('pcasd.reset-workspace-variable', () => resetWorkspaceVariable(context)),
        vscode.commands.registerCommand('pcasd.initialize-defender', () => initializeDefender()),
        vscode.commands.registerCommand('pcasd.create-sample-function', () => createSampleFunction(context)),
    );
}

export function deactivate() {}