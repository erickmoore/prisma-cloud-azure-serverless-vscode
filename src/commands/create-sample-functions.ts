import * as vscode from 'vscode';
import * as path from 'path';
import * as fse from 'fs-extra';
import { PrismaCloudAPI } from '../services/PrismaCloudClient';

// Main Function:      createSampleFunction
// Private Functions:  none
// Exported Functions: createSampleFunction
//

export async function createSampleFunction(context: vscode.ExtensionContext) {
    const filePath = context.extensionPath;
    const workspacePath = await PrismaCloudAPI.getWorkspaceRoot(); if (!workspacePath) { return; };

    const sampleFunctions = [
        {
            label: 'DNS',
            path: `${filePath}/examples/example-dns.cs`,
            picked: true
        },
        {
            label: 'Proc',
            path: `${filePath}/examples/example-proc.cs`,
            picked: true
        }
    ];

    const selectedFiles = await vscode.window.showQuickPick(sampleFunctions, {
        title: 'Test Functions',
        canPickMany: true,
        ignoreFocusOut: true,
        placeHolder: 'Choose sample functions for testing...'
    });

    if (selectedFiles && selectedFiles.length > 0) {
        for (const file of selectedFiles) {
            const sourceFilePath = file.path;
            const targetFilePath = path.join(workspacePath, path.basename(sourceFilePath));

            try {
                await fse.copy(sourceFilePath, targetFilePath);
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to copy ${file.label}`);
            }
        }
    } else {
        vscode.window.showInformationMessage('No files selected.');
    }
}