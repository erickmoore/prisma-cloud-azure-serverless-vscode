import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface FilePrompt {
    fileSearchDirectory: string;
    fileIcon?: 'file' | 'file-code';
    fileDescription: string;
    fileExtension: string;
    title: string;
    placeHolder?: string
}

export interface InputPrompt {
    title: string;
    placeHolder?: string
    prompt: string
}

export class Prompts {

    public async filePrompt(file: FilePrompt): Promise<string | undefined> {
        const { fileSearchDirectory, fileIcon, fileDescription, fileExtension, title, placeHolder } = file;
        
        let icon: string;
        if (!fileIcon) {  icon = 'file'; };
        if (fileIcon) { icon = fileIcon; };

        const files = fs.readdirSync(fileSearchDirectory).filter(file => file.endsWith(fileExtension));

        const quickPickItems = files.map(file => ({
            label: `$(${icon}) ${file}`,
            description: fileDescription
        }));

        const selectedFile = await vscode.window.showQuickPick(quickPickItems, { 
            title: title,
            placeHolder: placeHolder,
            ignoreFocusOut: true
        });

        if (!selectedFile) { 
            //vscode.window.showInformationMessage(`No ${fileExtension} file selected.`);
            vscode.window.showInformationMessage(`No ${fileExtension} file selected.`, { modal: true });
            return;
        };

        if (selectedFile) {
            const returnedFile = path.join(fileSearchDirectory, selectedFile.label.replace(`$(${fileIcon}) `, ''));
            return returnedFile as string;
        }

        return;

     };


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