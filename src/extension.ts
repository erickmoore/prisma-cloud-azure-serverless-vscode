import * as vscode from 'vscode';
import { createEnvironmentVariable } from './commands/create-environment-variable';
import { copyEnvironmentVariable } from './commands/get-environment-variable';
import { installServerlessDefender } from './commands/install-defender';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.create-environment-variable', () => createEnvironmentVariable(context)),
        vscode.commands.registerCommand('extension.get-environment-variable', () => copyEnvironmentVariable(context)),
        vscode.commands.registerCommand('extension.install-defender', () => installServerlessDefender(context))
    );
}

export function deactivate() {}