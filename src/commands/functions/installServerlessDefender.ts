import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import getWorkspaceRoot from "../../utilities/getWorkspaceRoot";

interface ServerlessConfg {
    context: vscode.ExtensionContext;
    fileContent: Buffer;
    projectFile: string;
    consoleVersion: object;
}

// Function Name: installServerlessDefender 
// Purpose: Main function that downloads, unzips, and modifies selected files to install defender
//
//-------------------------------------------------------------------------
export default async function installServerlessDefender(serverless: ServerlessConfg) {
    const { projectFile: projectFile, consoleVersion: defenderVersion } = serverless;

    const defenderPath = await downloadDefender(serverless); if (!defenderPath){ return; }
    await unzipDefender(serverless, defenderPath);
    await updateSelectProjectFile(projectFile, defenderVersion);

}


// Function Name: downloadDefender 
// Purpose: Writes downloaded file to workspace root
//
//-------------------------------------------------------------------------
async function downloadDefender(serverless: ServerlessConfg) {
    const { context: context, fileContent: fileContent } = serverless;

    const workspaceRoot = await getWorkspaceRoot(); if (!workspaceRoot) { return; }
    const defenderPath = path.join(context.extensionPath, 'twistlock_serverless_defender.zip');

    if (!fileContent?.buffer) { return; };

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
    const { context: context } = serverless;
    const workspaceRoot = await getWorkspaceRoot(); if (!workspaceRoot) { return; }

    const unzipper = (await import('unzipper')).default;
    const extractPath = path.join(context.extensionPath, 'twistlock_temp');

    await new Promise((resolve, reject) => {
        fs.createReadStream(defenderPath)
            .pipe(unzipper.Extract({ path: extractPath }))
            .on('close', resolve)
            .on('error', reject);
    });

    if (!fs.existsSync(extractPath)) {
        throw new Error('Extraction failed. Directory does not exist.');
    }

    const extractedFiles = fs.readdirSync(extractPath);
    if (extractedFiles.length === 0) {
        throw new Error('Extraction failed. No files found.');
    }

    const targetPath = path.join(workspaceRoot, 'twistlock');

    if (fs.existsSync(targetPath)) {
        fs.rmdirSync(targetPath, { recursive: true });
    }

    const sourcePath = path.join(extractPath, 'twistlock');
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    fs.renameSync(sourcePath, targetPath);
    fs.rmdirSync(extractPath, { recursive: true });
    
}

// Function Name: unzipDefender 
// Purpose: Extracts data from compressed file and writes contents to twistlock_temp/
//
//-------------------------------------------------------------------------
import { updateConfig, UpdateConfigFile } from '../../utilities/updateConfig';
async function updateSelectProjectFile(projectFile: string, defenderVersion: object) {

    const searchString = `<PackageReference Include="Twistlock" Version="${defenderVersion}" />`;
    const insertAbove = '</Project>';
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

    await updateConfig({ file: projectFile, searchString, insertAbove, newContent, newFile } as UpdateConfigFile);
}