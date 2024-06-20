import * as vscode from 'vscode';

export interface InputBoxConfig {
    prompt: string;
    placeHolder?: string;
    ignoreFocus?: boolean;
    title: string;
}

export async function createInputBox(config: InputBoxConfig){
    const {prompt, placeHolder, ignoreFocus, title} = config;

    let focus;
    if (!ignoreFocus) { focus = true; };
    if (ignoreFocus) { focus = ignoreFocus; };

    const inputData = await vscode.window.showInputBox({ 
        prompt: prompt, 
        placeHolder: placeHolder, 
        ignoreFocusOut: focus, 
        title: title
    }); 
    
    if (!inputData) { return; };

    return inputData;
}