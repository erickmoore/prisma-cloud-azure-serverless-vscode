import * as vscode from 'vscode';
import { createEnvironmentVariable } from './commands/create-environment-variable';
import { copyEnvironmentVariable } from './commands/get-environment-variable';
import { installServerlessDefender } from './commands/install-defender';
import { completeInstall } from './commands/complete-install';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.create-environment-variable', () => createEnvironmentVariable(context)),
        vscode.commands.registerCommand('extension.get-environment-variable', () => copyEnvironmentVariable(context)),
        //vscode.commands.registerCommand('extension.install-defender', () => installServerlessDefender(context)),
        vscode.commands.registerCommand('extension.complete-install', () => completeInstall(context))
    );
}

export function deactivate() {}