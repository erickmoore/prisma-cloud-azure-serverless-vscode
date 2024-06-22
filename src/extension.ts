import * as vscode from 'vscode';
import { createEnvironmentVariable } from './commands/create-environment-variable';
import { copyEnvironmentVariable } from './commands/get-environment-variable';
import { installServerlessDefender } from './commands/install-defender';
import { completeInstall } from './commands/complete-install';
import { resetWorkspaceVariable } from './commands/functions/createEnvironmentVariable';
import { initializeDefender } from './commands/initialize-defender';

export function activate(context: vscode.ExtensionContext): void {

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "Serverless Defender";
    statusBarItem.tooltip = "Prisma Cloud Serverless Defender",
    statusBarItem.command = 'extension.get-environment-variable';

    statusBarItem.show();

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.create-environment-variable', () => createEnvironmentVariable(context)),
        vscode.commands.registerCommand('extension.get-environment-variable', () => copyEnvironmentVariable(context)),
        //vscode.commands.registerCommand('extension.install-defender', () => installServerlessDefender(context)),
        vscode.commands.registerCommand('extension.complete-install', () => completeInstall(context)),
        vscode.commands.registerCommand('extension.reset-workspace-variable', () => resetWorkspaceVariable(context)),
        vscode.commands.registerCommand('extension.initialize-defender', () => initializeDefender())
    );
}

export function deactivate() {}