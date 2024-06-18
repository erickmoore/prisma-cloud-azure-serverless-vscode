import * as vscode from 'vscode';
import { authenticate, AuthenticateConfig } from '../utilities/getAuthToken';
import { selectCsprojFile } from './functions/selectCsprojFile';
import { getExtensionSettings } from '../utilities/getExtensionSettings';
import { installDefender, InstallDefenderConfig } from './functions/installDefender';
import { createEnvironmentVariable } from './create-environment-variable';
import { makeApiCall, ApiConfig } from '../utilities/makeApiCalls';
import { ServerlessConfg, installServerlessDefender as defenderInstall } from './functions/installServerlessDefender';

export async function installServerlessDefender(context: vscode.ExtensionContext) {
    const prismaCloud = await getExtensionSettings(); if (!prismaCloud) { return; };
    const { consolePath, identity, secret } = prismaCloud;

    const projectFile = await selectCsprojFile(); if (!projectFile) { return; };

    const getConsoleVersion: ApiConfig = {
        url: `${consolePath}/api/v1/version`,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET'
    };

    const downloadServerless: ApiConfig = {
        url: `${consolePath}/api/v1/defenders/serverless/bundle`,
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: { runtime: 'dotnet', provider: 'azure' }
    };

    const consoleVersion = await makeApiCall(getConsoleVersion); if (!consoleVersion) { return; };
    const defenderPackage = await makeApiCall(downloadServerless); 
    
    if (defenderPackage instanceof Buffer) {
        const installContent = {
            context: context,
            fileContent: defenderPackage,
            projectFile: projectFile,
            consoleVersion: consoleVersion
        };

        await defenderInstall(installContent);
    }



// new way above









    
    const authConfig: AuthenticateConfig = {
        consolePath: consolePath,
        identity: identity,
        secret: secret
    };

    const token = await authenticate(authConfig);
    const installDefenderConfig: InstallDefenderConfig = {
        consolePath: prismaCloud.consolePath,
        token: token,
        context: context,
        csprojFile: projectFile
    };

    await installDefender(installDefenderConfig);
    await createEnvironmentVariable(context);
}