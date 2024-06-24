import * as fs from 'fs';
import { PrismaCloudAPI } from '../services/PrismaCloudClient';
import { FilePrompt, Prompts } from '../services/Prompts';

// Main Function:      [ initializeDefender ]
// Private Functions:  [ initializeServerlessDefender ]
// Exported Functions: [ initializeDefender ]
//

export async function initializeDefender() {
    const filePath = await PrismaCloudAPI.getWorkspaceRoot() as string;
    const project = new Prompts;

    const promptConfig: FilePrompt = {
        fileDescription: 'C# Files',
        fileExtension: '.cs',
        fileSearchDirectory: filePath,
        title: 'Initialize Serverless Defender',
        placeHolder: 'select files to initialize...',
        fileIcon: 'file-code',
        pickMultiple: true
    };

    const selectedFunctions = await project.filePrompt(promptConfig) as string[];
    if (!selectedFunctions) { return; };

    await initializeServerlessDefender(selectedFunctions);
}

// Function:    initializeServerlessDefender
// Parameters:  [ functionFiles: string[] ]
// Calls:       none
// Returns:     none
// Purpose:     Modifies selected .cs files to invoke serverless defender code
//
async function initializeServerlessDefender(functionFiles: string[]) {
    const invokeDefender = `
        // --- This function is protected by Prisma Cloud. Do not remove or modify this comment. ---
        // --- https://docs.prismacloud.io/en/enterprise-edition/content-collections/runtime-security/install/deploy-defender/serverless/serverless ---
            Twistlock.Serverless.Init(_logger);
        // --- End Prisma Cloud Initialization ---

    `;

    for (const file of functionFiles) {
        console.log(`Processing file: ${file}`);
        const fileContent = fs.readFileSync(file, 'utf8');

        if (fileContent.includes('Twistlock.Serverless.Init(_logger);')) { 
            console.log(`File: ${file} already containst Serverless config`);
            return; 
        };

        if (!fileContent) {
            console.error(`Failed to read file content: ${file}`);
            continue;
        }

        // Define regex to match methods with the 'Function' attribute and capture indentation
        const regex = /(\[Function\(".*?"\)\]\s*public\s+.*?\s+Run\s*\([\s\S]*?\)\s*\{)\s*([\n\r]?[ \t]*)/gm;

        // Check if the pattern is found
        if (!regex.test(fileContent)) {
            console.log(`No matching Run method found in file: ${file}`);
            continue;
        }

        // Insert Twistlock Serverless into file
        const updatedContent = fileContent.replace(
            regex,
            (match, p1, p2) => `${p1}\n${p2}${invokeDefender.split('\n').join(`\n${p2}`)}`
        );

        fs.writeFileSync(file, updatedContent, 'utf8');
        console.log(`Updated file: ${file}`);
    }
}