import * as vscode from 'vscode';
import { authenticate } from '../utilities/getAuthToken';
import { selectCsprojFile } from './functions/selectCsprojFile';
import { updateCsprojFile } from './functions/updateCsprojFile';
import { updateNugetConfig } from './functions/updateNugetConfig';
import { getConfig } from '../utilities/getConfig';
import { installDefender, InstallDefenderConfig } from './functions/installDefender';
import { createEnvironmentVariable } from './create-environment-variable';

export async function installServerlessDefender(context: vscode.ExtensionContext) {

    // Read VS Code Config Settings
    const config = await getConfig(); if (!config) { return; };

    // Create Defender App Service Environment Variable
    await createEnvironmentVariable(context);

    // Prompt for Csproj File
    const selectedCsprojFile = await selectCsprojFile(); if (!selectedCsprojFile) { return; };

    // Install Defender and Return Current Version
    const token = await authenticate(config.consolePath, config.identity, config.secret);
    const installDefenderConfig: InstallDefenderConfig = {
        consolePath: config.consolePath,
        token,
        context: context
    };

    const twistlockVersion = await installDefender(installDefenderConfig); if (!twistlockVersion) { return; };

    // Update Csproj with Defender Version
    if (selectedCsprojFile) { await updateCsprojFile(selectedCsprojFile.selectedFile, twistlockVersion); };

    // Update/Create NuGet.Config
    await updateNugetConfig(selectedCsprojFile.workspaceRoot);
}