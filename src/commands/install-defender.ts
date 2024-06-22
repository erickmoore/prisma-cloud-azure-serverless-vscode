import * as vscode from 'vscode';
import { PrismaCloudAPI, ApiConfig } from '../services/PrismaCloudClient';
import { installServerlessDefender as defenderInstall, ServerlessConfg } from './functions/installServerlessDefender';
import { FilePrompt, Prompts } from '../services/Prompts';

export async function installServerlessDefender(context: vscode.ExtensionContext) {
    const prismaCloud = await PrismaCloudAPI.getInstance();
    const filePath = await PrismaCloudAPI.getWorkspaceRoot() as string;
    const consoleVersion = await prismaCloud.getConsoleVersion() as string;
    const project = new Prompts;

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

    const promptConfig: FilePrompt = {
        fileDescription: 'C# Project File',
        fileExtension: '.csproj',
        fileSearchDirectory: filePath,
        title: 'Select project file',
        placeHolder: 'select project file...',
        fileIcon: 'file-code',
        pickMultiple: false
    };

    const selectedProjectFile = await project.filePrompt(promptConfig) as string[];
    if (!selectedProjectFile) { return; };
    
    const fileContent = await prismaCloud.makeApiCall(downloadServerless) as Buffer;
    if (!fileContent) { return; };

    const installContent: ServerlessConfg = {
        context: context,
        fileContent: fileContent,
        projectFile: selectedProjectFile,
        consoleVersion: consoleVersion,
        workspaceRoot: filePath
    };

    await defenderInstall(installContent);
}