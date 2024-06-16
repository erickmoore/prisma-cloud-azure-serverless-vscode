import * as vscode from 'vscode';
import { authenticate, AuthenticateConfig } from '../utilities/getAuthToken';
import { selectCsprojFile } from './functions/selectCsprojFile';
import { getExtensionSettings } from '../utilities/getExtensionSettings';
import { installDefender, InstallDefenderConfig } from './functions/installDefender';
import { createEnvironmentVariable } from './create-environment-variable';

export async function installServerlessDefender(context: vscode.ExtensionContext) {
    const prismaCloud = await getExtensionSettings(); if (!prismaCloud) { return; };

    await createEnvironmentVariable(context);

    // Prompt for Csproj File
    const project = await selectCsprojFile(); if (!project) { return; };

    const authConfig: AuthenticateConfig = {
        consolePath: prismaCloud.consolePath,
        identity: prismaCloud.identity,
        secret: prismaCloud.secret
    };

    const token = await authenticate(authConfig);

    const installDefenderConfig: InstallDefenderConfig = {
        consolePath: prismaCloud.consolePath,
        token,
        context: context,
        csprojFile: project.selectedFile
    };

    await installDefender(installDefenderConfig);

}