import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface FilePrompt {
    fileSearchDirectory: string;
    fileIcon?: 'file' | 'file-code';
    fileDescription: string;
    fileExtension: string;
    title: string;
    placeHolder?: string;
    pickMultiple?: boolean;
}

export interface InputPrompt {
    title: string;
    placeHolder?: string
    prompt: string
}

export class Prompts {
    public async filePrompt(file: FilePrompt): Promise<string[] | undefined> {
        const { fileSearchDirectory, fileIcon, fileDescription, fileExtension, title, placeHolder, pickMultiple } = file;
    
        const icon = fileIcon || 'file';
        const pickOption = pickMultiple || true ;
    
        const files = fs.readdirSync(fileSearchDirectory).filter(file => file.endsWith(fileExtension));
    
        const quickPickItems = files.map(file => ({
            label: `$(${icon}) ${file}`,
            description: fileDescription,
            picked: true
        }));
    
        const selectedFiles = await vscode.window.showQuickPick(quickPickItems, {
            title: title,
            placeHolder: placeHolder,
            ignoreFocusOut: true,
            canPickMany: pickOption
        });
    
        if (!selectedFiles) {
            return;
        }
    
        // Ensure selectedFiles is always an array
        const selectedFilesArray = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
    
        const returnedFiles = selectedFilesArray.map(selectedFile => 
            path.join(fileSearchDirectory, selectedFile.label.replace(`$(${icon}) `, ''))
        );
    
        return returnedFiles;
    }
    


     public async inputBox(inputConfg: InputPrompt): Promise<string | undefined> {
        const { title, placeHolder, prompt } = inputConfg;

        const inputData = await vscode.window.showInputBox({
            prompt: prompt,
            placeHolder: placeHolder,
            title: title,
            ignoreFocusOut: true
        });

        if (!inputData) { return; };
        return inputData;
     }
}