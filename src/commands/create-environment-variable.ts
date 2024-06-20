import * as vscode from 'vscode';
import { createInputBox } from '../utilities/inputBox';
import { PrismaCloudAPI, ApiConfig } from '../utilities/PrismaCloudClient';
import { storeEnvironmentVariable, EnvironmentConfig } from './functions/createEnvironmentVariable';

export async function createEnvironmentVariable(context: vscode.ExtensionContext) {
    const prismaCloud = PrismaCloudAPI.getInstance();

    const functionNamePrompt = {
        prompt: 'Enter function name:', 
        placeHolder: 'myFunction123',
        title: 'Generate App Service Environment Variable' 
    };

    const functionName =  await createInputBox(functionNamePrompt); 

    const functionPayload = {
        consoleAddr: prismaCloud.getConsolePath(),
        function: functionName,
        provider: 'azure'
    };

    console.log('Payload: ', functionPayload);

    const createDefenderVariable: ApiConfig = {
        apiEndpoint: '/api/v1/policies/runtime/serverless/encode',
        isFile: false,
        headers: { 
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(functionPayload)
    };

    const appServiceVariable = await prismaCloud.makeApiCall(createDefenderVariable);

    const environmentConfig: EnvironmentConfig = {
        context: context,
        variableValue: appServiceVariable
    };

    await storeEnvironmentVariable(environmentConfig);
}