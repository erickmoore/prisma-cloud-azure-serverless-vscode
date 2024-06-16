import fetch from 'node-fetch';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import getWorkspaceRoot from '../../utilities/getWorkspaceRoot';
import { updateCsprojFile } from './updateCsprojFile';
import { updateNugetConfig } from './updateNugetConfig';

export interface InstallDefenderConfig {
    consolePath: string;
    token: string;
    context: vscode.ExtensionContext;
    csprojFile: string;
}

export async function installDefender(config: InstallDefenderConfig){
    const { consolePath, token, context, csprojFile } = config;
    const workspaceRoot = await getWorkspaceRoot(); if (!workspaceRoot) { return; }

    try {
        // Step 1: Download Defender Bundle
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

        // Step 2: Extract Defender Bundle
        const unzipper = (await import('unzipper')).default;
        const extractPath = path.join(context.extensionPath, 'twistlock_temp');
        await new Promise((resolve, reject) => {
            fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: extractPath }))
                .on('close', resolve)
                .on('error', reject);
        });

        if (!fs.existsSync(extractPath)) {
            throw new Error('Extraction failed. Directory does not exist.');
        }

        const extractedFiles = fs.readdirSync(extractPath);
        if (extractedFiles.length === 0) {
            throw new Error('Extraction failed. No files found.');
        }
        console.log('Extracted files:', extractedFiles);

        // Step 3: Move Extracted Files and Get Defender Version
        const targetPath = path.join(workspaceRoot, 'twistlock');

        if (fs.existsSync(targetPath)) {
            fs.rmdirSync(targetPath, { recursive: true });
        }

        const sourcePath = path.join(extractPath, 'twistlock');
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Source path does not exist: ${sourcePath}`);
        }

        console.log('Moving files from', sourcePath, 'to', targetPath);
        fs.renameSync(sourcePath, targetPath);
        fs.rmdirSync(extractPath, { recursive: true });

        const nupkgFiles = fs.readdirSync(targetPath).filter(file => file.endsWith('.nupkg'));
        if (nupkgFiles.length === 0) {
            vscode.window.showErrorMessage('Error: No .nupkg file found in the twistlock folder.');
            return;
        }

        const nupkgFile = nupkgFiles[0];
        const twistlockVersion = nupkgFile.split('.').slice(-4, -1).join('.');
    
        await updateCsprojFile(csprojFile, twistlockVersion);
        await updateNugetConfig();


    } catch (error) {
        //vscode.window.showErrorMessage(`Error during Defender installation: ${error.message}`);
        //console.error(error);
    }
}
