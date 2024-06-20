import * as vscode from 'vscode';
import { PrismaCloudAPI, ApiConfig } from '../utilities/PrismaCloudClient';
import { installServerlessDefender as defenderInstall, ServerlessConfg } from './functions/installServerlessDefender';
import { FilePrompt, Prompts } from '../utilities/Prompts';

export async function installServerlessDefender(context: vscode.ExtensionContext) {
    const prismaCloud = PrismaCloudAPI.getInstance();
    const filePath = PrismaCloudAPI.getWorkspaceRoot() as string;
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
        fileIcon: 'file-code'
    };

    const installContent: ServerlessConfg = {
        context: context,
        fileContent: await prismaCloud.makeApiCall(downloadServerless) as Buffer,
        projectFile: await project.filePrompt(promptConfig) as string,
        consoleVersion: await prismaCloud.getConsoleVersion() as string,
        workspaceRoot: filePath
    };

    await defenderInstall(installContent);
}