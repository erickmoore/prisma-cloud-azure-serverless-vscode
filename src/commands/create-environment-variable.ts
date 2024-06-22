import * as vscode from 'vscode';
import { PrismaCloudAPI, ApiConfig } from '../services/PrismaCloudClient';
import { storeEnvironmentVariable, EnvironmentConfig } from './functions/createEnvironmentVariable';
import { Prompts, InputPrompt } from '../services/Prompts';

export async function createEnvironmentVariable(context: vscode.ExtensionContext) {
    const prismaCloud = PrismaCloudAPI.getInstance();
    const consolePath = await prismaCloud.getConsolePath();
    const environmentVariable = new Prompts;

    const inputConfig: InputPrompt = {
        prompt: 'Enter function name',
        title: 'Generate Serverless Defender App Service Variable',
        placeHolder: 'MyFunctionName'
    };

    const createDefenderVariable: ApiConfig = {
        apiEndpoint: '/api/v1/policies/runtime/serverless/encode',
        isFile: false,
        headers: { 
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: {
            'consoleAddr': consolePath,
            'function': await environmentVariable.inputBox(inputConfig),
            'provider': 'azure'
        }
    };

    const environmentConfig: EnvironmentConfig = {
        context: context,
        variableValue: await prismaCloud.makeApiCall(createDefenderVariable)
    };

    await storeEnvironmentVariable(environmentConfig);
}