import * as path from 'path';
import getWorkspaceRoot from '../../utilities/getWorkspaceRoot';
import { updateConfig, UpdateConfigFile } from '../../utilities/updateConfig';

export async function updateNugetConfig() {
    const workspaceRoot = await getWorkspaceRoot(); if (!workspaceRoot) { return; }

    const nugetFile = path.join(workspaceRoot, 'NuGet.Config');
    const searchString = '<add key="local-packages" value="./twistlock/" />';
    const insertAbove = '</configuration>';
    const newContent = `    <!-- This function is protected by Prisma Cloud. Do not remove or modify this comment.
    https://docs.prismacloud.io/en/enterprise-edition/content-collections/runtime-security/install/deploy-defender/serverless/serverless -->
    <!-- Start of Prisma Cloud protected section --> -->
    <packageSources>
    <clear />
        <add key="local-packages" value="./twistlock/" />
        <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    </packageSources>
    <!-- End of Prisma Cloud protected section --> -->`;
    await updateConfig({ file: nugetFile, searchString, insertAbove, newContent } as UpdateConfigFile);
}