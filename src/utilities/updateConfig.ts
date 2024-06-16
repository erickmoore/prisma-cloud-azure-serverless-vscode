import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface UpdateConfigFile {
    file: string;
    searchString: string;
    insertAbove: string;
    newContent: string;
    message?: string;
}

export async function updateConfig(config: UpdateConfigFile): Promise<void> {
    const { file: filePath, searchString, insertAbove, newContent, message } = config;

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, newContent, 'utf8');
    } else {
        let existingContent = fs.readFileSync(filePath, 'utf8');
        if (!existingContent.includes(searchString)) {
            const insertIndex = existingContent.lastIndexOf(insertAbove);
            const updatedContent = existingContent.slice(0, insertIndex) + newContent + existingContent.slice(insertIndex);
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            vscode.window.showInformationMessage(message || `Configuration added to ${path.basename(filePath)}`);
        } else {
            //vscode.window.showInformationMessage(`${path.basename(filePath)} already contains the configuration.`);
        }
    }
}