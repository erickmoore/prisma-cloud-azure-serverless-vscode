import * as vscode from 'vscode';
import { authenticate, AuthenticateConfig } from '../utilities/getAuthToken';
import { selectCsprojFile } from './functions/selectCsprojFile';
import { getExtensionSettings } from '../utilities/getExtensionSettings';
import { installDefender, InstallDefenderConfig } from './functions/installDefender';
import { createEnvironmentVariable } from './create-environment-variable';
import { makeApiCall, ApiConfig } from '../utilities/makeApiCalls';

export async function installServerlessDefender(context: vscode.ExtensionContext) {
    const prismaCloud = await getExtensionSettings(); if (!prismaCloud) { return; };
    const { consolePath, identity, secret } = prismaCloud;

    const projectFile = await selectCsprojFile(); if (!projectFile) { return; };

    const apiCall: ApiConfig = {
        url: `${consolePath}/api/v1/defenders/serverless/bundle`,
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: { runtime: 'dotnet', provider: 'azure' }
    };

    await makeApiCall(apiCall);


    

    
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