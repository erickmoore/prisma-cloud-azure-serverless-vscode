import * as fs from 'fs';

export interface ServerlessFunctions  {
    functionFiles: string[];
}

export async function initializeServerlessDefender(files: ServerlessFunctions) {
    const { functionFiles } = files;

    const invokeDefender = `
    // --- This function is protected by Prisma Cloud. Do not remove or modify this comment. ---
    // --- https://docs.prismacloud.io/en/enterprise-edition/content-collections/runtime-security/install/deploy-defender/serverless/serverless ---
        Twistlock.Serverless.Init(_logger);
    // --- End Prisma Cloud Initialization ---

    `;

    for (const file of functionFiles) {
        try {
            console.log(`Processing file: ${file}`);
            const fileContent = fs.readFileSync(file, 'utf8');

            if (!fileContent) {
                console.error(`Failed to read file content: ${file}`);
                continue;
            }

            // Define regex to match methods with the 'Function' attribute and capture indentation
            const regex = /(\[Function\(".*?"\)\]\s*public .*?\s+.*?\(.*?\)\s*\{)\s*([\n\r]?[ \t]*)/g;

            // Check if the pattern is found
            if (!regex.test(fileContent)) {
                console.log(`No matching Run method found in file: ${file}`);
                continue;
            }

            const updatedContent = fileContent.replace(
                regex,
                (match, p1, p2) => `${p1}\n${p2}${invokeDefender.split('\n').join(`\n${p2}`)}`
            );

            fs.writeFileSync(file, updatedContent, 'utf8');
            console.log(`Updated file: ${file}`);
        } catch (error) {
            console.error(`Error processing file ${file}:`, error);
        }
    }
}