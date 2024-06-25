// Main Function:      [ downloadDefender ]
// Private Functions:  [ downloadFile, unzipFile ]
// Exported Functions: [ downloadDefender ]
//
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaCloudAPI, ApiConfig } from '../services/PrismaCloudClient';

export interface DefenderDownload {
    context: vscode.ExtensionContext;
    fileContent: Buffer;
    extract?: boolean;
}

interface ExtractDefender {
    context: vscode.ExtensionContext;
    workspaceRoot: string;
    defenderPath: string;
}

// Function:    downloadDefender
// Parameters:  [ context: vscode.ExtensionContext ]
// Calls:       [ makeApiCall, downloadFile ]
// Returns:     none
// Purpose:     Downloads Serverless Defender in project root and extracts to twistlock/
//
export async function downloadDefender(context: vscode.ExtensionContext) {
    const prismaCloud = await PrismaCloudAPI.getInstance();
    const searchPath = PrismaCloudAPI.getWorkspaceRoot() as string; if (!searchPath) { return; };

    const downloadServerless: ApiConfig = {
        apiEndpoint: '/api/v1/defenders/serverless/bundle',
        isFile: true,
        headers: { 
            'Content-Type': 'application/json' 
        },
        method: 'POST',
        body: { 
            runtime: 'dotnet', 
            provider: 'azure' 
        }
    };

    const fileContent = await prismaCloud.makeApiCall(downloadServerless) as Buffer;
    if (!fileContent) { return; };

    await downloadFile({ 
        context: context,
        fileContent: fileContent,
        extract: true
    });
}

// Function:    downloadFile
// Parameters:  [ context: vscode.ExtensionContext, fileContent: Buffer, extract?: boolean ]
// Calls:       unzipFile
// Returns:     none
// Purpose:     Writes file buffer to twistlock_serverless_defender.zip at extension path
//
async function downloadFile(defender: DefenderDownload) {
    const { context, fileContent, extract } = defender;
    const workspaceRoot = PrismaCloudAPI.getWorkspaceRoot();

    const defenderPath = path.join(context.extensionPath, 'twistlock_serverless_defender.zip');

    if (!fileContent?.buffer) { 
        throw new Error('Unknown error, unable to download file.');
    };

    fs.writeFileSync(defenderPath, fileContent);

    if (!fs.existsSync(defenderPath) || fs.statSync(defenderPath).size === 0) {
        throw new Error('Failed to download defender bundle. ZIP file is empty.');
    }

    if (extract) { 
        const unzipDefenderConfig: ExtractDefender = {
            context: context,
            defenderPath: defenderPath,
            workspaceRoot: workspaceRoot !== undefined ? workspaceRoot : ''
        };
        await unzipFile(unzipDefenderConfig);
    }
}

// Function:    unzipFile
// Parameters:  [ context: vscode.ExtensionContext, fileContent: Buffer, extract?: boolean ]
// Calls:       none
// Returns:     none
// Purpose:     Unzips selected file to twistlock_temp, writes files to twistlock and then removed temp files
//
async function unzipFile(extract: ExtractDefender) {
    const { context, workspaceRoot, defenderPath } = extract;

    const unzipper = (await import('unzipper')).default;
    const extractPath = path.join(context.extensionPath, 'twistlock_temp');

    await new Promise((resolve, reject) => {
        fs.createReadStream(defenderPath)
            .pipe(unzipper.Extract({ path: extractPath }))
            .on('close', resolve)
            .on('error', reject);
    });

    try {
        await fs.promises.access(extractPath);
    } catch {
        throw new Error('Extraction failed. Directory does not exist.');
    }

    const extractedFiles = await fs.promises.readdir(extractPath);
    if (extractedFiles.length === 0) {
        throw new Error('Extraction failed. No files found.');
    }

    const targetPath = path.join(workspaceRoot, 'twistlock');

    try {
        await fs.promises.access(targetPath);
        await fs.promises.rm(targetPath, { recursive: true });
        console.log('Target directory removed successfully');
    } catch {
        // Target path does not exist, no need to remove
    }

    const sourcePath = path.join(extractPath, 'twistlock');
    try {
        await fs.promises.access(sourcePath);
    } catch {
        throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    try {
        await fs.promises.rename(sourcePath, targetPath);
        console.log('Source directory renamed successfully');
    } catch {
        throw new Error(`Error renaming directory`);
    }

    try {
        await fs.promises.rm(extractPath, { recursive: true });
        console.log('Extract directory removed successfully');
    } catch {
        throw new Error('Error removing extract directory');
    }
}