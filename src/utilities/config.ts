// src/commands/config.ts
import * as vscode from 'vscode';

export function getConfig() {
    const config = vscode.workspace.getConfiguration('serverlessPrismaCloud');
    const identity = config.get('identity') as string;
    const secret = config.get('secret') as string;
    const consolePath = config.get('console') as string;

    if (!identity || !secret || !consolePath) {
        vscode.window.showWarningMessage('Prisma Cloud Serverless settings are not configured. Please configure them in the settings.');
        return null;
    }

    return { identity, secret, consolePath };
}