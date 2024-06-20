import * as vscode from 'vscode';
import { selectCsprojFile } from './functions/selectCsprojFile';
import { PrismaCloudAPI, ApiConfig } from '../utilities/PrismaCloudClient';
import { installServerlessDefender as defenderInstall, ServerlessConfg } from './functions/installServerlessDefender';

export async function installServerlessDefender(context: vscode.ExtensionContext) {
    const prismaCloud = PrismaCloudAPI.getInstance();

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

    const installContent: ServerlessConfg = {
        context: context,
        fileContent: await prismaCloud.makeApiCall(downloadServerless) as Buffer,
        projectFile: await selectCsprojFile() as string,
        consoleVersion: await prismaCloud.getConsoleVersion() as string,
        workspaceRoot: await prismaCloud.getWorkspaceRoot() as string
    };

    await defenderInstall(installContent);
}