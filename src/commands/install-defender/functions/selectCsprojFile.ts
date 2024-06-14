// src/commands/modifyProject.ts
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

export async function selectCsprojFile() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Error: No workspace folder is open.');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const csprojFiles = fs.readdirSync(workspaceRoot).filter(file => file.endsWith('.csproj'));

    if (csprojFiles.length === 0) {
        vscode.window.showErrorMessage('No .csproj file found in the project directory.');
        return;
    }

    const quickPickItems = csprojFiles.map(file => ({
        label: `$(file-code) ${file}`,
        description: ''
    }));

    const selectedCsprojFile = await vscode.window.showQuickPick(quickPickItems, { 
        placeHolder: 'Select the .csproj file to modify', 
        ignoreFocusOut: true, 
        title: 'Step 2 of 2' 
    });

    if (!selectedCsprojFile) {
        vscode.window.showInformationMessage('No .csproj file selected.');
        return;
    }
    
    const selectedFile = path.join(workspaceRoot, selectedCsprojFile.label.replace('$(file-code) ', ''));

    return { selectedFile, workspaceRoot };

}