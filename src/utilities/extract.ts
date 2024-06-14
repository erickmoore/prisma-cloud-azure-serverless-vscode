// src/commands/extract.ts
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export async function extractBundle(zipPath: string, context: vscode.ExtensionContext) {
    const unzipper = (await import('unzipper')).default;
    const extractPath = path.join(context.extensionPath, 'twistlock_temp');
    await fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: extractPath })).promise();

    if (fs.existsSync(extractPath)) {
        const files = fs.readdirSync(extractPath);
        if (files.length === 0) {
            throw new Error('Extraction failed. No files found.');
        }
        return extractPath;
    } else {
        throw new Error('Extraction failed. Directory does not exist.');
    }
}