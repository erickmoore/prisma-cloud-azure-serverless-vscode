import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import getWorkspaceRoot from "../../utilities/getWorkspaceRoot";

export interface ServerlessConfg {
    context: vscode.ExtensionContext
    fileContent: Buffer
}

export async function installServerlessDefender(serverless: ServerlessConfg) {
    const defenderPath = await downloadDefender(serverless); if (!defenderPath){ return; }
    await unzipDefender(serverless, defenderPath);

}

async function downloadDefender(serverless: ServerlessConfg) {
    const { context: context, fileContent: fileContent } = serverless;

    const workspaceRoot = await getWorkspaceRoot(); if (!workspaceRoot) { return; }
    const defenderPath = path.join(context.extensionPath, 'twistlock_serverless_defender.zip');

    fs.writeFileSync(defenderPath, fileContent);

    if (!fs.existsSync(defenderPath) || fs.statSync(defenderPath).size === 0) {
        throw new Error('Failed to download defender bundle. ZIP file is empty.');
    }

    return defenderPath;

}

async function unzipDefender(serverless: ServerlessConfg, defenderPath: string) {
    const { context: context, fileContent: fileContent } = serverless;
    const workspaceRoot = await getWorkspaceRoot(); if (!workspaceRoot) { return; }

    const unzipper = (await import('unzipper')).default;
    const extractPath = path.join(context.extensionPath, 'twistlock_temp');

    await new Promise((resolve, reject) => {
        fs.createReadStream(defenderPath)
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

    const targetPath = path.join(workspaceRoot, 'twistlock');

    if (fs.existsSync(targetPath)) {
        fs.rmdirSync(targetPath, { recursive: true });
    }

    const sourcePath = path.join(extractPath, 'twistlock');
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    fs.renameSync(sourcePath, targetPath);
    fs.rmdirSync(extractPath, { recursive: true });
    
}

