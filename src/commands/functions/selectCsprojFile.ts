// src/commands/modifyProject.ts
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import getWorkspaceRoot from '../../utilities/getWorkspaceRoot';
import { get } from 'http';

export async function selectCsprojFile() {
    const workspaceRoot = await getWorkspaceRoot(); if (!workspaceRoot) { return; }
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
        placeHolder: 'add Prisma Cloud package reference to .csproj file', 
        ignoreFocusOut: true, 
        title: 'Select .csproj file' 
    });

    if (!selectedCsprojFile) {
        vscode.window.showInformationMessage('No .csproj file selected.');
        return;
    }
    
    const selectedFile = path.join(workspaceRoot, selectedCsprojFile.label.replace('$(file-code) ', ''));

    return { selectedFile, workspaceRoot };

}