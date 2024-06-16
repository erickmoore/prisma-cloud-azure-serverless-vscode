import * as path from 'path';
import getWorkspaceRoot from '../../utilities/getWorkspaceRoot';
import { updateConfig, UpdateConfigFile } from '../../utilities/updateConfig';

export async function updateNugetConfig() {
    const workspaceRoot = await getWorkspaceRoot(); if (!workspaceRoot) { return; }

    const nugetFile = path.join(workspaceRoot, 'NuGet.Config');
    const searchString = '<add key="local-packages" value="./twistlock/" />';
    const insertAbove = '</configuration>';
    const newContent = `
    <packageSources>
    <clear />
        <add key="local-packages" value="./twistlock/" />
        <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    </packageSources>
`;

    await updateConfig({ file: nugetFile, searchString, insertAbove, newContent } as UpdateConfigFile);
}