import * as fs from 'fs';
import * as path from 'path';
import { PrismaCloudAPI } from '../services/PrismaCloudClient';
import { FilePrompt, Prompts } from '../services/Prompts';

// Main Function:      [ updateProjectFiles ]
// Private Functions:  [ updateSelectProjectFile, updateNugetConfig, updateConfig ]
// Exported Functions: [ updateProjectFiles ]
//

interface UpdateFileConfig {
    file: string;
    searchString: string;
    insertAbove: string;
    newContent: string;
    newFile: string;
}

export async function updateProjectFiles() {
    const prismaCloud = await PrismaCloudAPI.getInstance();
    const filePath = PrismaCloudAPI.getWorkspaceRoot() as string; if (!filePath) { return; };
    const defenderVersion = await prismaCloud.getConsoleVersion(); if (!defenderVersion) { return; };
    const project = new Prompts;

    const promptConfig: FilePrompt = {
        fileDescription: 'C# Project File',
        fileExtension: '.csproj',
        fileSearchDirectory: filePath,
        title: 'Select project file',
        placeHolder: 'select project file...',
        fileIcon: 'file-code',
        pickMultiple: false
    };

    const selectedProjectFile = await project.filePrompt(promptConfig) as string[];
    if (!selectedProjectFile) { return; };
    
    updateSelectProjectFile(selectedProjectFile[0], defenderVersion);
    updateNugetConfig(filePath);
   
}

// Function:    updateSelectProjectFile
// Parameters:  [ projectFile: string, defenderVersion: string ]
// Calls:       updateConfig
// Returns:     none
// Purpose:     Modifies selected .csproj file to include package import for Azure serverless defender
//
function updateSelectProjectFile(projectFile: string, defenderVersion: string) {
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

    updateConfig({ 
        file: projectFile, 
        searchString: `<PackageReference Include="Twistlock" Version="${defenderVersion}" />`, 
        insertAbove: '</Project>', 
        newContent: newContent , 
        newFile: newFile 
    } as UpdateFileConfig);
}

// Function:    updateNugetConfig
// Parameters:  [ filePath: string ]
// Calls:       updateConfig
// Returns:     none
// Purpose:     Modifies NuGet.Config to include local references to serverless
//              defender packages or creates a new NuGet.Config at the specified path
//
function updateNugetConfig(filePath: string) {
    const nugetFile = path.join(filePath, 'NuGet.Config');
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

    updateConfig({ 
        file: nugetFile, 
        searchString: searchString, 
        insertAbove: insertAbove, 
        newContent: newContent, 
        newFile: newFile 
    } as UpdateFileConfig);
}

// Function:    updateConfig
// Parameters:  [ file: string, searchString: string, insertAbove: string, newContent: string, newFile: string ]
// Calls:       none
// Returns:     none
// Purpose:     Adds provided [ newContent: string ] into selected [ file: string ] provided there is no match
//              for [ searchString: string ] Content is inserted above the provided [ insertAbove: string ]
//
function updateConfig(config: UpdateFileConfig) {
    const { file, searchString, insertAbove, newContent, newFile } = config;

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, newFile);
    } else {
        let existingContent = fs.readFileSync(file, 'utf8');
        if (!existingContent.includes(searchString)) {
            const insertIndex = existingContent.lastIndexOf(insertAbove);
            const updatedContent = existingContent.slice(0, insertIndex) + newContent + existingContent.slice(insertIndex);
            fs.writeFileSync(file, updatedContent, 'utf8');

        } else {
            console.log(`${path.basename(file)} already contains Defender configuration.`);
        }
    }
}