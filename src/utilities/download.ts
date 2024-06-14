// src/commands/download.ts
import fetch from 'node-fetch';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function downloadBundle(consolePath: string, token: string, context: vscode.ExtensionContext) {
    const bundleEndpoint = `${consolePath}/api/v1/defenders/serverless/bundle`;
    const headers = {
        'Content-Type': 'application/octet-stream',
        authorization: `Bearer ${token}`,
    };

    const response = await fetch(bundleEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ runtime: 'dotnet', provider: 'azure' }),
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zipPath = path.join(context.extensionPath, 'twistlock_serverless_defender.zip');
    fs.writeFileSync(zipPath, buffer);

    if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
        throw new Error('Failed to download defender bundle. ZIP file is empty.');
    }

    return zipPath;
}