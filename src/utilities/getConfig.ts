// src/commands/config.ts
import * as vscode from 'vscode';

export async function getConfig() {
    const config = vscode.workspace.getConfiguration('serverlessPrismaCloud');
    const identity = config.get('identity') as string;
    const secret = config.get('secret') as string;
    const consolePath = config.get('console') as string;

    if (!identity || !secret || !consolePath) {
        const openSettings = await vscode.window.showWarningMessage(
            'Prisma Cloud Serverless settings are not configured. Please configure them in the settings.', 
            'Open Settings'
        );

        if (openSettings === 'Open Settings') {
            await vscode.commands.executeCommand('workbench.action.openSettings', 'serverlessPrismaCloud');
        }
        return;
    }

    return { identity, secret, consolePath };
}