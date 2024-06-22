import * as vscode from 'vscode';
import * as fs from 'fs';
//import * as xml2s from 'xml2js';
import * as path from 'path';
import { updateConfig, UpdateConfigFile } from '../../utilities/updateConfig';

export interface ServerlessConfg {
    context: vscode.ExtensionContext;
    fileContent: Buffer;
    projectFile: string[];
    consoleVersion: string;
    workspaceRoot: string;
}

// Function Name: installServerlessDefender 
// Purpose: Main function that downloads, unzips, and modifies selected files to install defender
//
//-------------------------------------------------------------------------
export async function installServerlessDefender(serverless: ServerlessConfg) {
    const { projectFile: projectFile, consoleVersion: defenderVersion } = serverless;

    const defenderPath = await downloadDefender(serverless); if (!defenderPath){ return; };
    await unzipDefender(serverless, defenderPath);
    await updateSelectProjectFile(projectFile[0], defenderVersion);
    await updateNugetConfig(serverless);
}

// Function Name: downloadDefender 
// Purpose: Writes downloaded file to workspace root
//
//-------------------------------------------------------------------------
async function downloadDefender(serverless: ServerlessConfg): Promise<string | undefined> {
    const { context: context, fileContent: fileContent } = serverless;

    const defenderPath = path.join(context.extensionPath, 'twistlock_serverless_defender.zip');
    if (!fileContent?.buffer) { 
        throw new Error('Unknown error, unable to download file.');
    };

    fs.writeFileSync(defenderPath, fileContent);

    if (!fs.existsSync(defenderPath) || fs.statSync(defenderPath).size === 0) {
        throw new Error('Failed to download defender bundle. ZIP file is empty.');
    }

    return defenderPath;
}

// Function Name: unzipDefender 
// Purpose: Extracts data from compressed file and writes contents to twistlock_temp/
//
//-------------------------------------------------------------------------
async function unzipDefender(serverless: ServerlessConfg, defenderPath: string) {
    const { context, workspaceRoot } = serverless;

    const unzipper = (await import('unzipper')).default;
    const extractPath = path.join(context.extensionPath, 'twistlock_temp');

    await new Promise((resolve, reject) => {
        fs.createReadStream(defenderPath)
            .pipe(unzipper.Extract({ path: extractPath }))
            .on('close', resolve)
            .on('error', reject);
    });

    try {
        await fs.promises.access(extractPath);
    } catch {
        throw new Error('Extraction failed. Directory does not exist.');
    }

    const extractedFiles = await fs.promises.readdir(extractPath);
    if (extractedFiles.length === 0) {
        throw new Error('Extraction failed. No files found.');
    }

    const targetPath = path.join(workspaceRoot, 'twistlock');

    try {
        await fs.promises.access(targetPath);
        await fs.promises.rm(targetPath, { recursive: true });
        console.log('Target directory removed successfully');
    } catch {
        // Target path does not exist, no need to remove
    }

    const sourcePath = path.join(extractPath, 'twistlock');
    try {
        await fs.promises.access(sourcePath);
    } catch {
        throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    try {
        await fs.promises.rename(sourcePath, targetPath);
        console.log('Source directory renamed successfully');
    } catch {
        throw new Error(`Error renaming directory`);
    }

    try {
        await fs.promises.rm(extractPath, { recursive: true });
        console.log('Extract directory removed successfully');
    } catch {
        throw new Error('Error removing extract directory');
    }
}

// Function Name: updateSelectProjectFile 
// Purpose: Adds package dependencies to the selected csproj project file
//
//-------------------------------------------------------------------------
async function updateSelectProjectFile(projectFile: string, defenderVersion: string) {
    const newContent = `    <!-- This function is protected by Prisma Cloud. Do not remove or modify this comment. -->
    <!-- https://docs.prismacloud.io/en/enterprise-edition/content-collections/runtime-security/install/deploy-defender/serverless/serverless -->
    <!-- Start of Prisma Cloud protected section -->
    <ItemGroup>
        <PackageReference Include="Twistlock" Version="${defenderVersion}" />
        <TwistlockFiles Include="twistlock\\*" Exclude="twistlock\\twistlock.${defenderVersion}.nupkg" />
    </ItemGroup>
    <ItemGroup>
        <None Include="@(TwistlockFiles)" CopyToOutputDirectory="Always" LinkBase="twistlock\\" />
    </ItemGroup>
    <!-- End of Prisma Cloud protected section -->
`;
    const newFile = '<!-- Please create a new project before deploying a Prisma Cloud Defender -->';

    await updateConfig({ 
        file: projectFile, 
        searchString: `<PackageReference Include="Twistlock" Version="${defenderVersion}" />`, 
        insertAbove: '</Project>', 
        newContent: newContent , 
        newFile: newFile 
    } as UpdateConfigFile);
}

// Function Name: updateNugetConfig 
// Purpose: Adds local package sources for defender
//
//-------------------------------------------------------------------------
export async function updateNugetConfig(serverless: ServerlessConfg) {
    const { workspaceRoot } = serverless;
    //const workspaceRoot = await getWorkspaceRoot() as string;

    const nugetFile = path.join(workspaceRoot, 'NuGet.Config');
    const searchString = '<add key="local-packages" value="./twistlock/" />';
    const insertAbove = '</configuration>';
    const newContent = `    <!-- This function is protected by Prisma Cloud. Do not remove or modify this comment. -->
    <!-- https://docs.prismacloud.io/en/enterprise-edition/content-collections/runtime-security/install/deploy-defender/serverless/serverless -->
    <!-- Start of Prisma Cloud protected section -->
    <packageSources>
    <clear />
        <add key="local-packages" value="./twistlock/" />
        <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    </packageSources>
    <!-- End of Prisma Cloud protected section -->
    `;

    const newFile = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <!-- This function is protected by Prisma Cloud. Do not remove or modify this comment. -->
    <!-- https://docs.prismacloud.io/en/enterprise-edition/content-collections/runtime-security/install/deploy-defender/serverless/serverless -->
    <!-- Start of Prisma Cloud protected section -->
    <packageSources>
    <clear />
        <add key="local-packages" value="./twistlock/" />
        <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    </packageSources>
    <!-- End of Prisma Cloud protected section -->
</configuration>`;

    await updateConfig({ 
        file: nugetFile, 
        searchString: searchString, 
        insertAbove: insertAbove, 
        newContent: newContent, 
        newFile: newFile 
    } as UpdateConfigFile);
}