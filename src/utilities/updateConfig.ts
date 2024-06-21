import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface UpdateConfigFile {
    file: string;
    searchString: string;
    insertAbove: string;
    newContent: string;
    newFile: string;
}

export async function updateConfig(config: UpdateConfigFile): Promise<void> {
    const { file, searchString, insertAbove, newContent, newFile } = config;

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, newFile);
    } else {
        let existingContent = fs.readFileSync(file, 'utf8');
        if (!existingContent.includes(searchString)) {
            const insertIndex = existingContent.lastIndexOf(insertAbove);
            const updatedContent = existingContent.slice(0, insertIndex) + newContent + existingContent.slice(insertIndex);
            fs.writeFileSync(file, updatedContent, 'utf8');

        } else {
            console.log(`${path.basename(file)} already contains Defender configuration.`);
        }
    }
}