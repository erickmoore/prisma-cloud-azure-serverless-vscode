import fetch from 'node-fetch';
import * as vscode from 'vscode';

export interface AuthConfig {
    consolePath: string;
    identity: string;
    secret: string;
}

export interface ApiConfig {
    url: string;
    headers: Record<string, string>;
    method: 'GET' | 'POST';
    body?: any;
}

export async function makeApiCall(api: ApiConfig){
    const { url: url, headers: headers, method: method, body: body } = api;

    const authValues = await extensionAuthSettings(); if (!extensionAuthSettings) { return; };
    const authToken = await authenticate(authValues); if (!authToken) { return; };

    api.headers['authorization'] = `Bearer ${authToken}`;

    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });

    if (response.headers.get('content-type')?.includes('application/zip')) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return buffer;
    };

    if (response.headers.get('content-type')?.includes('application/json')){
        return response.json();
    };

}

async function authenticate(prismaCloud: AuthConfig): Promise<string> {
    const authEndpoint = `${prismaCloud.consolePath}/api/v32.06/authenticate`;
    const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
    const payload = { username: prismaCloud.identity, password: prismaCloud.secret };

    const response = await fetch(authEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Failed to authenticate with Prisma Cloud.');
    }

    const data = await response.json() as { token: string };
    return data.token;
}

async function extensionAuthSettings(): Promise<AuthConfig> {
    // The values for the workspace config exist in package.json in the Contributes -> Configuration -> Properties
    const config = vscode.workspace.getConfiguration('PrismaCloudEnt');
    const identity = config.get('identity') as string;
    const secret = config.get('secret') as string;
    const consolePath = config.get('console') as string;

    if (!identity || !secret || !consolePath) {
        const openSettings = await vscode.window.showWarningMessage(
            'Prisma Cloud Serverless settings are not configured. Please configure them in the settings.', 
            'Open Settings'
        );

        if (openSettings === 'Open Settings') {
            await vscode.commands.executeCommand('workbench.action.openSettings', 'PrismaCloudEnt');
        }
    }

    return { identity: identity, secret: secret, consolePath: consolePath };
}