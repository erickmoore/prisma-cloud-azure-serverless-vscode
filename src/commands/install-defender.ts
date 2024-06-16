import * as vscode from 'vscode';
import { authenticate, AuthenticateConfig } from '../utilities/getAuthToken';
import { selectCsprojFile } from './functions/selectCsprojFile';
import { getExtensionSettings } from '../utilities/getExtensionSettings';
import { installDefender, InstallDefenderConfig } from './functions/installDefender';
import { createEnvironmentVariable } from './create-environment-variable';

export async function installServerlessDefender(context: vscode.ExtensionContext) {
    const prismaCloud = await getExtensionSettings(); if (!prismaCloud) { return; };
    const project = await selectCsprojFile(); if (!project) { return; };

    const { consolePath, identity, secret } = prismaCloud;
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
        csprojFile: project.selectedFile
    };

    await installDefender(installDefenderConfig);
    await createEnvironmentVariable(context);
}